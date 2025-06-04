// WebRTC configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// MQTT configuration
const MQTT_BROKER = 'wss://test.mosquitto.org:8081';
const MQTT_TOPIC = 'webrtc-signaling';

// Global variables
let peers = {};
let username;
let roomId;
let mqttClient;
let connectedUsers = new Set();
let userListSyncInterval;

// Initialize the chat room
function initializeChat() {
    console.log('Initializing chat...');
    initializeMQTT();
    // Add current user to the list
    addUserToList(username);
    connectedUsers.add(username);
    
    // Start periodic user list sync
    userListSyncInterval = setInterval(syncUserList, 5000);
}

// Initialize MQTT connection
function initializeMQTT() {
    console.log('Connecting to MQTT broker...');
    mqttClient = mqtt.connect(MQTT_BROKER);
    
    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        // Subscribe to the signaling topic
        mqttClient.subscribe(MQTT_TOPIC, (err) => {
            if (!err) {
                console.log('Subscribed to signaling topic');
                // Send join message
                sendSignalingMessage({
                    type: 'join',
                    username: username,
                    roomId: roomId
                });
            } else {
                console.error('Error subscribing to topic:', err);
            }
        });
    });

    mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err);
    });

    mqttClient.on('message', (topic, message) => {
        console.log('Received MQTT message:', message.toString());
        const data = JSON.parse(message.toString());
        handleSignalingMessage(data);
    });
}

// Send signaling message
function sendSignalingMessage(message) {
    console.log('Sending signaling message:', message);
    mqttClient.publish(MQTT_TOPIC, JSON.stringify({
        ...message,
        from: username,
        roomId: roomId
    }));
}

// Sync user list across all peers
function syncUserList() {
    sendSignalingMessage({
        type: 'user-list-sync',
        users: Array.from(connectedUsers)
    });
}

// Handle incoming signaling messages
function handleSignalingMessage(data) {
    if (data.roomId !== roomId) return; // Ignore messages from other rooms

    switch (data.type) {
        case 'join':
            handleUserJoin(data);
            break;
        case 'offer':
            handleOffer(data);
            break;
        case 'answer':
            handleAnswer(data);
            break;
        case 'ice-candidate':
            handleIceCandidate(data);
            break;
        case 'leave':
            handleUserLeave(data);
            break;
        case 'user-list-sync':
            handleUserListSync(data);
            break;
    }
}

// Handle user list sync
function handleUserListSync(data) {
    if (data.from === username) return; // Ignore own sync message
    
    const remoteUsers = new Set(data.users);
    
    // Add users that are in remote list but not in local list
    remoteUsers.forEach(user => {
        if (!connectedUsers.has(user) && user !== username) {
            addUserToList(user);
            connectedUsers.add(user);
        }
    });
    
    // Remove users that are in local list but not in remote list
    connectedUsers.forEach(user => {
        if (!remoteUsers.has(user) && user !== username) {
            removeUserFromList(user);
            connectedUsers.delete(user);
        }
    });
}

// Handle user joining
function handleUserJoin(data) {
    if (data.from === username) return; // Ignore own join message
    
    // Create peer connection
    const peerConnection = createPeerConnection(data.from);
    peers[data.from] = peerConnection;

    // Create and send offer
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            sendSignalingMessage({
                type: 'offer',
                to: data.from,
                sdp: peerConnection.localDescription
            });
        });

    // Update UI
    if (!connectedUsers.has(data.from)) {
        addUserToList(data.from);
        connectedUsers.add(data.from);
        addSystemMessage(`${data.from} joined the room`);
    }
}

// Create peer connection
function createPeerConnection(peerId) {
    console.log('Creating peer connection for:', peerId);
    const peerConnection = new RTCPeerConnection(configuration);
    
    // Create data channel
    const dataChannel = peerConnection.createDataChannel('chat', {
        ordered: true,
        reliable: true
    });
    setupDataChannel(dataChannel, peerId);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('New ICE candidate:', event.candidate);
            sendSignalingMessage({
                type: 'ice-candidate',
                to: peerId,
                candidate: event.candidate
            });
        }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected' || 
            peerConnection.connectionState === 'failed' || 
            peerConnection.connectionState === 'closed') {
            handleUserLeave({ from: peerId });
        }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    return peerConnection;
}

// Setup data channel
function setupDataChannel(channel, peerId) {
    channel.onopen = () => {
        console.log(`Data channel opened with ${peerId}`);
        peers[peerId].dataChannel = channel;
        
        // Sync user list when data channel opens
        syncUserList();
    };

    channel.onclose = () => {
        console.log(`Data channel closed with ${peerId}`);
        delete peers[peerId].dataChannel;
    };

    channel.onerror = (error) => {
        console.error(`Data channel error with ${peerId}:`, error);
    };

    channel.onmessage = (event) => {
        console.log('Received message on data channel:', event.data);
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
                addMessage(data.from, data.message, false);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
}

// Handle incoming offer
function handleOffer(data) {
    console.log('Handling offer from:', data.from);
    const peerConnection = createPeerConnection(data.from);
    peers[data.from] = peerConnection;

    // Set up data channel
    peerConnection.ondatachannel = (event) => {
        console.log('Received data channel from:', data.from);
        setupDataChannel(event.channel, data.from);
    };

    peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => {
            console.log('Remote description set, creating answer');
            return peerConnection.createAnswer();
        })
        .then(answer => {
            console.log('Answer created, setting local description');
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            console.log('Sending answer to:', data.from);
            sendSignalingMessage({
                type: 'answer',
                to: data.from,
                sdp: peerConnection.localDescription
            });
        })
        .catch(error => {
            console.error('Error handling offer:', error);
        });
}

// Handle incoming answer
function handleAnswer(data) {
    console.log('Handling answer from:', data.from);
    const peerConnection = peers[data.from];
    if (peerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
            .catch(error => {
                console.error('Error setting remote description:', error);
            });
    }
}

// Handle ICE candidates
function handleIceCandidate(data) {
    console.log('Handling ICE candidate from:', data.from);
    const peerConnection = peers[data.from];
    if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            .catch(error => {
                console.error('Error adding ICE candidate:', error);
            });
    }
}

// Handle user leaving
function handleUserLeave(data) {
    if (peers[data.from]) {
        peers[data.from].close();
        delete peers[data.from];
        if (connectedUsers.has(data.from)) {
            removeUserFromList(data.from);
            connectedUsers.delete(data.from);
            addSystemMessage(`${data.from} left the room`);
        }
    }
}

// Send chat message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        console.log('Sending message to peers:', message);
        let messageSent = false;
        let activePeers = 0;
        
        // Send message to all peers
        Object.keys(peers).forEach(peerId => {
            const dataChannel = peers[peerId].dataChannel;
            if (dataChannel && dataChannel.readyState === 'open') {
                console.log('Sending to peer:', peerId);
                try {
                    dataChannel.send(JSON.stringify({
                        type: 'chat',
                        from: username,
                        message: message
                    }));
                    messageSent = true;
                    activePeers++;
                } catch (error) {
                    console.error('Error sending message to peer:', peerId, error);
                }
            } else {
                console.log('Data channel not open for peer:', peerId, 'State:', dataChannel ? dataChannel.readyState : 'no channel');
            }
        });

        if (!messageSent) {
            console.log('No active peer connections');
            addSystemMessage('No active connections. Waiting for peers to join...');
        } else {
            console.log(`Message sent to ${activePeers} peers`);
        }

        // Add message to own chat
        addMessage(username, message, true);
        messageInput.value = '';
        messageInput.focus();
    }
}

// Add message to chat
function addMessage(sender, message, isSent = false) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    
    // Create message header
    const headerElement = document.createElement('div');
    headerElement.className = 'message-header';
    headerElement.textContent = sender;
    
    // Create message content
    const contentElement = document.createElement('div');
    contentElement.textContent = message;
    
    // Append elements
    messageElement.appendChild(headerElement);
    messageElement.appendChild(contentElement);
    messagesDiv.appendChild(messageElement);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Add system message
function addSystemMessage(message) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Add user to list
function addUserToList(username) {
    const usersList = document.getElementById('usersList');
    if (!document.getElementById(`user-${username}`)) {
        const userElement = document.createElement('li');
        userElement.textContent = username;
        userElement.id = `user-${username}`;
        usersList.appendChild(userElement);
    }
}

// Remove user from list
function removeUserFromList(username) {
    const userElement = document.getElementById(`user-${username}`);
    if (userElement) {
        userElement.remove();
    }
}

// Initialize when the page loads
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    username = urlParams.get('username');
    roomId = urlParams.get('roomId');

    if (!username || !roomId) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('username').textContent = username;
    document.getElementById('roomId').textContent = roomId;

    // Focus the message input
    const messageInput = document.getElementById('messageInput');
    messageInput.focus();

    // Add welcome message
    addSystemMessage(`Welcome to room ${roomId}!`);
    addSystemMessage(`You are logged in as ${username}`);

    initializeChat();
};

// Cleanup when page unloads
window.onunload = () => {
    if (userListSyncInterval) {
        clearInterval(userListSyncInterval);
    }
    if (mqttClient) {
        sendSignalingMessage({ type: 'leave' });
        mqttClient.end();
    }
    Object.values(peers).forEach(peer => peer.close());
}; 