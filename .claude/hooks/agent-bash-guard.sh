#!/usr/bin/env bash
# Only active inside agent subprocess sessions (SLAPP_AGENT_SUBPROCESS=1).
# Blocks commands that the developer/reviewer agents must never run.
[ "$SLAPP_AGENT_SUBPROCESS" = "1" ] || exit 0

cmd=$(printf '%s' "$CLAUDE_TOOL_INPUT" | jq -r '.command // ""')

if printf '%s' "$cmd" | grep -qE '(git push|git config --global|\bcurl |\bwget |\brm -rf\b|npm install|npm ci\b)'; then
    printf 'BLOCKED by agent-bash-guard: %s\n' "$cmd" >&2
    exit 2
fi
