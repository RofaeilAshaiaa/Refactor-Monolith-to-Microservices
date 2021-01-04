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