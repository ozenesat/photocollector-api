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
      "photoId": "'"${PHOTOID}"'",
      "photographer": "'"${PHOTOGRAPHER}"'",
      "portfolio": "'"${PORTFOLIO}"'",
      "title": "'"${TITLE}"'",
      "comment": "'"${COMMENT}"'",
      "rating": "'"${RATING}"'"
    }
  }'

echo
