#!/bin/bash

if [ ! -e server.js ]
then
	echo "Error: could not find main application server.js file"
	echo "You should run the generate-jwt-keys.sh script from the mainapplication root directory"
	echo "i.e: bash scripts/generate-jwt-keys.sh"
	exit -1
fi

echo "Generating self-signed certificates..."
mkdir -p ./config/jwttokens
ssh-keygen -t rsa -b 4096 -m PEM -f ./config/jwttokens/jwt_rsa
openssl rsa -in ./config/jwttokens/jwt_rsa -pubout -outform PEM -out ./config/jwttokens/jwt_rsa.pub
chmod 600 ./config/jwttokens/jwt_rsa ./config/jwttokens/jwt_rsa.pub