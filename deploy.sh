#! /bin/bash
npm run build
rm -rf ../vim-golf/public/*
cp -R build/* ../vim-golf/public

