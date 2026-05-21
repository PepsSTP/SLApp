#!/usr/bin/env bash
# Runs ESLint on any TypeScript file immediately after the agent writes or edits it.
# Only active inside agent subprocess sessions (SLAPP_AGENT_SUBPROCESS=1).
[ "$SLAPP_AGENT_SUBPROCESS" = "1" ] || exit 0

file=$(printf '%s' "$CLAUDE_TOOL_INPUT" | jq -r '.file_path // .path // ""')

# Only lint TypeScript/TSX files
[[ "$file" == *.ts || "$file" == *.tsx ]] || exit 0

# Route to the correct project
if [[ "$file" == */frontend/* ]]; then
  cd "$(dirname "$file")"
  while [[ "$PWD" != "/" && ! -f "package.json" ]]; do cd ..; done
  npx eslint --no-error-on-unmatched-pattern "$file" 2>&1
elif [[ "$file" == */backend/* ]]; then
  cd "$(dirname "$file")"
  while [[ "$PWD" != "/" && ! -f "package.json" ]]; do cd ..; done
  npx eslint --no-error-on-unmatched-pattern "$file" 2>&1
fi

# Exit 0 so lint output is shown as feedback but does not hard-block the write.
# The agent reads the output and self-corrects on the next turn.
exit 0
