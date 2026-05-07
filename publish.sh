#!/usr/bin/env sh
set -eu

remote="${PUBLISH_REMOTE:-origin}"
branch="${PUBLISH_BRANCH:-main}"
message="${1:-Update website}"
upstream="$remote/$branch"

git fetch "$remote" "$branch"

if git rev-parse --verify "$upstream" >/dev/null 2>&1; then
  if ! git merge-base --is-ancestor "$upstream" HEAD; then
    echo "Your local site is behind GitHub. Run this first:"
    echo "  git pull --rebase $remote $branch"
    echo
    echo "Publish stopped so the live website is not overwritten with an older copy."
    exit 1
  fi
fi

git add -A

if git diff --cached --quiet; then
  echo "No website changes to publish."
  exit 0
fi

git commit -m "$message"
git push "$remote" "$branch"

echo "Published. GitHub Pages will update automatically."
