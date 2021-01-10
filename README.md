## Table of contents

<!--ts-->

* [Table of contents](#table-of-contents)
* [What's Udagram Application?](#udagram-application)
* [Project Objective and Goals](#project-objective-and-goals)
* [Project Tasks](#project-tasks)
* [Prerequisite](#prerequisite)
* [Steps for a local setup (without containers)](#steps-for-a-local-setup-without-containers)
    * [S3 Setup](#s3-setup)
    * [Database Setup (PostgresSQL)](#database-setup-postgresql)
    * [Backend Setup](#backend-setup)
    * [Frontend Setup](#frontend-setup)
* [Steps for a local setup using Docker and Docker Compose](#steps-for-a-local-setup-using-docker-and-docker-compose)
    * [Prerequisites for using docker and docker compose](#prerequisites-for-using-docker-and-docker-compose)
    * [Creating the containers using docker files](#creating-the-containers-using-docker-files)
    * [Containers Orchestration using Docker Compose](#containers-orchestration-using-docker-compose)
    * [Running the services and the containers using docker compose](#running-the-services-and-the-containers-using-docker-compose)
* [Deployment using Kubernetes and MiniKube (local deployment)](#deployment-using-kubernetes-and-minikube-local-deployment)
    * [Creating Kubernetes deployment and services files using Kompose](#creating-kubernetes-deployment-and-services-files-using-kompose)
    * [Starting and Using MiniKube](#starting-and-using-minikube)
    * [Deploying the cluster (pods, containers and services) using Kubernetes CLI (kubectl)](#deploying-the-cluster-pods-containers-and-services-using-kubernetes-cli-kubectl)
    * [Run and access the deployed services locally (frontend website and backend api)](#run-and-access-the-deployed-services-locally-frontend-website-and-backend-api)
    * [Creating another replica for one of the microservices](#creating-another-replica-for-one-of-the-microservices)
    * [Configure scaling and self-healing for each service with CPU metrics](#configure-scaling-and-self-healing-for-each-service-with-cpu-metrics)
* [Deployment on AWS EKS using Kubernetes](#deployment-on-aws-eks-using-kubernetes)
    * [1. Creating an EKS Cluster](#creating-an-eks-cluster)
    * [2. Creating a Node Group in the cluster](#creating-a-node-group-in-the-cluster)
    * [3. Switch kubectl context to the EKS Cluster](#switch-kubectl-context-to-the-eks-cluster)
    * [4. Using eksctl to create EKS cluster, create Node Group, and switch kubectl Context (Alternative to setp 1,2 and 3)](#)
    * [5. Deploying the cluster (pods, containers and services) to EKS using Kubernetes CLI (kubectl)](#deploying-the-cluster-pods-containers-and-services-to-eks-using-kubernetes-cli-kubectl)
    * [6. Get pods and services info from the cluster](#get-pods-and-services-info-from-the-cluster)
    * [7. Configure HPA for each service and Accessing pods logs](#configure-hpa-for-each-service-and-accessing-pods-logs)
* [Useful Links](#useful-links)

<!--te-->

## Udagram Application

Udagram is a simple cloud application developed alongside the Udacity AWS Cloud Engineer Nanodegree. It allows users to
register and log into a web client, post photos to the feed, and process photos using an
[image filtering microservice](https://github.com/RofaeilAshaiaa/ImageFilteringMicroservice).

The project is split into two parts:

1. Frontend - Angular web application built with Ionic Framework
2. Backend RESTful API - Node-Express application

## Project Objective and Goals

we will be taking an existing monolith application and deploy it as microservices in Kubernetes on AWS.

* Refactor the monolith application to microservices.
* Set up each microservice to be run in its own Docker container.
* Set up a CI/CD pipeline to deploy the containers to Kubernetes.

we don’t want to make any feature changes to the frontend or backend code. If a user visits the frontend web
application, it should look the same regardless of whether the application is structured as a monolith or microservice.

## Project Tasks

1. **Refactor the API**

   The API code currently contains logic for both /users and /feed endpoints. Let's decompose the API code so that we
   can have two separate projects that can be run independent of one another.

   > _tip_:  Using Git is recommended, so you can revert any unwanted changes in your code!
   > You may find yourself copying a lot of duplicate code into the separate projects -- this is expected! For now,
   > focus on breaking apart the monolith, and we can focus on cleaning up the application code afterwards.

2. **Containerize the Code**

   Start with creating Dockerfiles for the frontend and backend applications. Each project should have its own
   Dockerfile.

3. **Build CI/CD Pipeline**

   After setting up your GitHub account to integrate with Travis CI, set up a GitHub repository with a .travis.yml file
   for a build pipeline to be generated.

4. **Deploy to Kubernetes**

   Deploy the Docker containers for the API applications and web application as their own pods in AWS EKS.

5. **Logging**

   Use logs to capture metrics. This can help us with debugging.

## Prerequisite

1. Make sure Node and NPM are installed on your system (if not you can download and install them
   from [here](https://nodejs.com/en/download)). This will allow you to be able to run `npm` commands.
2. Environment variables will need to be set. These environment variables include database connection details that
   should not be hard-coded into the application code. Open set_env.sh and set every value for the corresponding value
   of your local setup then run the following command in your terminal `source set_env.sh`
3. **Environment Script:**

   A file named `set_env.sh` has been prepared as an optional tool to help you configure these variables on your local
   development environment.

   We do _not_ want your credentials to be stored in git. After pulling this `starter` project, run the following
   command to tell git to stop tracking the script in git but keep it stored locally. This way, you can use the script
   for your convenience and reduce risk of exposing your credentials.
   `git rm --cached set_env.sh`

   Afterwards, we can prevent the file from being included in your solution by adding the file to our `.gitignore` file.

4. Make sure you have an AWS account before proceeding to the next steps. If you don't have an aws account, you can
   signup to a new account from [here](https://aws.amazon.com/)

5. **AWS Configuration and Credential File**:

   You Must set the aws credentials in order for the backend API node app to work properly with AWS S3
   (and other services later), otherwise you will run into many errors.

   You can set the aws credentials and configuration either by creating `/.aws/credentials` and `/.aws/config`
   as explained in the [docs here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

   or

   by setting the Environment variables to configure the AWS CLI by executing the following commands after replacing the
   values with your configurations and your credentials

   ```bash
   export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   export AWS_DEFAULT_REGION=us-west-2 
   ```

   For more details on how to do that, this is explained in more details in
   the [docs here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)

## Steps for a local setup (without containers):

### S3 Setup

1. Create AWS S3 bucket:
    1. Open AWS console and choose s3.
    2. Click on Create new bucket
    3. Set the bucket name (we named it udagram-monolith-to-microservices) and make sure that you check all public
       access to the bucket.
    4. After the bucket is created, select the bucket from the bucket list then go "Permissions".
    5. From there, edit the Bucket policy to allow read, write and delete from the bucket by adding the following

    ```JSON
    {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3AccessPolicy",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::udagram-monolith-to-microservices/*"
        },
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::udagram-monolith-to-microservices"
        }
    ]
    }
    ```

2. In order for us to run our application locally against the S3 bucket, we will need to set up the CORS configuration
   for the S3 bucket. Select the bucket from the bucket list and click on "Permissions". From there, edit the Bucket
   CORS configuration by adding the following

    ```JSON
    [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "POST",
                "GET",
                "DELETE",
                "PUT"
            ],
            "AllowedOrigins": [
                "*"
            ],
            "ExposeHeaders": []
        }
    ]
    ```

3. Note: It’s recommended that once you’re done developing locally and have the application running in AWS, you should
   trim down on the permissions to restrict access.

### Database Setup (PostgreSQL)

4. Create a PostgreSQL database either locally or on AWS RDS. Set the config values for environment variables prefixed
   with `POSTGRES_` in `set_env.sh`.
   > _tip_: if you don't want to install postgres locally you can use docker to create and run postgres container
   > instance using the following command `docker run --rm --name udagram-postgres-test -p 5432:5432 -e POSTGRES_PASSWORD
   > -e POSTGRES_DB -e POSTGRES_USERNAME -d postgres`, after that you can check your database connection by connecting
   > to the container or with any GUI tool like Postbird for more details on settings up postgres on a docker,
   > check out [this tutorial](https://www.optimadata.nl/blogs/1/n8dyr5-how-to-run-postgres-on-docker-part-1)

### Backend Setup

5. Navigate to the udagram-api folder with `cd udagram-api/`. Then download all the package dependencies, by running the
   following command:

    ```bash
    npm install .
    ```

6. To run the application locally, run:

    ```bash
    npm run dev
    ```

7. You can visit `http://localhost:8080/api/v0/feed` in your web browser to verify that the application is running. You
   should see a JSON payload.

### Frontend Setup

8. Navigate to the udagram-api folder with `cd udagram-frontend/`. Then download all the package dependencies, by
   running the following command:

    ```bash
    npm install .
    ```

9. Install Ionic Framework's Command Line tools for us to build and run the application:

    ```bash
    npm install -g ionic
    ```

10. Prepare your application by compiling them into static files.

    ```bash
    ionic build
    ```

11. Run the application locally using files created from the `ionic build` command.

    ```bash
    ionic serve
    ```

12. You can visit `http://localhost:8100` in your web browser to verify that the application is running. You should see
    a web interface.

## Steps for a local setup using Docker and Docker Compose:

### Prerequisites for using docker and docker compose:

- You need to install Docker engine, and the Docker CLI in order to be able to run containers using `Dockerfile.yml`
  file and execute commands such as `docker container`, `docker image create`, `docker run` etc. You can follow the
  instructions for your specific operating system from the official docker
  documentation [here](https://docs.docker.com/engine/install/)

- You need to install Docker Compose CLI in order to be able to run the app using `docker-compose.yml` file and execute
  commands such as `docker-compose ps`, `docker-compose up`, `docker-compose down` etc. You can follow the instructions
  for your specific operating system from the official docker
  documentation [here](https://docs.docker.com/compose/install/)

- Make sure you set up the aws credentials and configurations in your local environment as mentioned in
  the [prerequisite](#prerequisite) section. Also, make sure of the following:

  In case you set the aws credentials in .aws/credentials, mount this directory as a mounted volume (you can follow the
  instructions form [this answer](https://stackoverflow.com/questions/53442954/passing-aws-credentials-to-docker) or
  [this answer](https://stackoverflow.com/questions/36354423/which-is-the-best-way-to-pass-aws-credentials-to-docker-container)
  on stackoverflow)

  or

  In case you used the environment variables make sure you pass these environment variables to docker compose by passing
  the variables as described in the official [docs here](https://docs.docker.com/compose/environment-variables/)
  or by declaring the default environment variables in .env file as described in the official
  [docs here](https://docs.docker.com/compose/env-file/)

- Finally, make sure that you set the environment variables of each of the following in your .env in your root
  directory. Your .env file should look similar to the following file:

  ```dotenv
    POSTGRES_USERNAME=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_HOST=udagram-postgres
    POSTGRES_DB=udagram-postgres
    AWS_BUCKET=udagram-monolith-to-microservices
    AWS_REGION=us-east-1
    AWS_PROFILE=default
    JWT_SECRET=anysecret
    URL=localhost
    BACKEND_PORT=8181
    FRONTEND_PORT=8100
    NGINX_PROXY_PORT=8080
  ```

### Creating the containers using docker files

1. We navigate to `udagram-api` folder and create two files: The first one is a Dockerfile then we add the following
   content to it

```dockerfile
# we use a prebuilt Node image as our base image and defines this container
# as the first stage for using that in a multi-stage build (make sure you specify
# the same version to avoid any breaking changes that may come in later versions)
FROM node:13 AS first_stage
# Define the Working directory for any later commands
WORKDIR /usr/src/app
# copy the source files to the app directory
COPY . /usr/src/app
# Install app dependencies
RUN npm install
# we run the build process that defined in package.json file to transpile
# the typescript files to javascript files and build the project
RUN npm run build
# We define another tiny node image as the base image to make a very tiny
# container image which will reduce the finall container image
FROM node:13-slim
# set the enviroment varaibles that are passed to our container to be used from the code
ENV POSTGRES_USERNAME=$POSTGRES_USERNAME
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_HOST=$POSTGRES_HOST
ENV POSTGRES_DB=$POSTGRES_DB
ENV AWS_BUCKET=$AWS_BUCKET
ENV AWS_REGION=$AWS_REGION
ENV AWS_PROFILE=$AWS_PROFILE
ENV JWT_SECRET=$JWT_SECRET
ENV URL=$URL
# Create app directory in our new tiny container image
WORKDIR /usr/src/app
# copy the app source after being built from the first container to our new container
COPY --from=first_stage /usr/src/app/www/ /usr/src/app/
COPY --from=first_stage /usr/src/app/ /usr/src/app/
# delete unnccessary files to reduce the final container image size
RUN rm -rf www && rm -rf src
# define the Docker image's behavior at runtime and specify
# to run the server node app when the container is started
CMD ["node", "server.js"]
```

The second file is a .dockerignore file with following content to avoid adding unnecessary files to the docker image and
making the container image smaller as possible

```docker
node_modules
www
mock
```

2. We navigate to `udagram-frontend` folder and create two files: The first one is a Dockerfile then we add the
   following content to it

```dockerfile
# we use a prebuilt Node image as our base image (make sure you specify
# the same version to avoid any breaking changes that may come in later versions)
FROM node:13
# Create the app directory
WORKDIR /usr/src/app
# Install app dependencies by copying package.json
# and package-lock.json, then run npm install
COPY package*.json ./
RUN npm install
# Install ionic
RUN npm install -g @ionic/cli
# Copy app source
COPY . /usr/src/app
# we run ionic build to build the project
RUN ionic build
# Define the Docker image's behavior at runtime and specify to run the ionic
# serve command when the container is started and adding `--external` flag to
# the command to expose the ionic server to all network interfaces otherwise we
# won't be able to access the frontend website using localhost (this is explained in
# the official ionic docs website https://ionicframework.com/docs/cli/commands/serve )
CMD ["ionic", "serve", "--external"]
```

The second file is a .dockerignore file with following content to avoid adding unnecessary files to the docker image and
making the container image smaller as possible

```docker
node_modules
```

3. Navigate to the main directory of the project and create a new folder called `reverse-proxy` by executing the
   command `mkdir reverse-proxy`. Then navigate to the `reverse-proxy` folder by executing `cd reverse-proxy/`
   and create two files: The first one is a Dockerfile then we add the following content to it

```dockerfile
# we use a prebuilt nginx image as our base image (make sure you specify
# the same version to avoid any breaking changes that may come in later versions)
FROM nginx:1.19.6-alpine
# copy the nginx.conf file to the same directory that nginx conf file
# is expected to enable the nginx configurations that we want
COPY nginx.conf /etc/nginx/nginx.conf
# define the network port that this container will listen on
EXPOSE $NGINX_PROXY_PORT
# we start the nginx but not in daemon mode to stop nginx service when the container is stopped
CMD ["nginx", "-g", "daemon off;"]
```

The second file is the nginx.conf file with following content

```nginx configuration
worker_processes 1;

events { worker_connections 1024; }
error_log /dev/stdout debug;
http {
    sendfile on;
    upstream user {
        server users-microservice:8181;
    }
    upstream feed {
        server feed-microservice:8181;
    }

    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Host $server_name;

    server {
        listen 8080;
        location /api/v0/feed {
            proxy_pass         http://feed;
        }
        location /api/v0/users {
            proxy_pass         http://user;
        }
    }
}
```

> _tip_: make sure that the ports in the nginx.conf file matches the ports in the .env files
> in order for nginx and the backend server to work properly

### Containers Orchestration using Docker Compose

1. Navigate to the main directory of the project and create docker-compose.yml file and add the following content to it
    ```yaml
    version: "3.8"
    
    services:
    
    udagram-postgres:
        # we use prebuilt image as our base image (make sure you specify the same
        # version to avoid any breaking changes that may come in later versions)
        image: postgres:13.1
        # setting the container name to avoid the default generated container name so that we can
        # reference the container with their names as hosts form our codebase or from another containers
        container_name: udagram-postgres
        # we pass the environment variables defined in .env file without specifying the values
        # and they will be passed as the same named variables and with the same values they have
        environment:
            - POSTGRES_USERNAME
            - POSTGRES_PASSWORD
            - POSTGRES_DB
        # Enable port mapping from the container to the host so we can access the database on that port
        ports:
          - "5432:5432"
        # Add a named mount volume to persist the database data after container restarted or stopped.
        # Also, we need to make sure that the volume mount point is `/var/lib/postgresql/data`
        # because it's where the postgres store its data
        volumes:
          - database-data:/var/lib/postgresql/data
    
    udagram-frontend:
        build:
          context: ./udagram-frontend/
        # setting the container name to avoid the default generated container name so that we can
        # reference the container with their names as hosts form our codebase or from another containers
        container_name: udagram-frontend
        # Enable port mapping from the container to the host so we can access the frontend on that port
        ports:
          - "${FRONTEND_PORT}:${FRONTEND_PORT}"
        # we pass the environment variables defined in .env file without specifying the values
        # and they will be passed as the same named variables and with the same values they have
        environment:
          - FRONTEND_PORT
    
    udagram-backend:
        build:
          context: ./udagram-api/
        # setting the container name to avoid the default generated container name so that we can
        # reference the container with their names as hosts form our codebase or from another containers
        container_name: udagram-backend
        # Enable port mapping from the container to the host so we can access the backend on that port
        ports:
          - "${BACKEND_PORT}:${BACKEND_PORT}"
        # we pass the environment variables defined in .env file without specifying the values
        # and they will be passed as the same named variables and with the same values they have
        environment:
            - POSTGRES_USERNAME
            - POSTGRES_PASSWORD
            - POSTGRES_DB
            - POSTGRES_HOST
            - AWS_BUCKET
            - AWS_REGION
            - AWS_PROFILE
            - JWT_SECRET
            - URL
            - BACKEND_PORT
        # we bind the .aws/credentials directory as a mounted bind volume in order for the backend
        # API node app to work properly with AWS S3 (and other services later)
        volumes:
          - $HOME/.aws/credentials:/root/.aws/credentials:ro
   
   udagram-reverse-proxy:
        build:
          context: ./reverse-proxy/
        # setting the container name to avoid the default generated container name so that we can
        # reference the container with their names as hosts form our codebase or from another containers
        container_name: udagram-reverse-proxy
        # Enable port mapping from the container to the host so we can access the backend on that port
        ports:
          - "${NGINX_PROXY_PORT}:${NGINX_PROXY_PORT}"
        # we pass the environment variables defined in .env file without specifying the values
        # and they will be passed as the same named variables and with the same values they have
        environment:
          - NGINX_PROXY_PORT
   
    volumes:
      database-data:

    ```

-

### Running the services and the containers using docker compose:

1. Navigate to the main directory of the project and make sure that executing `ls` is showing docker-compose.yml file in
   the list of files.
2. Run the following command to validate and view the Compose file  `docker-compose config`.
3. Then run the command `docker-compose build` to build or rebuild the services specified in the Compose file.
4. After that, run the command `docker-compose up` to create and start containers that are specified in the Compose file
5. Open `http://localhost:8080/`, `http://localhost:8080/api/v0/feed/` and `http://localhost:8100` in your web browser
   to verify that the applications, and the services are running.
6. After testing the app and using it you can execute `docker-compose stop` to stop the running services and containers
   or you can execute `docker-compose down` to Stop and remove containers, networks, images, and volumes

## Deployment using Kubernetes and MiniKube (local deployment)

### Prerequisites for using Kubernetes and MiniKube:

- You need to install [Docker](https://docker.com) engine, and the Docker CLI in order to be able to run containers
  using `Dockerfile.yml` file and execute commands such as `docker container`, `docker image create`, `docker run` etc.
  You can follow the instructions for your specific operating system from the official docker
  documentation [here](https://docs.docker.com/engine/install/)

- You need to install The [Kubernetes](https://kubernetes.io) command-line tool, kubectl, which allows you to run
  commands against Kubernetes clusters. You can follow the instructions for your specific operating system from the
  official kubernetes documentation [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

- You need to install [MiniKube](https://minikube.sigs.k8s.io), which is local Kubernetes, focusing on making it easy to
  learn and develop for Kubernetes. You can follow the instructions for your specific operating system from the official
  MiniKube documentation [here](https://minikube.sigs.k8s.io/docs/start/)

- You need to install [Kompose](https://kompose.io), Kompose is a conversion tool for Docker Compose to container
  orchestrators such as Kubernetes. You can follow the instructions for your specific operating system from the official
  Kompose documentation [here](https://kompose.io/installation/)

### Creating Kubernetes deployment and services files using Kompose:

1. Navigate to the main directory of the project and create docker-compose.kompose.yml file and add the following
   content to it

 ```yaml
# new version of docker-compose file to work correctly with Kompose CLI conversion tool
version: "3"

services:

  postgres:
    # we use prebuilt image as our base image (make sure you specify the same
    # version to avoid any breaking changes that may come in later versions)
    image: postgres:13.1
    # setting the container name to avoid the default generated container name so that we can
    # reference the container with their names as hosts form our codebase or from another containers
    container_name: postgres
    # Expose ports without publishing them to the host machine
    expose:
      - "5432"
    # we pass the environment variables with their values
    environment:
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=udagram-postgres

  frontend:
    # specify image tag as latest to always pull the latest image that we pushed to docker hub
    image: rofaeilashaiaa/udagram-frontend:latest
    # setting the container name to avoid the default generated container name so that we can
    # reference the container with their names as hosts form our codebase or from another containers
    container_name: frontend
    # Expose ports without publishing them to the host machine
    expose:
      - "8100"
    # we pass the environment variables with their values
    environment:
      - FRONTEND_PORT=8100

  users-microservice:
    # specify image tag as latest to always pull the latest image that we pushed to docker hub
    image: rofaeilashaiaa/udagram-users-microservice:latest
    # setting the container name to avoid the default generated container name so that we can
    # reference the container with their names as hosts form our codebase or from another containers
    container_name: users-microservice
    # Expose ports without publishing them to the host machine
    expose:
      - "8181"
    # we pass the environment variables with their values
    environment:
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=udagram-postgres
      - POSTGRES_HOST=postgres
      - AWS_BUCKET=udagram-monolith-to-microservices
      - AWS_REGION=us-east-1
      - JWT_SECRET=anysecret
      - BACKEND_PORT=8181

  feed-microservice:
    # specify image tag as latest to always pull the latest image that we pushed to docker hub
    image: rofaeilashaiaa/udagram-feed-microservice:latest
    # setting the container name to avoid the default generated container name so that we can
    # reference the container with their names as hosts form our codebase or from another containers
    container_name: feed-microservice
    # we pass the environment variables with their values
    # Expose ports without publishing them to the host machine
    expose:
      - "8181"
    environment:
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=udagram-postgres
      - POSTGRES_HOST=postgres
      - AWS_BUCKET=udagram-monolith-to-microservices
      - AWS_REGION=us-east-1
      - JWT_SECRET=anysecret
      - BACKEND_PORT=8181
      - ENV_TYPE=developmentx

  reverse-proxy:
    # specify image tag as latest to always pull the latest image that we pushed to docker hub
    image: rofaeilashaiaa/udagram-reverse-proxy:latest
    # setting the container name to avoid the default generated container name so that we can
    # reference the container with their names as hosts form our codebase or from another containers
    container_name: reverse-proxy
    # Enable port mapping from the container to the host so we can access the backend on that port
    ports:
      - "8080"
    # we pass the environment variables with their values
    environment:
      - NGINX_PROXY_PORT=8080

 ```

2. Make sure you are in the main directory of the project by running `ls` and make sure that
   the `docker-compose.kompose.yml` is listed.
3. Run the command `kompose convert docker-compose.kompose.yml`, this command will convert the new and modified version
   of docker compose file to kubernetes deployment.yml and service.yml files for each container section you have in the
   docker compose file. After you run this command, you will see the following output in your terminal (which indicate
   that the deployment files, and the services files were created successfully):
   ```shell
    INFO Kubernetes file "feed-microservice-service.yaml" created 
    INFO Kubernetes file "frontend-service.yaml" created
    INFO Kubernetes file "postgres-service.yaml" created
    INFO Kubernetes file "reverse-proxy-service.yaml" created
    INFO Kubernetes file "users-microservice-service.yaml" created
    INFO Kubernetes file "feed-microservice-deployment.yaml" created
    INFO Kubernetes file "frontend-deployment.yaml" created
    INFO Kubernetes file "postgres-deployment.yaml" created
    INFO Kubernetes file "reverse-proxy-deployment.yaml" created
    INFO Kubernetes file "users-microservice-deployment.yaml" created
    ```

### Starting and Using MiniKube

4. Before deploying the kubernetes cluster on minikube, we need to make sure that minikube is running. We can run
   minikube by executing `minikube star`, minikube will take a few minutes to get the vm of the cluster up and running.
5. To make sure that minikube is ready for kubernetes deployment we first need to run `kubectl get pods -A` and wait
   until all the listed object to be running by checking the output of the previous command as shown below

   ```shell
    NAMESPACE     NAME                                  READY   STATUS    RESTARTS   AGE
    kube-system   coredns-74ff55c5b-4tvvr               1/1     Running   1          16h
    kube-system   etcd-minikube                         1/1     Running   1          16h
    kube-system   kube-apiserver-minikube               1/1     Running   1          16h
    kube-system   kube-controller-manager-minikube      1/1     Running   1          16h
    kube-system   kube-proxy-jz8r8                      1/1     Running   1          16h
    kube-system   kube-scheduler-minikube               1/1     Running   1          16h
    kube-system   storage-provisioner                   1/1     Running   3          16h
    ```

6. For additional insight into your cluster state, minikube bundles the Kubernetes Dashboard, allowing you to get easily
   acclimated to your new environment by executing `minikube dashboard` which will open the dashboard in your browser.

### Deploying the cluster (pods, containers and services) using Kubernetes CLI (kubectl)

7. Make sure you are in the main directory of the project where the generated deployment.yml and service.yml files are
   located. To deploy our kubernetes cluster we need to run the following command

   ```shell
   kubectl apply -f .
   ```

   which will take each deployment and service file in the current directory and deploy it to kubernetes and will output
   the following to the terminal

   ```shell
    deployment.apps/feed-microservice created
    service/feed-microservice created
    deployment.apps/frontend created
    service/frontend created
    deployment.apps/postgres created
    service/postgres created
    deployment.apps/reverse-proxy created
    service/reverse-proxy created
    deployment.apps/users-microservice created
    service/users-microservice created
    ```

   Or you can append the wanted files after `kubectl apply` with `-f` flag before each file as the following command

   ```shell
   kubectl apply -f feed-microservice-service.yaml -f feed-microservice-deployment.yaml
   ```

8. kubernetes will take some time (5-15 minutes) until the cluster is fully deployed as it needs to first pull the
   containers images from the container registry (docker hub), then creating each container and its replicas as
   specified. we can run `kubectl get pods -A` and wait until all the listed containers to be running by checking the
   output of the previous command as shown below

   ```shell
    NAMESPACE     NAME                                  READY   STATUS    RESTARTS   AGE
    default       feed-microservice-8695bdc88d-2jhh2    1/1     Running   1          169m
    default       frontend-c956c44f-bkc8w               1/1     Running   0          169m
    default       postgres-6f5f7f8c67-27x89             1/1     Running   0          169m
    default       reverse-proxy-7d59d5947c-k5gct        1/1     Running   0          169m
    default       users-microservice-6f4c59cbbb-mtxv8   1/1     Running   1          169m
    kube-system   coredns-74ff55c5b-4tvvr               1/1     Running   1          17h
    kube-system   etcd-minikube                         1/1     Running   1          17h
    kube-system   kube-apiserver-minikube               1/1     Running   1          17h
    kube-system   kube-controller-manager-minikube      1/1     Running   1          17h
    kube-system   kube-proxy-jz8r8                      1/1     Running   1          17h
    kube-system   kube-scheduler-minikube               1/1     Running   1          17h
    kube-system   storage-provisioner                   1/1     Running   3          17h
    ```

   Or by executing `minikube dashboard` which will open the kubernetes dashboard in your browser.

### Run and access the deployed services locally (frontend website and backend api)

9. To access the frontend service from the browser, we first need to use kubectl to forward the port of the reverse
   proxy service by executing the command `kubectl port-forward service/reverse-proxy 8080:8080` which will redirect
   requests to localhost:8080 to the reverse proxy service on port 8080 inside the cluster, and the reverse proxy will
   be available at [http://localhost:8080/](http://localhost:8080/). We can
   open [http://localhost:8080/api/v0/feed/](http://localhost:8080/api/v0/feed/) to verify that the reverse proxy
   service, the postgres service, and the feed microservice are running correctly.
   > _tip_: Leave the terminal open that you executed the command in it
   > (`kubectl port-forward service/reverse-proxy 8080:8080`) and don't close the terminal until we test both the
   > backend, and the frontend otherwise the frontend won't be able to access the reverse proxy on localhost, and
   > will give you an error `Http failure response for http://localhost:8080/api/v0/feed: 0 Unknown Error`

10. Now that our reverse proxy api is accessible on localhost, in order to access the frontend service from the browser,
    we need to use the same command that allowed kubectl to forward the port of the service in the previous step. Open a
    new terminal and execute the command `kubectl port-forward service/frontend 8100:8100` which will redirect requests
    on localhost:8100 to the frontend service on port 8100 inside the cluster, and the website will be available
    at [http://localhost:8100/](http://localhost:8100/). We can
    open [http://localhost:8100/home](http://localhost:8100/home) to verify that the frontend service is running
    correctly.

> _tip_: Uploading new post with a photo using the frontend website won't work because we haven't configured the aws
> node sdk to work inside the cluster. So, it needs to be deployed on the Amazon EKS in order for the backend service to
> be configured to access the s3 bucket after we give the EKS the permission  to do that (through adding an IAM role).
> To verify that our frontend and backend running we can create a new account using the register button and log in using
> the same account we created.

### Creating another replica for one of the microservices

11. We need to create another replica for the feed-microservice. To achieve that we need to add increase the number of
    replicas in `feed-microservice-deployment.yaml` to `2` and after that executing the
    command `kubectl apply -f feed-microservice-deployment.yaml` which will
    output `deployment.apps/feed-microservice configured` which means that the kubernetes received the new configuration
    and will update our deployment with the new configuration.
12. we can verify our new configurations by running `kubectl get pods -A` and wait until the new container to be running
    by checking the output of the previous command as shown below

```shell
    NAMESPACE     NAME                                  READY   STATUS    RESTARTS   AGE
    default       feed-microservice-8695bdc88d-2jhh2    1/1     Running   1          169m
    default       feed-microservice-8695bdc88d-tpnzg    1/1     Running   1          169m
    default       frontend-c956c44f-bkc8w               1/1     Running   0          169m
    default       postgres-6f5f7f8c67-27x89             1/1     Running   0          169m
    default       reverse-proxy-7d59d5947c-k5gct        1/1     Running   0          169m
    default       users-microservice-6f4c59cbbb-mtxv8   1/1     Running   1          169m
    kube-system   coredns-74ff55c5b-4tvvr               1/1     Running   1          17h
    kube-system   etcd-minikube                         1/1     Running   1          17h
    kube-system   kube-apiserver-minikube               1/1     Running   1          17h
    kube-system   kube-controller-manager-minikube      1/1     Running   1          17h
    kube-system   kube-proxy-jz8r8                      1/1     Running   1          17h
    kube-system   kube-scheduler-minikube               1/1     Running   1          17h
    kube-system   storage-provisioner                   1/1     Running   3          17h
```

### Configure scaling and self-healing for each service with CPU metrics

13. To configure a deployment feature that allows additional pods to be created when a CPU usage threshold is reached,
    we need to create HPA (Horizontal Pod Autoscaler) using the command
    `kubectl autoscale deployment <NAME> --cpu-percent=<CPU_PERCENTAGE>  --min=<MIN_REPLICAS> --max=<MAX_REPLICAS>`.

14. Run the previous command for the reverse proxy deployment, the users deployment and the feed deployment by executing
    the following commands:
    ```shell
    kubectl autoscale deployment reverse-proxy  --cpu-percent=70  --min=1  --max=5
    kubectl autoscale deployment users-microservice  --cpu-percent=70  --min=1  --max=5
    kubectl autoscale deployment feed-microservice  --cpu-percent=70  --min=1  --max=5
    kubectl autoscale deployment frontend  --cpu-percent=70  --min=1  --max=5
    ```
    You will see the following outputs for each of the previous command:
    ```shell
    horizontalpodautoscaler.autoscaling/reverse-proxy autoscaled
    horizontalpodautoscaler.autoscaling/users-microservice autoscaled
    horizontalpodautoscaler.autoscaling/feed-microservice autoscaled
    ```

15. To verify that we created HPA for the three deployment: the reverse proxy deployment, the users deployment and the
    feed deployment, we can execute the following command `kubectl get hpa`  which will output the following to the
    terminal:
    ```shell
    NAME                 REFERENCE                       TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
    feed-microservice    Deployment/feed-microservice    <unknown>/70%   1         5         2          2m18s
    reverse-proxy        Deployment/reverse-proxy        <unknown>/70%   1         5         1          5m36s
    users-microservice   Deployment/users-microservice   <unknown>/70%   1         5         1          2m46s
    ```
    Now if one of our pods its CPU usage increased above the specified threshold (which is 70% in our case) the
    kubernetes will create another pod (until we reach the maximum numbers specified), and the service of this
    deployment will redirect all traffic to all the available pods.

## Deployment on AWS EKS using Kubernetes

### Creating an EKS Cluster

1. Go to AWS IAM Console from [here](https://console.aws.amazon.com/iam/home) then click on `Roles` from the sidebar
   navigation menu, then click on `Create role` button.

2. After click on `Create role` button, the wizard of create a role will launch. Under `Select type of trusted entity`
   section choose the `AWS service` then select the EKS service and select `EKS - Cluster` then hit `Next: Permissions`.

3. You will get a list of the attached permissions policies, click `Next: Tags`. You will have the option to add tags to
   the role if you want, add the tag you want then hit `Next:Review`.

4. In the review screen, enter the role name you want to give to this role (and remember the name as you will use it
   later when we create a new cluster on EKS) then click on `Create Role` button. The role is now created and, we can
   use it in the next step.

5. Go to AWS EKS console from [here](https://console.aws.amazon.com/eks/home) then click on `Clusters` from the sidebar
   navigation menu, then click on `Create cluster` button.

6. After click on `Create cluster` button, the wizard of create a cluster will launch. Insert the cluster name you want
   under the cluster name. Then choose the role you created in the previous steps under the `Cluster Service Role` from
   the drop down menu. Leave other options to the defaults and click on `Next`.

7. Next step will be `Specify networking` screen. Make sure that under `Cluster endpoint access` option to
   select `Public`  and leave other options to the defaults then click on `Next`.

8. Next step will be `Configure logging`, specify logging settings that you want and click on `Next`.

9. The final step will be `Review and create`, review the options you selected then click on `Create` to create the
   cluster. the cluster will take from 5-15 minutes to be created and running.

### Creating a Node Group in the cluster

1. Make sure you first created the Amazon EKS node IAM role as we will need this role when we are creating
   the `Node Goup`. If you didn't create the role you can check the setups from the official docs
   described [here](https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html#create-worker-node-role).

1. Make sure the cluster you created in the previous steps is in `Active` state by clicking on the cluster and checking
   whether it's still creating or finished and display `Active`.

1. From the cluster details screen choose `Configuration` then click on `Compute`. From there you will get an empty list
   of `Node Groups`. Click on `Add Node Group` button to launch the wizard of creating a node group.

1. You will go the first screen of creating a node group which is `Configure Node Group`. Insert the name of the node
   group you want then leave the other options to the defaults and click on `Next`.

1. You will go the second screen of creating a node group which is `Set compute and scaling configuration`. Configure
   the EC2 instance type as you want (in our case we will choose on demand instances as our capacity type and t3 micro
   as our instance type for cost optimization). Also make sure that under `Node Group scaling configuration` you set the
   minimum size, maximum size and the desired size to 1 and click on `Next`.

1. You will go the third screen of creating a node group which is `Node Group network configuration`. make sure you
   enable the option next to `Allow remote access to nodes` and select the SSH key from the dropdown menu. if you don't
   have any SSH keys to your EC2 instances you can create one by following the steps
   documented [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html).

1. You will go the final screen of creating a node group which is `Review and create`. Review the options you selected
   then click on `Create` button to create the node group. It will take a few minutes for the node group to created (
   from 5-15 minutes).

### Switch kubectl context to the EKS Cluster

1. Run the command `aws eks --region <region-code> update-kubeconfig --name <cluster_name>` to take the kubernetes
   cluster that you created and bind it to the kubectl commands in order to control and manage our cluster from our
   local computer using the kubernetes CLI (kubectl). In our case we will run the
   command `aws eks --region us-east-1 update-kubeconfig --name Udagram` which will output to the terminal this
   message `Added new context arn:aws:eks:us-east-1:536643963445:cluster/Udagram to /home/matrix/.kube/config`.

1. To verify that our operation worked successfully we can use the command ` kubectl get svc` which will output to the
   terminal the following output
   ```shell
    NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
    kubernetes   ClusterIP   10.100.0.1   <none>        443/TCP   53m
    ```

### Using eksctl to create EKS cluster, create Node Group, and switch kubectl Context

1. Make sure you have the [eksctl CLI](https://eksctl.io) installed in your system. eksctl is a simple CLI tool for
   creating clusters on EKS - Amazon's new managed Kubernetes service for EC2 to install it You can follow the
   instructions for your specific operating system from the official
   documentation [here](https://eksctl.io/introduction/#installation)

2. Verify the installation of eksctl by executing `eksctl version` you will get a result depending on the version you
   installed, and it will be something similar to `0.35.0`.

3. Run the following command to create an eks cluster called "udagram", and a node group called "udagram" inside the
   cluster using eksctl which create a cloud formation template to create the stack:

    ```shell
    eksctl create cluster --name udagram --with-oidc --nodegroup-name udagram --nodes 1 --nodes-min 1 --nodes-max 1 --node-volume-size 10 --node-type t3.micro --timeout 60m
   ```

   We specify some flags: --nodes for the total number of nodes, --nodes-min and --nodes-max for the minimum and the
   maximum nodes in ASG, --node-volume-size for the node volume size in GB, --with-oidc to enable the IAM OIDC provider,
   --node-type for the node ec2 instance type, --nodegroup-name for the name of the nodegroup, --name the EKS cluster
   name

4. You Must create a node group after the previous command in order for kubernetes to be able to deploy you pods
   otherwise the pods will be in pending state indefinitely. You can check the steps for creating a node group using the
   aws console [here](#creating-a-node-group-in-the-cluster)

> _tip_: Before proceeding to the next step, make sure that the cluster, and the node group creation has finished,
> and the node group and, the cluster status is `Active`.

### Deploying the cluster (pods, containers and services) to EKS using Kubernetes CLI (kubectl)

1. Navigate to the main directory of the project where the deployment.yml and service.yml files are located for our
   microservices then open a terminal and run the following command

   ```shell
    kubectl apply -f feed-microservice-deployment.yaml  -f feed-microservice-service.yaml 
   -f users-microservice-deployment.yaml -f users-microservice-service.yaml -f postgres-deployment.yaml 
   -f postgres-service.yaml -f reverse-proxy-deployment.yaml -f reverse-proxy-service.yaml -f frontend-deployment.yaml 
   -f frontend-service.yaml
   ```
   You should see the following output (to verify the command was executed successfully) in the terminal

   ```shell
    deployment.apps/feed-microservice created
    service/feed-microservice created
    deployment.apps/users-microservice created
    service/users-microservice created
    deployment.apps/postgres created
    service/postgres created
    deployment.apps/reverse-proxy created
    service/reverse-proxy created
    deployment.apps/frontend created
    service/frontend created
   ```

1. To get the current info about the cluster run `kubectl cluster-info`. You should see the following output (to verify
   the command was executed successfully) in the terminal

   ```shell
    Kubernetes control plane is running at https://591211476A097BAF081C5530A06E4C91.gr7.us-east-1.eks.amazonaws.com
    CoreDNS is running at https://591211476A097BAF081C5530A06E4C91.gr7.us-east-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
    
    To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
   ```

### Get pods and services info from the cluster

To verify Kubernetes pods are deployed properly and to get information about the current pods and, their status run the
command `kubectl get pods`. You should see the following output (to verify the command was executed successfully) in the
terminal

   ```shell
    NAME                                  READY   STATUS    RESTARTS   AGE
    feed-microservice-5df8b47fc4-j7cj8    1/1     Running   0          19s
    feed-microservice-5df8b47fc4-slkwt    1/1     Running   2          113s
    frontend-79d8d79d75-qm5qw             1/1     Running   0          108s
    postgres-787545d4cc-4krjp             1/1     Running   0          111s
    reverse-proxy-fbdcd6b79-ch4tp         1/1     Running   0          109s
    users-microservice-545f6ffbcd-m8r2w   1/1     Running   2          112s
   ```

To verify Kubernetes services are properly set up `kubectl describe services`. You should see the following output (to
verify the command was executed successfully) in the terminal

   ```shell
    Name:              feed-microservice
    Namespace:         default
    Labels:            io.kompose.service=feed-microservice
    Annotations:       kompose.cmd: kompose convert -f docker-compose.kompose.yml
                       kompose.version: 1.22.0 (955b78124)
    Selector:          io.kompose.service=feed-microservice
    Type:              ClusterIP
    IP Families:       <none>
    IP:                10.100.167.93
    IPs:               <none>
    Port:              8181  8181/TCP
    TargetPort:        8181/TCP
    Endpoints:         192.168.59.219:8181,192.168.63.192:8181
    Session Affinity:  None
    Events:            <none>
    
    
    Name:              frontend
    Namespace:         default
    Labels:            io.kompose.service=frontend
    Annotations:       kompose.cmd: kompose convert -f docker-compose.kompose.yml
                       kompose.version: 1.22.0 (955b78124)
    Selector:          io.kompose.service=frontend
    Type:              ClusterIP
    IP Families:       <none>
    IP:                10.100.152.160
    IPs:               <none>
    Port:              8100  8100/TCP
    TargetPort:        8100/TCP
    Endpoints:         192.168.57.153:8100
    Session Affinity:  None
    Events:            <none>
    
    
    Name:              kubernetes
    Namespace:         default
    Labels:            component=apiserver
                       provider=kubernetes
    Annotations:       <none>
    Selector:          <none>
    Type:              ClusterIP
    IP Families:       <none>
    IP:                10.100.0.1
    IPs:               <none>
    Port:              https  443/TCP
    TargetPort:        443/TCP
    Endpoints:         192.168.73.228:443,192.168.97.218:443
    Session Affinity:  None
    Events:            <none>
    
    
    Name:              postgres
    Namespace:         default
    Labels:            io.kompose.service=postgres
    Annotations:       kompose.cmd: kompose convert -f docker-compose.kompose.yml
                       kompose.version: 1.22.0 (955b78124)
    Selector:          io.kompose.service=postgres
    Type:              ClusterIP
    IP Families:       <none>
    IP:                10.100.8.133
    IPs:               <none>
    Port:              5432  5432/TCP
    TargetPort:        5432/TCP
    Endpoints:         192.168.33.38:5432
    Session Affinity:  None
    Events:            <none>
    
    
    Name:              reverse-proxy
    Namespace:         default
    Labels:            io.kompose.service=reverse-proxy
    Annotations:       kompose.cmd: kompose convert -f docker-compose.kompose.yml
                       kompose.version: 1.22.0 (955b78124)
    Selector:          io.kompose.service=reverse-proxy
    Type:              ClusterIP
    IP Families:       <none>
    IP:                10.100.65.6
    IPs:               <none>
    Port:              8080  8080/TCP
    TargetPort:        8080/TCP
    Endpoints:         192.168.52.27:8080
    Session Affinity:  None
    Events:            <none>
    
    
    Name:              users-microservice
    Namespace:         default
    Labels:            io.kompose.service=users-microservice
    Annotations:       kompose.cmd: kompose convert -f docker-compose.kompose.yml
                       kompose.version: 1.22.0 (955b78124)
    Selector:          io.kompose.service=users-microservice
    Type:              ClusterIP
    IP Families:       <none>
    IP:                10.100.58.239
    IPs:               <none>
    Port:              8181  8181/TCP
    TargetPort:        8181/TCP
    Endpoints:         192.168.51.239:8181
    Session Affinity:  None
    Events:            <none>
   ```

### Configure HPA for each service and Accessing pods logs

1. To configure scaling and self-healing for each service with CPU metrics refer to the steps
   described [here](#configure-scaling-and-self-healing-for-each-service-with-cpu-metrics). To verify that you have
   horizontal scaling set against CPU usage run the command `kubectl describe hpa`. You should see the following
   output (to verify the command was executed successfully) in the terminal

   ```shell
    NAME                 REFERENCE                       TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
    feed-microservice    Deployment/feed-microservice    <unknown>/70%   1         5         2          55m
    frontend             Deployment/frontend             <unknown>/70%   1         5         1          54m
    reverse-proxy        Deployment/reverse-proxy        <unknown>/70%   1         5         1          55m
    users-microservice   Deployment/users-microservice   <unknown>/70%   1         5         1          55m
   ```


1. To verify that user activity is logged you can run the command `kubectl logs <your pod name>`, in our case
   it's ` kubectl logs users-microservice-545f6ffbcd-m8r2w`. You should see the following output (to verify the command
   was executed successfully) in the terminal

   ```shell
    Executing (default): CREATE TABLE IF NOT EXISTS "User" ("email" VARCHAR(255) , "passwordHash" VARCHAR(255), "createdAt" TIMESTAMP WITH TIME ZONE, "updatedAt" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("email"));
    Executing (default): SELECT i.relname AS name, ix.indisprimary AS primary, ix.indisunique AS unique, ix.indkey AS indkey, array_agg(a.attnum) as column_indexes, array_agg(a.attname) AS column_names, pg_get_indexdef(ix.indexrelid) AS definition FROM pg_class t, pg_class i, pg_index ix, pg_attribute a WHERE t.oid = ix.indrelid AND i.oid = ix.indexrelid AND a.attrelid = t.oid AND t.relkind = 'r' and t.relname = 'User' GROUP BY i.relname, ix.indexrelid, ix.indisprimary, ix.indisunique, ix.indkey ORDER BY i.relname;
    the environment port is 8181
    server running  on port 8181
    press CTRL+C to stop server
    1/10/2021, 12:18:23 AM: 98d02ccf-18ab-4ca2-8874-37ac9da50e16 - attempt to create a new user with email: email@email.com
    Executing (default): SELECT "email", "passwordHash", "createdAt", "updatedAt" FROM "User" AS "User" WHERE "User"."email" = 'email@email.com';
    Executing (default): INSERT INTO "User" ("email","passwordHash","createdAt","updatedAt") VALUES ($1,$2,$3,$4) RETURNING *;
    1/10/2021, 12:18:23 AM: 98d02ccf-18ab-4ca2-8874-37ac9da50e16 - user with email: email@email.com created successfully
    1/10/2021, 12:26:13 AM: c89889ff-23f3-4ef0-9e7d-f72118a78bb4 - User with email: email@email.com attempt to login
    Executing (default): SELECT "email", "passwordHash", "createdAt", "updatedAt" FROM "User" AS "User" WHERE "User"."email" = 'email@email.com';
    1/10/2021, 12:26:14 AM: c89889ff-23f3-4ef0-9e7d-f72118a78bb4 - User with email: email@email.com attempt to login failed
    1/10/2021, 12:26:29 AM: edfcbf3b-7169-4c33-989f-0375009308d1 - User with email: emcomail@email.com attempt to login
    Executing (default): SELECT "email", "passwordHash", "createdAt", "updatedAt" FROM "User" AS "User" WHERE "User"."email" = 'emcomail@email.com';
    1/10/2021, 12:26:29 AM: edfcbf3b-7169-4c33-989f-0375009308d1 - User with email: emcomail@email.com attempt to login failed
   ```

## Useful Links

1. Docker Images : for all images used to build this project using Kubernetes on AWS
   EKS: [frontend image](https://hub.docker.com/repository/docker/rofaeilashaiaa/udagram-frontend)
   , [reverse proxy image](https://hub.docker.com/repository/docker/rofaeilashaiaa/udagram-reverse-proxy)
   , [users microservice](https://hub.docker.com/repository/docker/rofaeilashaiaa/udagram-users-microservice)
   , [feed microservice](https://hub.docker.com/repository/docker/rofaeilashaiaa/udagram-feed-microservice)
1. [Travis CI Profile](https://travis-ci.com/github/RofaeilAshaiaa/Refactor-Monolith-to-Microservices) : Contains all
   builds that ran for our project to build and push the docker images to dockerhub