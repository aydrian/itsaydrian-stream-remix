#!/bin/sh
twitch event trigger add-redemption -F http://localhost:3000/resources/twitch/eventsub \
  -s purplemonkeydishwasher \
  -f 114823831 \
  -i "644b10b6-92ac-4f59-8baa-21c3b3cae5cb" \
  -n "Boop Atticus" \
  -C 500