#!/usr/bin/env bash

# stunnel client.conf &
stunnel listener.conf &

socat -v tcp-listen:1080,reuseaddr,fork,keepalive tcp:localhost:3000
