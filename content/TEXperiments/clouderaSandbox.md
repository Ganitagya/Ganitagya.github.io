+++
title = "Cloudera — Sandbox Deployment and Install Guide"
description = "Cloudera — Sandbox Deployment and Install Guide"
date = "2019-08-23"
aliases = ["data engineering", "data", "big-data"]
tags = ["docker", "cloudera", "hortonworks sandbox", "bigdata"]
author = "Akash Mahapatra"
+++

# Cloudera — Sandbox Deployment and Install Guide

Getting stuck is never fun. Especially when you’re working really hard on finishing up a project that has this “deadline” monster staring at you constantly through the skylight. I was caught up in a similar situation, on a Friday night, while working on a project involving integration with [Hortonworks Data Platform on Hortonworks Sandbox](https://www.cloudera.com/downloads/hortonworks-sandbox/hdp.html).

I was using its Docker version on an AWS Instance and due to certain reasons, which I will mention in a while, the script provided by Hortonworks was incapable to bring the necessary containers up. So, in this post, I have made a note of the steps that I took in order to resolve the issue and make the setup work.

You have to keep in mind that the setup has huge containers ( ~30GB ) and it needs to have at least 10GB of RAM to work properly. These are the [prerequisites](https://www.cloudera.com/tutorials/sandbox-deployment-and-install-guide/3.html) as mentioned by the Sandbox Deployment and Install Guide. I was using AWS Image: Docker Infrastructure Ubuntu 14.04, which comes with Ubuntu Version: 1.10.2 preinstalled. So, depending upon your Docker version, you may or may not get the errors that have been listed below.

The guide tells you to run the below command:

```
sh docker-deploy-{HDPversion}.sh
#In my case HDPVersion is 30 : docker-deploy-hdp30.sh
```

Depending upon your version of Linux, you may have to either run it as `bash`.

---

From this point onward, we may have different kinds of errors or no errors at all. I am putting the errors that I got and how I have resolved them.

The first message which popped up was:

```
+ docker run --privileged --name sandbox-hdp -h sandbox-hdp.hortonworks.com --network
flag provided but not defined: --network
See 'docker run --help'.
```

If you check docker documentation, it shows:

```
$ docker run --help | grep net  
  --net=default           Connect a container to a network
  --net-alias=[]          Add network-scoped alias for the container
```


Replace the flag from network to net in the script docker-deploy-hdp30.sh at line #40

`docker run --privileged --name $name -h $hostname --net=cda --net-alias=$hostname -d "$registry/$name:$version"`

The next error was:

```
+ docker exec -t sandbox-hdp sh -c 'rm -rf /var/run/postgresql/*; systemctl restart p
Error response from daemon: Container sandbox-hdp is not running
```


This could be due to the previous error so let’s ignore it for the time being. Following this was:

```
+ sandbox/proxy/proxy-deploy.sh
sandbox-proxy
flag provided but not defined: --network
See 'docker run --help'.
```

Upon looking into the script docker-deploy-hdp30.sh, at the last line, there is a call to another script, i.e. sandbox/proxy/proxy-deploy.sh.
Open the file sandbox/proxy/proxy-deploy.sh and replace the network flag with net as shown below. Remember to open this file as `sudo`

`docker run --name sandbox-proxy --net=cda \`

Then run only the sandbox/proxy/proxy-deploy.sh script. Do not go back and run the docker-deploy-hdp30.sh file or else you will have to make the changes again, as it creates a new sandbox/proxy/proxy-deploy.sh file everytime. When I ran it, I got the error as :

```
docker: Error response from daemon: 
failed to create endpoint sandbox-proxy on network cda: Bind for 0.0.0.0:8000 failed: 
port is already allocated.
```

So, I changed the port from 8000 to 18000 and ran the script again and it solved my problem.

---

Now the HDP setup is ready and you can play with it.

```
$ docker ps | grep sandbox-hdp
f55b44e38022   hortonworks/sandbox-hdp:3.0.1  "/usr/sbin/init"   14 minutes ago   Up 14 minutes      22/tcp, 4200/tcp, 8080/tcp    sandbox-hdp
$docker exec -it f55b44e38022 bin/bash
[root@sandbox-hdp /]# hive
0: jdbc:hive2://sandbox-hdp.hortonworks.com:2> show databases;
```

Thank you,

Cheers!!!




