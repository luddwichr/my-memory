#!/bin/bash

# example usage:
# convert-images ../images/traffic-signs jpg

path="$1"
ext="$2"
files="${path}/*.${ext}"

# cwebp docu: https://developers.google.com/speed/webp/docs/cwebp?hl=de
for file in $files
do
  filename="${file##*/}"
  magick "$file" -quality 90 -define webp:lossless=true "${path}/${filename%.*}.webp"
done