#!/bin/bash

# EVA DevBench - Commit and Push Script
# This script commits all changes and pushes to the GitHub repository

set -e

echo "📦 EVA DevBench - Committing and Pushing Changes"
echo "================================================"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Add all changes
echo "📝 Staging all changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show status
echo ""
echo "📊 Git Status:"
git status --short

# Create commit message
COMMIT_MSG="feat: Complete EVA DevBench implementation with Review Mode and advanced features

Major Features Implemented:
- 🏗️ Full EVA DevBench platform with Projects, Context Bundles, and Work Packages
- 🔍 Advanced Review Mode with risk indicators and provenance badges
- 📊 Semantic grouping by architectural layers (Controllers, DTOs, Services, Tests)
- 🤖 Agent rationale panels showing AI reasoning and assumptions
- ✅ File-level review status tracking (OK, Needs SME, Needs Re-run, Pending)
- 📈 Review progress dashboard with bulk actions
- 🔄 Enhanced diff viewer with syntax highlighting and word-level diffs
- 🌍 Bilingual support (EN/FR) with language toggle
- 🎨 Modern UI with Space Grotesk typography and refined color palette
- 📋 Excluded files panel for transparency
- 🔐 Security-first design with APIM integration
- 📱 Fully responsive design with mobile support

Technical Details:
- Implemented complete API client with SSE support for live run streaming
- Mock data layer for demo mode testing
- Persistent state management with useKV hooks
- WCAG 2.1 AA accessibility compliance
- Type-safe TypeScript implementation
- Comprehensive error handling and loading states
- Localized UI with translation dictionary

Architecture:
- Clean component structure with separation of concerns
- Reusable UI components from shadcn v4
- Context-based state management
- Modular page components for each feature area

Documentation:
- Complete PRD with design specifications
- Deployment guides for Azure Static Web Apps
- Security documentation
- Quick start guides
- Feature documentation

This implementation addresses legacy modernization needs for 60+ years of technical debt (COBOL → Client-Server → Three-tier architectures) with AI-assisted refactoring, reverse engineering, and governance workflows."

# Commit changes
echo ""
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Get current branch
BRANCH=$(git branch --show-current)
echo ""
echo "🌿 Current branch: $BRANCH"

# Push changes
echo ""
echo "🚀 Pushing to remote repository..."
git push origin "$BRANCH"

echo ""
echo "✅ Successfully committed and pushed all changes!"
echo ""
echo "📊 Summary:"
echo "   Branch: $BRANCH"
echo "   Remote: origin"
echo ""
