#!/bin/bash
# Quick script to start Vite dev server from correct directory

cd "$(dirname "$0")"
echo "Starting Vite dev server from: $(pwd)"
npm run dev
