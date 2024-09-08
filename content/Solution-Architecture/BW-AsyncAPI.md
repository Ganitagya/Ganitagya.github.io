+++
title = "Modern Event-Driven Application Development using TIBCO and AsyncAPI"
description = "Modern Event-Driven Application Development using TIBCO and AsyncAPI"
aliases = ["API", "API Security", "AsyncAPI"]
tags = ["asyncapi", "tibco", "enterprise integration", "flogo"]
author = "Akash Mahapatra"
+++


We have all heard about the term “API First Design” and “Cloud-Native Applications” (they generally walk hand in hand). APIs are omnipresent and sometimes we get caught up so much with them as the way of impelling data around and other technical aspects involved with the data formats, various protocols to be used, etc. that we forget they are truly about solving customer problems, enhancing developer experience, and integrating solutions.\
Traditionally, APIs have been thought of as a wrapper around a set of protocols that enables different applications or logical units to communicate as a channel supporting data exchange. But recently with the rate with which various new technologies have been developed like GRPC, GraphQl, Web-sockets, etc. applications are required to conform to the rapidly changing message exchange patterns and eventually APIs have to bear the weight of adapting to the changing formats which may take on different characteristics, be it Request/Response (REST over HTTP), Batch Based or Publish/Subscribe (events or streaming) based on the conditions. APIs help a platform to open up and evolve by accommodating new behaviors as new protocols and design patterns get introduced in the market, beyond the situations they were initially designed in, which may force even the architectural approach to change, for instance, from monolithic to microservices-based to all the way to event-driven, allowing the applications to share events outside the platform and letting developers react and build on top of events.

Nearly every application in all modern infrastructures uses APIs to connect with data sources, third party data services or other applications. With so many applications and developers dealing with APIs, it became crucial to creating a description format for API services that could be used as a standard that is vendor-neutral and platform agnostic in order for accelerating the vision of a truly connected world. It’s a pain, not having a contract similar to RAML or OpenAPI for all your messages in your systems. This is often important in modern infrastructures involving multiple interdependent applications sharing messages amongst themselves. Consider a scenario where we tend to push messages into brokers where we may have many consumers, and a case arises where several times the producer of the messages suddenly changes the message format forcing us to fall into a mess of cascading effect of changing the interdependent applications and keeping track of these changes.

REST already had the OpenAPI, RAML, and other specification formats for generating a machine-readable definition of APIs but with an increasing number of applications in IoT space and with the emergence of new models of architectures, like serverless and event processing, a new standard of machine-readable specifications are required for applications dealing with message-driven APIs.Open-source project AsyncAPI is one such community where developers are working on these new standards. AsyncAPI is an API documentation specification for how event-driven services communicate with one another. It is a specification like the OpenAPI specifically designed to define contracts and dealing with the kind of difficulties mentioned above.

## AsyncAPI Specification
The AsyncAPI Specification is a protocol-agnostic standard used to describe and document message-driven APIs in a machine-readable format, so you can use it for APIs that work over any protocol (e.g., AMQP, MQTT, WebSockets, Kafka, STOMP, HTTP, etc).

The AsyncAPI Specification defines a set of files required to describe such an API which can then be used to create utilities, such as documentation, integration and/or testing tools.

## Modern Event-Driven Application Development with TIBCO
TIBCO has been closely associated with the project since its early days enabling enterprises to build use cases for event-driven APIs. Now coming to the sum and substance of this article, i.e How to develop applications using the AsyncAPI specification and Project Flogo.
Below are the steps to develop a simple publish/subscribe application over the MQTT protocol.

### Environment Setup
Before going forward and developing we need to have certain requirements met, you need to have the following installed in your machine
1. [git](https://git-scm.com/downloads)
2. [Docker](https://www.docker.com/)
3. [Golang](https://go.dev/dl/)
4. [Flogo CLI](https://tibcosoftware.github.io/flogo/getting-started/getting-started-cli/)

### Developing the Flogo App
Once you have set up your machine with the required software as mentioned above, you can start with the development.

1. Get the Project Flogo extensions to support AsyncAPI: These will help you to convert the AsyncAPI specification to the corresponding Flogo application.\
`git clone https://github.com/project-flogo/asyncapi.git`\
`cd asyncapi/`\
`go install`

2. Make sure the above command creates an executable binary at the location `$GOPATH/bin` called `“asyncapi”`.
3.  Create a new folder and name it `FlogoAsyncMessaging`. Go to the newly created folder and create an `AsyncAPI document file`. An AsyncAPI document is a file that defines and annotates the different components of a specific Event-Driven API.\
`mkdir FlogoAsyncMessaging`\
`cd FlogoAsyncMessaging`\
`vi asyncapi.yml`\

The content of AsyncAPI document file `asyncapi.yml` can be obtained from [here](https://github.com/project-flogo/asyncapi/blob/master/examples/mqtt/asyncapi.yml).

4. Creating a Flogo application out of the `asyncapi.yml` AsyncAPI document file.\
For creating a Flogo application you need to generate the JSON file corresponding to the Go code generated above:\
`asyncapi -input asyncapi.yml -type flogodescriptor`

5. The resulting outputs are two files getting created namely `flogo.json and support.go`.

6. Create the Flogo application by using the `flogo.json` file created above.\
`flogo create -f flogo.json mqtt`\
Followed by the below set of commands:\
`mv support.go mqtt/src/`\
`cd mqtt`\
`flogo build`

7. The above command creates a Flogo executable in the location mqtt/bin namely `mqtt`.\
Alternatively, Flogo CLI also allows you to generate the Go code from the specification defined in the `AsyncAPI document file`.\
`asyncapi -input asyncapi.yml -type flogoapiapp -output .`

8. The resulting outputs are three files getting created namely `app.go, go.mod, and support.go`. We can directly build `app.go` into a working executable:\
`go build`\
This command creates a new executable namely `main`

## Testing the Flogo Application

1. Open a terminal (if you are using windows, you can use git bash) and start the MQTT server. If you don’t have a local server you can use the below command to start a docker container.
`docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto`

2. Open another terminal window and go to the location where you created the Flogo executable and run it.\
`cd FlogoAsyncMessaging/mqtt/bin`\
`./mqtt`\
This is an MQTT subscriber that is connected to the MQTT broker started in step 1 of Testing the Flogo application.

3. In a new terminal start an MQTT publisher and start publishing messages and see that the subscriber has started getting the data being sent.\
If you don’t have a local MQTT server and are using the docker container as mentioned in step 1 then follow the below steps.\
`docker ps`\
`docker exec -it <MOSQUITTO CONTAINER ID> /bin/sh`\
The syntax to publish messages to the MQTT broker is:\
`mosquitto_pub -m ‘{“message”: “hello world”}’ -t message/1`

4. If you configured everything as mentioned, you should see messages being consumed by the Flogo application as created using the AsyncAPI specification.

---

## References

1. https://www.asyncapi.com/
2. https://github.com/OAI/OpenAPI-Specification
3. https://github.com/project-flogo/asyncapi
4. https://www.tibco.com/blog/2019/08/21/tibco-teams-up-with-asyncapi-to-advance-modern-event-driven-apps/