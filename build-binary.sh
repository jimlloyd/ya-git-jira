#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

docker buildx build \
    --output type=local,dest="$SCRIPT_DIR/target" \
    --target export \
    "$SCRIPT_DIR"

echo "Binary available at $SCRIPT_DIR/target/gitj"
