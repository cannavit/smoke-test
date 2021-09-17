#!/bin/sh
# RUn using bash ./file.sh
export SMOKE_TEST_CRITERIA=System_coverage;
export ENDPOINT_SWAGGER_PAGE=""
export ENDPOINT_SCANN_SWAGGER_FROM="curl -XPOST  -H 'accept-language:it' -H 'Content-type:application/json' 'http://localhost:3000/api/v5/api-docs'";

yarn serve