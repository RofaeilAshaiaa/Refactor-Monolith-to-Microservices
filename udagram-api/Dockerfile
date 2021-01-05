# we use a prebuilt NodeJS image as our base image and defines this container
# as the first stage for using that in a multi stage build (make sure you specify
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
ENV BACKEND_PORT=$BACKEND_PORT
# Create app directory in our new tiny container image
WORKDIR /usr/src/app
# copy the app source after being built from the first container to our new container
COPY --from=first_stage /usr/src/app/www/ /usr/src/app/
COPY --from=first_stage /usr/src/app/ /usr/src/app/
# delete unnccessary files to reduce the final container image size
RUN rm -rf www && rm -rf src
# define the network port that this container will listen on
EXPOSE $BACKEND_PORT
# define the Docker image's behavior at runtime and specify
# to run the server node app when the container is started
CMD ["node", "server.js"]
