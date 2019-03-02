#!/bin/bash
SOURCE_IMAGE=list-lemur.png
FAV_SOURCE_IMAGE=close-up-list-lemur.png
# create smaller versions of $SOURCE_IMAGE
convert -resize 144x144 $SOURCE_IMAGE icon_144x144.png
convert -resize 96x96 $SOURCE_IMAGE icon_96x96.png
convert -resize 64x64 $SOURCE_IMAGE icon_64x64.png
convert -resize 32x32 $SOURCE_IMAGE icon_32x32.png
convert -resize 16x16 $SOURCE_IMAGE icon_16x16.png

convert -resize 96x96 $FAV_SOURCE_IMAGE fav-icon_96x96.png
convert -resize 64x64 $FAV_SOURCE_IMAGE fav-icon_64x64.png
convert -resize 32x32 $FAV_SOURCE_IMAGE fav-icon_32x32.png
convert -resize 16x16 $FAV_SOURCE_IMAGE fav-icon_16x16.png
