#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server 7811 &
S=$!
sleep 1
open "http://localhost:7811"
wait $S
