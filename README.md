# EVA DevBench

![Azure Static Web Apps CI/CD](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Azure%20Static%20Web%20Apps%20CI%2FCD/badge.svg)

**AI-Assisted Software Engineering Platform for Legacy Modernization**

EVA DevBench is a production-quality web application designed for government engineering teams modernizing legacy applications. It orchestrates AI-assisted work packages (reverse engineering, scaffolding, refactoring, testing, documentation) and produces auditable artifacts through secure, traceable runs.

## 🎯 Purpose

Support developers reducing technical debt in application libraries based on 60+ years of legacy technology:
- COBOL mainframe applications
- Client-server architectures
- Three-tier legacy systems
- Untested or undocumented codebases

## ✨ Key Features

### Core Capabilities
- **Project Management**: Organize modernization work with metadata tracking
- **Context Bundle Builder**: Securely package code with cryptographic sealing
- **Work Package Catalog**: Pre-configured AI workflows for common tasks
- **Live Run Console**: Real-time SSE event streaming with agent timelines
- **Enhanced Diff Viewer**: Syntax highlighting for 15+ languages, split/unified views

### Enterprise Code Review Features
- **Review Mode**: Risk indicators (Low/Medium/High) on every file
- **Agent Rationale**: See why AI made each change with assumptions and confidence
- **File Provenance**: Complete audit trail (agent, model, context, run ID, timestamp)
- **Semantic Grouping**: Organize files by architectural layer (Controllers, Services, Tests)
- **Review Status Markers**: Mark files as OK/Needs SME/Needs Re-run with persistence
- **"Explain This Hunk"**: AI-powered contextual explanations for code changes
- **Protected Zone Tracking**: View what files AI explicitly did NOT touch
- **Word-Level Diffs**: Character-by-character change highlighting

### Governance & Compliance
- **Full Audit Trails**: Trace IDs, timestamps, token counts, costs
- **AICOE-Grade Provenance**: Every line auditable to source
- **Evidence Bundles**: Exportable JSON reports for compliance
- **Bilingual Support**: EN/FR toggle with persistent preference
- **WCAG 2.1 AA**: Full keyboard navigation and accessibility

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Access at `http://localhost:5173`

### Enable Demo Mode
1. Navigate to Settings
2. Toggle **Demo Mode** ON
3. Explore with realistic mock data

See **QUICKSTART.md** for detailed workflows.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)**: 5-minute demo setup and core workflows
- **[EXPORT.md](./EXPORT.md)**: Complete technical documentation and architecture
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Full Azure deployment guide with all options
- **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)**: GitHub Actions deployment step-by-step
- **[QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md)**: Deploy in 5 minutes quick reference
- **[PRD.md](./PRD.md)**: Product requirements and design decisions

## 🏗️ Technology Stack

- **Framework**: React 19.2.0 + TypeScript 5.7.3
- **Build Tool**: Vite 7.2.6
- **Styling**: Tailwind CSS 4.1.17 + Shadcn/ui v4
- **Icons**: Phosphor Icons React
- **State**: React hooks + useKV (persistent)
- **HTTP**: Fetch API with APIM integration
- **Real-time**: Server-Sent Events (SSE)

## 🎨 Design System

- **Colors**: OKLCH color space for perceptual uniformity
- **Typography**: Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Accessibility**: WCAG 2.1 AA compliant
- **Animations**: Purposeful, subtle motion with Framer Motion

## 🔐 Security

- No client-side secrets
- All API calls through Azure APIM gateway
- Bearer token authentication (Entra ID ready)
- Cryptographic bundle sealing
- Protected zone enforcement

## 📊 Project Status

**Version**: 0.1.0 (MVP)  
**Iterations**: 20 completed  
**Status**: Production-ready for Azure EsDAICoESub sandbox  
**Deployment Target**: Azure Static Web Apps or App Service

## 🏛️ Use Cases

### COBOL Modernization
- Reverse engineer mainframe business logic
- Generate modern .NET/Java equivalents
- Preserve exact calculation behavior
- Create comprehensive test suites

### Client-Server Migration
- Document three-tier architecture patterns
- Generate modern API layers
- Refactor data access to ORMs
- Create migration documentation

### Technical Debt Reduction
- Auto-generate tests for untested code
- Refactor legacy modules incrementally
- Document undocumented systems
- Modernize UI layers

## 🤝 Contributing

This application is designed for secure government environments. Before contributing:

1. Review **SECURITY.md**
2. Ensure WCAG 2.1 AA compliance
3. Follow TypeScript best practices
4. Add translations for EN/FR
5. Update PRD.md with feature changes

## 📞 Support

- **Technical Documentation**: See EXPORT.md
- **Deployment Issues**: See DEPLOYMENT.md  
- **Feature Questions**: See PRD.md
- **Training**: See QUICKSTART.md

## ⚖️ License

Spark Template files and resources from GitHub are licensed under the MIT license, Copyright GitHub, Inc.

---

**Built for**: EsDAICoE Sandbox  
**Maintained by**: EVA DevBench Team  
**Export Date**: 2024-01
