#!/bin/bash

echo "🔍 EVA DevBench - Pre-Push Verification"
echo "========================================"
echo ""

echo "📍 Current Repository Configuration:"
echo "-----------------------------------"
git remote -v
echo ""

echo "🌿 Current Branch:"
echo "----------------"
git branch --show-current
echo ""

echo "📊 Git Status:"
echo "-------------"
git status --short | head -20
echo ""

TOTAL_FILES=$(git status --short | wc -l)
if [ $TOTAL_FILES -gt 20 ]; then
    echo "... and $(($TOTAL_FILES - 20)) more files"
    echo ""
fi

echo "📈 Statistics:"
echo "-------------"
echo "Total changed files: $TOTAL_FILES"
echo ""

echo "🔍 Last Commit:"
echo "--------------"
git log -1 --oneline 2>/dev/null || echo "No commits yet"
echo ""

echo "✅ Ready to push to: https://github.com/MarcoPolo483/eva-devbench"
echo ""
echo "To push, run one of:"
echo "  • ./push-to-github.sh"
echo "  • node git-commit-push.mjs"
echo "  • git add . && git commit -m 'your message' && git push origin main"
echo ""
