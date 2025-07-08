#!/bin/bash

set -e

source .env

#echo Getting container name
#NGINX_CONTAINER_NAME=$(ssh -T $SSH_DEST "docker container ls --filter \"name=nginx_nginx*\" --format \"{{.Names}}\"")

#echo Container name is $NGINX_CONTAINER_NAME

ssh -T $SSH_DEST "rm -frd /tmp/radcalc && mkdir -p /tmp/radcalc"

echo Uploading script
scp -r ./onserverscript.sh $SSH_DEST:/tmp/radcalc/

echo Uploading site
scp -r ../build/** $SSH_DEST:/tmp/radcalc/

echo Running script
ssh -T $SSH_DEST "bash /tmp/radcalc/onserverscript.sh"

echo "Does this warrant a version update? If so..."
echo "Iterate the version on the main page"
echo "Update the roadmap"
echo "Git commit"
echo "Publish a release on github"