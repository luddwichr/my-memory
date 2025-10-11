#!/bin/bash

# example usage:
# convert-images ../images/traffic-signs jpg

path="$1"
ext="$2"
files="${path}/*.${ext}"

# cwebp documentation: https://developers.google.com/speed/webp/docs/cwebp?hl=de
# install cwebp via `sudo apt install webp`
for file in $files
do
  filename="${file##*/}"
  cwebp -short -q 90 "$file" -o "${path}/${filename%.*}.webp"
done