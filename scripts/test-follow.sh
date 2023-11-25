#!/bin/sh
base_url = "https://stream.itsaydrian.com"

while getopts 'l' flag; do
  case "${flag}" in
    l) base_url="http://localhost:3000" ;;
  esac
done

twitch event trigger follow -F $base_url/resources/twitch/eventsub/itsaydrian \
  -s purplemonkeydishwasher \
  -f 114823831 \
  -i "644b10b6-92ac-4f59-8baa-21c3b3cae5cb" \
  --version 2