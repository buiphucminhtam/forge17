#!/usr/bin/env sh
# husky.sh — Husky v10+ Bootstrap
# This file is sourced by all hook scripts.

# husky 10 deprecates ~/.huskyrc in favor of ~/.config/husky/init.sh
# We inline the minimal logic needed so this repo works with v9 AND v10.

husky_dir="$(cd "$(dirname "$(dirname "$0")")" && pwd)"
hook_dir="$husky_dir/_"
hook_name="$(basename "$0")"
hook_path="$hook_dir/$hook_name"

# Load .huskyrc if it exists (v8/v9 compatibility)
if [ -f "$hook_dir/.huskyrc" ]; then
    . "$hook_dir/.huskyrc"
fi

# Run the actual hook script if it exists
if [ -f "$hook_path" ]; then
    . "$hook_path"
fi
