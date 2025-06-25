#!/bin/bash

CONTAINER_NAME=radcalc_dev_server

podman stop $CONTAINER_NAME
podman rm $CONTAINER_NAME

set -e

podman run \
    --name $CONTAINER_NAME \
    --detach \
    --mount type=bind,src=src/site,target=/var/www/html/radcalc \
    --mount type=bind,src=dev/nginx/nginx.conf,target=/etc/nginx/nginx.conf \
    -p "1234:80" \
    nginx

echo
echo "http://localhost:1234"
echo