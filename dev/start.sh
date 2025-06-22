#!/bin/bash

podman run \
    --mount type=bind,src=src/site,target=/var/www/html/radcalc \
    --mount type=bind,src=dev/nginx/nginx.conf,target=/etc/nginx/nginx.conf \
    -p "1234:80" \
    nginx