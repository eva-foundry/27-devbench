import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const COMMIT_MESSAGE = `feat: Complete EVA DevBench implementation with Review Mode and advanced features

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

This implementation addresses legacy modernization needs for 60+ years of technical debt (COBOL → Client-Server → Three-tier architectures) with AI-assisted refactoring, reverse engineering, and governance workflows.`;

function exec(command: string, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      ...options
    });
  } catch (error: any) {
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

console.log('📦 EVA DevBench - Committing and Pushing Changes');
console.log('================================================\n');

// Check git status
console.log('📊 Checking git status...\n');
try {
  const status = exec('git status --porcelain');
  
  if (!status.trim()) {
    console.log('✅ No changes to commit');
    process.exit(0);
  }
  
  console.log('Changes detected:');
  console.log(status);
  
} catch (error) {
  console.error('❌ Error checking git status');
  process.exit(1);
}

// Add all changes
console.log('\n📝 Staging all changes...');
try {
  exec('git add .');
  console.log('✅ All changes staged');
} catch (error) {
  console.error('❌ Error staging changes');
  process.exit(1);
}

// Commit changes
console.log('\n💾 Committing changes...');
try {
  // Write commit message to a temp file to handle multiline
  exec(`git commit -F -`, { input: COMMIT_MESSAGE });
  console.log('✅ Changes committed');
} catch (error) {
  console.error('❌ Error committing changes');
  process.exit(1);
}

// Get current branch
let branch = 'main';
try {
  branch = exec('git branch --show-current').trim();
  console.log(`\n🌿 Current branch: ${branch}`);
} catch (error) {
  console.warn('⚠️  Could not determine branch, using "main"');
}

// Push changes
console.log(`\n🚀 Pushing to origin/${branch}...`);
try {
  const result = exec(`git push origin ${branch}`);
  console.log(result);
  console.log('✅ Successfully pushed to remote!');
} catch (error) {
  console.error('❌ Error pushing to remote');
  console.error('You may need to configure git credentials or check repository permissions');
  process.exit(1);
}

console.log('\n✅ Successfully committed and pushed all changes!');
console.log('\n📊 Summary:');
console.log(`   Branch: ${branch}`);
console.log(`   Remote: origin`);
console.log('');
