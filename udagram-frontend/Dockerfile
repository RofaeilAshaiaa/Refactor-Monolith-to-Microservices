# we use a prebuilt Node image as our base image (make sure you specify
# the same version to avoid any breaking changes that may come in later versions)
FROM node:13-alpine
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
# define the network port that this container will listen on
EXPOSE $FRONTEND_PORT
# Define the Docker image's behavior at runtime and specify to run the ionic
# serve command when the container is started and adding `--external` flag to
# the command to expose the ionic server to all network interfaces otherwise we
# won't be able to access the frontend website using localhost (this is explained in
# the official ionic docs website https://ionicframework.com/docs/cli/commands/serve )
CMD ["ionic", "serve", "--external"]
