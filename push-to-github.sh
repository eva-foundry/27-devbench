#!/bin/bash

echo "📦 EVA DevBench - Pushing to GitHub"
echo "===================================="
echo ""

# Check if there are any changes
echo "📊 Checking git status..."
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Stage all changes
echo "📝 Staging all changes..."
git add .

# Commit with comprehensive message
echo "💾 Committing changes..."
git commit -m "feat: Complete EVA DevBench implementation with Review Mode and advanced features

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

if [ $? -ne 0 ]; then
    echo "❌ Error committing changes"
    exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo ""
echo "🌿 Current branch: $BRANCH"

# Push to GitHub
echo "🚀 Pushing to origin/$BRANCH..."
git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to https://github.com/MarcoPolo483/eva-devbench"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Visit: https://github.com/MarcoPolo483/eva-devbench"
    echo "   2. Verify your changes are visible"
    echo "   3. Deploy to Azure Static Web Apps (see DEPLOYMENT.md)"
    echo ""
else
    echo "❌ Error pushing to remote"
    echo "You may need to configure git credentials or check repository permissions"
    exit 1
fi
