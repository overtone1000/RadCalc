#!/bin/bash

NGINX_CONTAINER_NAME=nginx

echo Copying site into volume
podman exec $NGINX_CONTAINER_NAME rm -rf /var/www/html/static_content/radcalcv2
podman cp "/tmp/radcalc/" "$NGINX_CONTAINER_NAME:/var/www/html/static_content/radcalcv2"

#rm -rd /tmp/radcalc