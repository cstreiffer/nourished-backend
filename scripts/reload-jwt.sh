#!/bin/bash

mkdir config/jwttokens
echo $JWT_RSA > config/jwttokens/jwt_rsa
echo $JWT_RSA_PUB > config/jwttokens/jwt_rsa.pub
chmod 600 config/jwttokens/jwt_rsa
chmod 600 config/jwttokens/jwt_rsa.pub