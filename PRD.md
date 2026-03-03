# Planning Guide

EVA DevBench is a production-quality web application for AI-assisted software engineering that orchestrates work packages (reverse engineering, scaffolding, refactoring, testing, documentation) and produces auditable artifacts through secure, traceable runs.

**Experience Qualities**:
1. **Professional**: Clean, enterprise-grade interface designed for engineers with clear information hierarchy and minimal cognitive load
2. **Transparent**: Every action, cost, and decision is visible and auditable with comprehensive tracing and evidence trails
3. **Efficient**: Streamlined workflows that minimize clicks while maintaining security and compliance requirements

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application manages multiple interconnected workflows (project management, context bundling with file uploads, run orchestration with SSE streaming, artifact viewing), requires secure API integration with custom headers, implements bilingual support, handles real-time event streams, and provides comprehensive audit trails—all characteristics of an advanced, multi-view application.

## Essential Features

### Project Management
- **Functionality**: Create and manage projects with metadata (name, description, cost center, owners)
- **Purpose**: Organize work into logical containers and establish ownership/accountability
- **Trigger**: User clicks "Create Project" or selects existing project
- **Progression**: Landing page → Project list → Select/Create project → Set as active → Access project features
- **Success criteria**: Projects persist, display correctly, and can be set as active context

### Context Bundle Builder
- **Functionality**: Create bundles of code/files/constraints, upload to secure storage, finalize with cryptographic hashes
- **Purpose**: Package code context securely for AI processing with full audit trail
- **Trigger**: User initiates "Create Context Bundle" from active project
- **Progression**: Bundle form → Add text constraints + file uploads → Upload to signed URLs → Finalize/seal → View manifest with hashes
- **Success criteria**: Files upload successfully, bundle seals with correct hashes, sealed bundles are immutable

### Work Package Execution
- **Functionality**: Select from catalog of work packages (reverse engineer, scaffold, refactor, test, docs) and configure run parameters
- **Purpose**: Execute AI-assisted engineering tasks with appropriate configuration
- **Trigger**: User selects work package tile from catalog
- **Progression**: Catalog → Select package → Configure parameters → Select context bundle → Set purpose/data class → Start run → Live console
- **Success criteria**: Run starts successfully, events stream in real-time, costs are tracked

### Live Run Console
- **Functionality**: Real-time streaming of run events via SSE with agent timeline, progress tracking, and cancellation
- **Purpose**: Provide transparency into AI agent execution and allow intervention
- **Trigger**: Run creation or viewing active run
- **Progression**: Run start → Event stream opens → Timeline updates → Warnings/errors appear → Completion or cancellation
- **Success criteria**: Events display in real-time, timeline shows agent progression, cancel works immediately

### Artifacts & Audit Trail
- **Functionality**: View, download, and inspect generated artifacts (patches, docs, tests) with full audit metadata and enhanced code review features
- **Purpose**: Access work products, maintain evidence for compliance, and facilitate thorough code review
- **Trigger**: Run completion or artifact list access
- **Progression**: Artifacts list → Select artifact → Enhanced diff viewer with review mode → Review checklist → Semantic grouping → Agent rationale → Download → Review audit data (costs, tokens, trace IDs)
- **Success criteria**: All artifacts accessible, diffs render correctly with syntax highlighting and word-level diffs, review metadata captured, audit data is complete

### Enhanced Code Review (NEW)
- **Functionality**: Review Mode with visual indicators, risk analysis, semantic grouping, agent rationale, provenance tracking, and AI-powered explanations
- **Purpose**: Reduce verification burden, increase reviewer confidence, provide AICOE-grade governance
- **Trigger**: Viewing patch artifacts with Review Mode enabled
- **Progression**: 
  - Enable Review Mode → See risk badges (high/medium/low) on files
  - View provenance badges (agent, model, context bundle, run ID, timestamp) on each file
  - View semantic groups (Controllers, DTOs, Services, Tests, Docs)
  - Review checklist (business logic inferred, SME required, tests generated, security reviewed)
  - Inspect agent rationale per file (why changed, assumptions, confidence level)
  - See "What was NOT touched" panel (excluded files, protected zones)
  - Mark files as OK/Needs SME/Needs Re-run
  - Right-click hunks for AI explanation (what changed, why necessary, watch outs, how to test)
- **Success criteria**: 
  - Risk indicators accurately reflect code complexity
  - Provenance badges show complete audit trail for each file
  - Semantic grouping correctly categorizes files
  - Review checklist state persists between sessions
  - Agent rationale provides clear reasoning
  - File review status saved and visible
  - Hunk explanations are contextually relevant

## Edge Case Handling

- **Network Failures**: Retry mechanism with exponential backoff, user-friendly error messages with actionable recovery steps
- **Unsealed Bundles**: Prevent run creation, display warning that bundle must be finalized first
- **Missing Authentication**: Display banner prompting configuration, gracefully handle 401/403 responses
- **SSE Connection Loss**: Automatic reconnection with event recovery, fallback to polling if SSE unavailable
- **Sensitive Data Detection**: Regex-based warning (not blocking) when PB data class selected and potential secrets detected in input
- **Demo Mode Fallback**: Automatically detect APIM unreachability, switch to mock data, display clear indicator
- **Large File Uploads**: Progress tracking per file, chunk upload support, resume capability on failure
- **Concurrent Modifications**: Optimistic locking for bundles, clear error messages on conflicts

## Design Direction

The design should evoke **trust, precision, and control**—qualities essential for a secure engineering platform. Users should feel confident that their work is being handled professionally, that every action is traceable, and that they maintain full visibility into AI agent operations. The interface should feel like a high-quality developer tool: clean, information-dense without clutter, and optimized for efficiency.

## Color Selection

A professional technical palette with strong contrasts and clear semantic meaning for different states and data classifications.

- **Primary Color**: Deep Navy Blue `oklch(0.25 0.05 250)` - Conveys technical professionalism, trust, and stability appropriate for secure government systems
- **Secondary Colors**: 
  - Cool Gray `oklch(0.45 0.01 250)` for secondary actions and backgrounds
  - Light Sky `oklch(0.95 0.02 250)` for subtle background variation
- **Accent Color**: Vivid Cyan `oklch(0.65 0.15 210)` - High-tech highlight for active states, CTAs, and progress indicators
- **Semantic Colors**:
  - Success/Sealed: Emerald `oklch(0.55 0.15 160)`
  - Warning/Draft: Amber `oklch(0.70 0.15 80)`
  - Error/Destructive: Crimson `oklch(0.55 0.22 25)`
  - ULL Badge: Cool Blue `oklch(0.60 0.12 240)`
  - PB Badge: Orange `oklch(0.65 0.18 50)`

**Foreground/Background Pairings**:
- Primary Navy on White Background - Ratio 13.2:1 ✓
- White text on Primary Navy - Ratio 13.2:1 ✓
- Accent Cyan on White Background - Ratio 4.9:1 ✓
- White text on Accent Cyan - Ratio 4.3:1 ✓
- Foreground Dark on Light Sky Background - Ratio 12.8:1 ✓

## Font Selection

Typography should balance technical precision with readability, appropriate for dense information displays while maintaining professional aesthetics.

- **Primary Font**: JetBrains Mono for code, file paths, hashes, and technical identifiers—reinforces the developer-tool nature
- **Secondary Font**: Inter for UI text, descriptions, and body content—excellent readability and professional appearance
- **Accent Font**: Space Grotesk for headings and emphasis—geometric, modern, slightly technical feel

**Typographic Hierarchy**:
- H1 (Page Title): Space Grotesk Bold/32px/tight (-0.02em) - "EVA DevBench", major section headers
- H2 (Section Header): Space Grotesk Semibold/24px/tight (-0.01em) - "Active Project", "Context Bundles"
- H3 (Card Title): Inter Semibold/18px/normal - Work package names, artifact titles
- Body (Primary): Inter Regular/15px/relaxed (1.6) - Descriptions, form labels
- Body (Secondary): Inter Regular/14px/normal (1.5) - Helper text, metadata
- Code/Technical: JetBrains Mono Regular/14px/normal (1.4) - File paths, hashes, trace IDs, code content
- Small/Meta: Inter Medium/13px/normal - Badges, timestamps, token counts

## Animations

Animations should reinforce system state changes and guide attention to important events without distracting from information density. Use purposeful, subtle motion.

**Functional Animations**:
- Event stream entries: Slide in from bottom with 200ms ease-out—draws attention to new events
- Agent timeline progression: Smooth transition between states with 300ms ease—shows workflow advancement
- Upload progress: Smooth bar fill with 150ms updates—provides feedback during file uploads
- Modal/drawer entry: Scale + fade in 250ms ease-out—establishes visual hierarchy
- Status badge changes: Subtle pulse on state transition—highlights important status changes
- Tab switching: Crossfade 200ms—maintains context during view changes

**Moments of Delight**:
- Run completion: Gentle confetti burst or success glow—celebrates successful work
- Bundle sealing: Lock icon animation with hash reveal—reinforces security
- First project creation: Welcome micro-interaction—guides new users

## Component Selection

**Components**:
- **Dialogs**: For project creation, bundle configuration, run setup—modal context for important actions
- **Sheets**: For settings panel, artifact detail viewers—slide-out for secondary information
- **Cards**: For project tiles, work package catalog, bundle list—scannable information containers
- **Tables**: For artifact lists, run history—dense structured data with sorting
- **Tabs**: For multi-view pages (bundle details, run reports)—organize related content
- **Badges**: For status (sealed/draft), data class (ULL/PB), sensitivity—visual state indicators
- **Progress**: For upload status, run progress—clear feedback on long operations
- **ScrollArea**: For event streams, file lists—handle overflow gracefully
- **Separator**: Between sections for visual breathing room
- **Toasts**: For success/error feedback—non-blocking notifications via Sonner

**Customizations**:
- Custom SSE event timeline component with agent markers
- **Enhanced diff viewer** for patch artifacts with:
  - Syntax highlighting for TypeScript, JavaScript, Python, Java, C#, HTML, CSS, JSON, SQL, Ruby, Go, Rust, PHP, Kotlin, and Swift
  - Inline word-level diff highlighting that shows character-by-character changes within modified lines
  - Side-by-side split view option
  - Review Mode overlay with risk indicators (low/medium/high)
  - Semantic grouping of files (Controllers, DTOs, Services, Tests, Docs, Config)
  - Agent rationale panels showing reasoning, assumptions, and confidence levels
  - File provenance badges (generated by, model profile, context bundle hash, run ID)
  - Review checklist (business logic, SME validation, tests, security, performance)
  - "What was NOT touched" panel (excluded files, protected zones, intentionally skipped)
  - AI-powered hunk explanation with contextual guidance
  - File-level review markers (OK, Needs SME, Needs Re-run)
  - Large diff warnings and core layer indicators
- Custom file upload zone with drag-drop and progress tracking
- Custom language toggle in header (EN/FR flag selector)

**States**:
- Buttons: Distinct hover (lighten), active (darken), disabled (50% opacity + cursor-not-allowed), loading (spinner)
- Inputs: Default border, focus ring (accent color), error state (red border + icon), success (green check)
- Cards: Neutral by default, hover elevation on interactive cards, selected state with accent border
- Status badges: Color-coded semantic backgrounds with appropriate foreground

**Icon Selection**:
- Projects: FolderOpen
- Context Bundles: Package, Lock (sealed)
- Upload: UploadSimple, Files
- Runs: Play, Stop, ArrowClockwise
- Agents: Robot, Gear (processing), Brain (reasoning)
- Artifacts: FileText (docs), Code (patches), FileZip (downloads)
- Audit: ShieldCheck, ClockCounterClockwise, Fingerprint (provenance), Cube (agent)
- Review: Eye (review mode), ShieldCheck (security), Warning (risk), TestTube (tests)
- Semantic Groups: Folders (grouping), List (organization)
- Excluded Files: ShieldSlash, FileX (excluded), Lock (protected)
- AI Features: Lightbulb (explanations), Brain (SME), Cube (agent)
- Settings: Gear
- Language: Globe, Translate
- Status: CheckCircle (success), Warning (caution), XCircle (error), MinusCircle (unclear)
- Navigation: CaretLeft, CaretRight, CaretDown, CaretUp, List

**Spacing**:
- Page padding: p-6 (24px)
- Card padding: p-4 (16px) for compact cards, p-6 for detail views
- Section gaps: gap-6 (24px) between major sections
- Component gaps: gap-4 (16px) between related items, gap-2 (8px) for tight groups
- Form fields: space-y-4 (16px vertical rhythm)
- Grid layouts: gap-4 for cards, gap-2 for dense lists

**Mobile**:
- Header: Collapsible navigation drawer with hamburger menu at <768px
- Cards: Stack vertically, expand to full width
- Tables: Transform to stacked card layout with key information
- Forms: Single column, full-width inputs
- Event stream: Simplified compact view with expand/collapse
- Language toggle: Icon-only in mobile header
- Dialogs: Full-screen on mobile for complex forms
- Bottom sheet pattern for artifact viewers on mobile
- Review panels: Collapse into tabs on mobile, with review mode panel always accessible
- Semantic groups: Accordion-style with single-column file lists
- Diff viewer: Unified view preferred on mobile, split view available in landscape

## Code Review & Governance Features

### Review Mode
A toggleable overlay that transforms the diff viewer into a guided code review interface, highlighting areas requiring attention and providing structured review workflows.

**Key Features**:
- **Visual Risk Indicators**: 🟢 Low (docs, tests) | 🟡 Medium (scaffolding, wiring) | 🔴 High (logic, auth, calculations)
- **Overview Dashboard**: Shows files changed, large diffs (>100 lines), core layer touches, risk distribution
- **Review Checklist**: Interactive Yes/No/Unclear toggles for:
  - Business logic inferred?
  - SME validation required? (auto-flagged for high-risk/core layer files)
  - Tests generated? (with links to test files)
  - Security reviewed?
  - Performance considered?
- **Persistent State**: Review mode preference and checklist state saved via useKV

### Agent Rationale Per File (IMPLEMENTED)
Expandable panel attached to each modified file showing AI agent reasoning and decision-making process.

**Displays**:
- **Agent Name**: Which agent made the changes (Scaffolder, Refactorer, Tester, Documenter, etc.)
- **Input Signals**: Files, constraints, and context used for decision-making (bulleted list)
- **Explicit Assumptions**: What the agent assumed about requirements or architecture (bulleted list with warning icons)
- **Confidence Level**: Low/Medium/High badge indicating agent's confidence (color-coded: green/amber/red)
- **Reasoning**: Natural language explanation of why changes were made

**Implementation Details**:
- Collapsible panel positioned directly below each file's diff content
- "Why this change?" trigger button with Brain icon and confidence badge
- Expandable on click with smooth animation
- Visual hierarchy using icons (Cube for agent, Lightbulb for reasoning, ShieldCheck for signals, Brain for assumptions)
- Separated sections with dividers for clear information architecture
- Mock data provided for demo purposes showing realistic agent reasoning patterns

**Purpose**: Addresses "code feels junior-level" feedback by making AI intent transparent and reviewable. Helps reviewers understand not just what changed, but why the agent made specific decisions and what it assumed about the system.

### File Provenance & Traceability (IMPLEMENTED)
Small metadata badge on each file providing full audit trail from generation to review.

**Metadata Shown**:
- Generated by: Agent name (e.g., Agent-Scaffolder-v2, Agent-Refactorer-v2, Agent-Tester-v2)
- Model profile: AI model used (e.g., gpt-4o, gpt-4o-mini)
- Context bundle hash: First 16 characters with expandable full hash
- Run ID: Clickable ULID with copy-to-clipboard functionality
- Timestamp: ISO 8601 timestamp with local formatting

**Implementation Details**:
- Compact badge displayed inline with file type and risk badges
- Fingerprint icon for visual recognition
- Expandable on click to show full metadata details
- Mock data provided for demo showing realistic agent/model pairings
- Positioned prominently in file header for visibility

**Benefits**: Every line auditable without extra documentation; supports AICOE governance requirements; provides complete traceability from context bundle through AI processing to final artifact.

### "What Was NOT Touched" Panel
Dedicated view showing files explicitly excluded, intentionally skipped, or in protected zones.

**Three Categories**:
1. **Protected Zones**: Files in auth/, security/, policy/ directories that AI cannot modify
2. **Excluded by Constraints**: Files filtered out by user-defined constraints
3. **Intentionally Skipped**: Files detected but skipped with agent reasoning

**Purpose**: Builds trust by showing "the AI didn't roam freely—it stayed in its lane."

### Semantic Diff Grouping
Logical file grouping beyond directory structure, using heuristics to categorize changes by architectural layer.

**Groups**:
- **Controllers** (3 files): API endpoints, route handlers
- **DTOs** (2 files): Data transfer objects, models, schemas
- **Services** (4 files): Business logic, repositories, DAOs
- **Tests** (6 files): Test files, specs
- **Docs** (2 files): Markdown, README files
- **Config** (1 file): Configuration files

**Benefits**: Reviewers understand shape of change quickly; can review by architectural layer rather than alphabetically.

### Change Risk Indicators
Non-blocking risk badge per file, calculated heuristically based on code patterns.

**Risk Calculation**:
- 🟢 **Low**: Comments, docs, tests, config files
- 🟡 **Medium**: Scaffolding, wiring, moderate complexity (50-100 lines changed)
- 🔴 **High**: 
  - Branching logic (if/else, switch, loops)
  - Auth/security patterns (auth, login, password, token)
  - Destructive operations (delete, drop, truncate)
  - Calculations and arithmetic
  - Large diffs (>100 lines)
  - Core layer files (domain/, auth/, security/)

**Aligns with**: "Human accountability" messaging—helps reviewers prioritize attention.

### "Explain This Hunk" Feature
Right-click or button action on any diff hunk to get AI-powered contextual explanation.

**Explanation Structure**:
- **What Changed**: Brief summary of the modification
- **Why Necessary**: Reasoning for the change based on context bundle
- **What to Watch Out For**: Potential issues, edge cases, breaking changes
- **How to Test**: Specific testing guidance for this change

**Implementation**: Uses Spark LLM API with context bundle grounding; explanation limited to bundle + diff context only.

### File Review Markers
Reviewers can tag individual files with status indicators that persist across sessions.

**Status Options**:
- ✅ **OK**: Approved, ready to merge
- 🧠 **Needs SME**: Requires subject matter expert validation
- 🔁 **Needs Re-run**: Should be regenerated with updated constraints
- ⏳ **Pending**: Not yet reviewed (default)

**Features**:
- Click-to-change dropdown on each file header
- Review status summary card showing overall progress
- Bulk actions to mark all files at once
- Visual progress indicator (% reviewed)
- Real-time status counts by category
- Persistent state via useKV (survives page refresh)

**Persistence**: Saved via useKV per file path; can feed into run summaries and governance reports.

### Learning Mode vs Delivery Mode (Future Enhancement)
Toggle to show/hide educational content in the UI.

**Delivery Mode** (default):
- Minimal explanations
- Focus on artifacts and review
- Streamlined for experienced reviewers

**Learning Mode**:
- Extra inline comments
- Architectural notes
- Links to patterns used
- More verbose agent rationale

**Purpose**: Avoids annoying senior devs while enabling junior onboarding.

### Persistent Diff State
Remembers user preferences and position across sessions using useKV.

**Saved State**:
- Expanded file list (which files are open)
- View mode (inline vs split)
- Word-level diff toggle
- Scroll position within diffs
- Review mode enabled/disabled
- Review checklist responses

**Benefit**: Reviewers often return multiple times—this eliminates friction.
