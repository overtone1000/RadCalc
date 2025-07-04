#!/bin/bash

NGINX_CONTAINER_NAME=$(docker container ls --filter "name=nginx_nginx*" --format "{{.Names}}")
echo Container name is $NGINX_CONTAINER_NAME

echo Copying site into volume
docker exec $NGINX_CONTAINER_NAME rm -rf /var/www/html/static_content/radcalcv2
docker cp "/tmp/radcalc/" "$NGINX_CONTAINER_NAME:/var/www/html/static_content/radcalcv2"

#rm -rd /tmp/radcalc