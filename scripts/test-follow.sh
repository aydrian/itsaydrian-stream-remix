#!/bin/sh
# twitch event trigger follow -F https://stream.itsaydrian.com/resources/twitch/eventsub/itsaydrian \
twitch event trigger follow -F http://localhost:3000/resources/twitch/eventsub/itsaydrian \
  -s purplemonkeydishwasher \
  -f 114823831 \
  -i "644b10b6-92ac-4f59-8baa-21c3b3cae5cb" \
  --version 2