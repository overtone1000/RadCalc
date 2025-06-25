#!/bin/bash

set -e

source .env

SSH_DEST=root@$SERVER_IP

#echo Getting container name
#NGINX_CONTAINER_NAME=$(ssh -T $SSH_DEST "docker container ls --filter \"name=nginx_nginx*\" --format \"{{.Names}}\"")

#echo Container name is $NGINX_CONTAINER_NAME

echo Uploading script
scp -r ./onserverscript.sh root@$SERVER_IP:/tmp/radcalc/

echo Uploading site
scp -r ../src/site root@$SERVER_IP:/tmp/radcalc/

echo Running script
ssh -T $SSH_DEST "bash /tmp/radcalc/onserverscript.sh"