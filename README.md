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
* [Tips](#tips)

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
   > You may find yourself copying a lot of duplicate code into the separate projects -- this is expected! For now, focus on breaking apart the monolith and we can focus on cleaning up the application code afterwards.

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

4. **AWS Configuration and Credential File**:

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
    ```
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

    ```
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
   > _tip_: if you don't want to install postgres locally you can use docker to create and run postgres container instance using the following command
   > `docker run --rm --name udagram-postgres-test -p 5432:5432 -e POSTGRES_PASSWORD -e POSTGRES_DB -e POSTGRES_USERNAME -d postgres`, after that you can check your database connection by connecting to the container or with any GUI tool like Postbird for more details on settings up postgres on a docker, check out [this tutorial](https://www.optimadata.nl/blogs/1/n8dyr5-how-to-run-postgres-on-docker-part-1)

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
events {
}
http {
    server {
        listen 8080;
        location /api/ {
            proxy_pass http://udagram-backend:8181/;
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

### Running the services and the containers using docker compose:

1. Navigate to the main directory of the project and make sure that executing `ls` is showing docker-compose.yml file in
   the list of files.
2. Run the following command to validate and view the Compose file  `docker-compose config`.
3. Then run the command `docker-compose build` to build or rebuild the services specified in the Compose file.
4. After that, run the command `docker-compose up` to create and start containers that are specified in the Compose file
5. Open `http://localhost:8181/api/v0/feed`, `http://localhost:8080/api/`  and `http://localhost:8100` in your web
   browser to verify that the applications, and the services are running.
6. After testing the app and using it you can execute `docker-compose stop` to stop the running services and containers
   or you can execute `docker-compose down` to Stop and remove containers, networks, images, and volumes

### Tips

1. Take a look at `udagram-api` -- does it look like we can divide it into two modules to be deployed as separate
   microservices?
2. The `.dockerignore` file is included for your convenience to not copy `node_modules`. Copying this over into a Docker
   container might cause issues if your local environment is a different operating system than the Docker image (ex.
   Windows or MacOS vs. Linux).
3. It's useful to "lint" your code so that changes in the codebase adhere to a coding standard. This helps alleviate
   issues when developers use different styles of coding. `eslint` has been set up for TypeScript in the codebase for
   you. To lint your code, run the following:
    ```bash
    npx eslint --ext .js,.ts src/
    ```
   To have your code fixed automatically, run
    ```bash
    npx eslint --ext .js,.ts src/ --fix
    ```
4. Over time, our code will become outdated and inevitably run into security vulnerabilities. To address them, you can
   run:
    ```bash
    npm audit fix
    ```
5. In `set_env.sh`, environment variables are set with `export $VAR=value`. Setting it this way is not permanent; every
   time you open a new terminal, you will have to run `set_env.sh` to reconfigure your environment variables. To verify
   if your environment variable is set, you can check the variable with a command like `echo $POSTGRES_USERNAME`.
