# Udagram Application

Udagram is a simple cloud application developed alongside the Udacity AWS Cloud Engineer Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

The project is split into two parts:
1. Frontend - Angular web application built with Ionic Framework
2. Backend RESTful API - Node-Express application

### Prerequisite
1. Make sure Node and NPM are installed on your system (if not you can download and install them
   from [here](https://nodejs.com/en/download)). This will allow you to be able to run `npm` commands.
2. Environment variables will need to be set. These environment variables include database connection details that should not be hard-coded into the application code. Open set_env.sh and set every value for the corresponding value of your local setup then run the following command in
   your terminal `source set_env.sh`
3. #### Environment Script
    A file named `set_env.sh` has been prepared as an optional tool to help you configure these variables on your local development environment.
 
    We do _not_ want your credentials to be stored in git. After pulling this `starter` project, run the following command to tell git to stop tracking the script in git but keep it stored locally. This way, you can use the script for your convenience and reduce risk of exposing your credentials.
`git rm --cached set_env.sh`

    Afterwards, we can prevent the file from being included in your solution by adding the file to our `.gitignore` file.

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

### Database Setup

4. Create a PostgreSQL database either locally or on AWS RDS. Set the config values for environment variables prefixed with `POSTGRES_` in `set_env.sh`.
   > _tip_: if you don't want to install postgres locally you can use docker to create and run postgres container instance using the following command
   `docker run --rm --name udagram-postgres-test -p 5432:5432 -e POSTGRES_PASSWORD -e POSTGRES_DB -e POSTGRES_USERNAME -d postgres`, after that you can
   check your database connection by connecting to the container or with any GUI tool like Postbird for more details on
   settings up postgres on a docker, check
   out [this tutorial](https://www.optimadata.nl/blogs/1/n8dyr5-how-to-run-postgres-on-docker-part-1)

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

## Steps for a local setup using Docker Compose:

## Tips
1. Take a look at `udagram-api` -- does it look like we can divide it into two modules to be deployed as separate microservices?
2. The `.dockerignore` file is included for your convenience to not copy `node_modules`. Copying this over into a Docker container might cause issues if your local environment is a different operating system than the Docker image (ex. Windows or MacOS vs. Linux).
3. It's useful to "lint" your code so that changes in the codebase adhere to a coding standard. This helps alleviate issues when developers use different styles of coding. `eslint` has been set up for TypeScript in the codebase for you. To lint your code, run the following:
    ```bash
    npx eslint --ext .js,.ts src/
    ```
    To have your code fixed automatically, run
    ```bash
    npx eslint --ext .js,.ts src/ --fix
    ```
4. Over time, our code will become outdated and inevitably run into security vulnerabilities. To address them, you can run:
    ```bash
    npm audit fix
    ```
5. In `set_env.sh`, environment variables are set with `export $VAR=value`. Setting it this way is not permanent; every time you open a new terminal, you will have to run `set_env.sh` to reconfigure your environment variables. To verify if your environment variable is set, you can check the variable with a command like `echo $POSTGRES_USERNAME`.
