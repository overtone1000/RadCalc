#!/bin/bash

sudo docker context use default

sudo docker stack deploy --compose-file stack.yml rad_calc_dev