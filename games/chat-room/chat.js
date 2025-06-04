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

// Initialize the chat room
function initializeChat() {
    initializeMQTT();
    // Add current user to the list
    addUserToList(username);
    connectedUsers.add(username);
}

// Initialize MQTT connection
function initializeMQTT() {
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
            }
        });
    });

    mqttClient.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());
        handleSignalingMessage(data);
    });
}

// Send signaling message
function sendSignalingMessage(message) {
    mqttClient.publish(MQTT_TOPIC, JSON.stringify({
        ...message,
        from: username,
        roomId: roomId
    }));
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
    }
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
    const peerConnection = new RTCPeerConnection(configuration);
    
    // Create data channel
    const dataChannel = peerConnection.createDataChannel('chat');
    setupDataChannel(dataChannel, peerId);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignalingMessage({
                type: 'ice-candidate',
                to: peerId,
                candidate: event.candidate
            });
        }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected') {
            handleUserLeave({ from: peerId });
        }
    };

    return peerConnection;
}

// Setup data channel
function setupDataChannel(channel, peerId) {
    channel.onopen = () => {
        console.log(`Data channel opened with ${peerId}`);
        peers[peerId].dataChannel = channel;
        if (!connectedUsers.has(peerId)) {
            addUserToList(peerId);
            connectedUsers.add(peerId);
        }
    };

    channel.onclose = () => {
        console.log(`Data channel closed with ${peerId}`);
        delete peers[peerId].dataChannel;
        if (connectedUsers.has(peerId)) {
            removeUserFromList(peerId);
            connectedUsers.delete(peerId);
        }
    };

    channel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
            addMessage(data.from, data.message, false);
        }
    };
}

// Handle incoming offer
function handleOffer(data) {
    const peerConnection = createPeerConnection(data.from);
    peers[data.from] = peerConnection;

    // Set up data channel
    peerConnection.ondatachannel = (event) => {
        setupDataChannel(event.channel, data.from);
    };

    peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            sendSignalingMessage({
                type: 'answer',
                to: data.from,
                sdp: peerConnection.localDescription
            });
        });
}

// Handle incoming answer
function handleAnswer(data) {
    const peerConnection = peers[data.from];
    if (peerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    }
}

// Handle ICE candidates
function handleIceCandidate(data) {
    const peerConnection = peers[data.from];
    if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
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
        // Send message to all peers
        Object.keys(peers).forEach(peerId => {
            const dataChannel = peers[peerId].dataChannel;
            if (dataChannel && dataChannel.readyState === 'open') {
                dataChannel.send(JSON.stringify({
                    type: 'chat',
                    from: username,
                    message: message
                }));
            }
        });

        // Add message to own chat
        addMessage(username, message, true);
        messageInput.value = '';
    }
}

// Add message to chat
function addMessage(sender, message, isSent = false) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    messageElement.innerHTML = `
        <div class="message-header">${sender}</div>
        <div>${message}</div>
    `;
    messagesDiv.appendChild(messageElement);
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

    initializeChat();
};

// Cleanup when page unloads
window.onunload = () => {
    if (mqttClient) {
        sendSignalingMessage({ type: 'leave' });
        mqttClient.end();
    }
    Object.values(peers).forEach(peer => peer.close());
}; 