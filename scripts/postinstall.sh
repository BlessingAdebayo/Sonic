#!/bin/sh

# source .env if it exists
set -a
[ -f .env ] && . .env

if [ -z "$NOT_VERCEL" ]; then
  echo "NOT_VERCEL is not set, skipping patching"
  exit 0
fi

if ! grep -q '"next": "12.3.1"' package.json; then
  echo "Next.js version is not 12.3.1, patching is not supported"
  exit 1
fi

echo "Patches applied locally, no need to run postinstall.sh"