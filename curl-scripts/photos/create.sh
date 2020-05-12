#!/bin/bash

API="http://localhost:4741"
URL_PATH="/photos"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "photo": {
      "photoUrl": "'"${PHOTOURL}"'",
      "photographer": "'"${PHOTOGRAPHER}"'",
      "title": "'"${TITLE}"'",
      "comment": "'"${COMMENT}"'"
    }
  }'

echo
