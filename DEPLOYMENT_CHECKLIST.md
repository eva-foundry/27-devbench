# Azure Deployment Checklist

Use this checklist to ensure a smooth deployment to Azure Static Web Apps.

## 📋 Pre-Deployment Phase

### Azure Infrastructure Setup
- [ ] Azure subscription access confirmed
- [ ] Resource group created: `esd-aicoe-rg` (or your RG)
- [ ] Azure Static Web App created: `eva-devbench`
- [ ] SKU selected: Standard (production) or Free (testing)
- [ ] Region confirmed: Canada Central
- [ ] Deployment token copied from Azure Portal

### GitHub Repository Setup
- [ ] Repository exists and is accessible
- [ ] Main branch configured as default
- [ ] Branch protection rules set (optional but recommended)
- [ ] GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` created
- [ ] Secret value verified (pasted deployment token)

### Build Configuration
- [ ] `package.json` build script tested: `npm run build`
- [ ] Build output directory confirmed: `dist/`
- [ ] `dist/index.html` exists after build
- [ ] All assets bundled correctly in `dist/assets/`
- [ ] Environment variables configured (if needed)

### Workflow Files
- [ ] `.github/workflows/azure-static-web-apps.yml` exists
- [ ] Workflow syntax validated
- [ ] Node.js version set: 20
- [ ] Build command configured: `npm run build`
- [ ] Output location set: `dist`
- [ ] App location set: `/`

### Static Web App Configuration
- [ ] `staticwebapp.config.json` exists in root
- [ ] SPA routing configured (fallback to index.html)
- [ ] Security headers configured
- [ ] CORS settings appropriate for your APIM
- [ ] MIME types configured

## 🚀 Deployment Phase

### Trigger Deployment
- [ ] Code committed to repository
- [ ] Changes pushed to `main` branch
- [ ] GitHub Actions workflow triggered
- [ ] Or: PR created for preview environment

### Monitor Deployment
- [ ] GitHub Actions tab opened
- [ ] Workflow run visible and started
- [ ] "Build and Deploy" job running
- [ ] No errors in checkout step
- [ ] No errors in Node.js setup
- [ ] Dependencies installed successfully (`npm ci`)
- [ ] Build completed without errors
- [ ] Deployment to Azure started
- [ ] Deployment completed successfully
- [ ] Workflow shows green checkmark ✓

### Azure Verification
- [ ] Azure Portal → Static Web App → Deployments
- [ ] Latest deployment shows "Succeeded"
- [ ] Deployment timestamp is recent
- [ ] URL is displayed in Overview

## ✅ Post-Deployment Phase

### Application Access
- [ ] Static Web App URL accessed: `https://[app-name].azurestaticapps.net`
- [ ] Application loads without errors
- [ ] No blank page or 404 errors
- [ ] Assets loading correctly (CSS, JS, fonts)
- [ ] Console shows no critical errors

### Functional Testing
- [ ] Home page loads
- [ ] Navigation works (Projects, Bundles, Runs, Settings)
- [ ] Demo Mode toggle functional
- [ ] Language toggle (EN/FR) works
- [ ] Review Mode toggle works
- [ ] Forms render correctly
- [ ] Buttons respond to clicks
- [ ] Modals open and close

### API Integration Testing
- [ ] Settings page shows APIM configuration
- [ ] Demo Mode works with mock data
- [ ] Health check endpoint succeeds (if Demo Mode off)
- [ ] CORS errors absent in console
- [ ] API requests include proper headers
- [ ] Authentication banner appears (if not configured)

### Performance & Assets
- [ ] Page load time acceptable (< 3 seconds)
- [ ] Images load correctly
- [ ] Fonts load correctly (Inter, Space Grotesk, JetBrains Mono)
- [ ] No 404 errors in Network tab
- [ ] Assets served with appropriate cache headers
- [ ] No console warnings about missing resources

### Responsive Design
- [ ] Desktop layout (1920px) renders correctly
- [ ] Laptop layout (1440px) renders correctly
- [ ] Tablet layout (768px) renders correctly
- [ ] Mobile layout (375px) renders correctly
- [ ] Navigation collapses on mobile
- [ ] Diff viewer readable on all sizes

### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus indicators visible
- [ ] Screen reader announces elements correctly
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] No motion dependence
- [ ] ARIA labels present

### Security
- [ ] HTTPS enforced (redirects from HTTP)
- [ ] Security headers present in Network tab:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Content-Security-Policy` set
- [ ] No secrets visible in source code
- [ ] No API keys in network requests
- [ ] Environment variables not exposed

### Monitoring Setup (Optional)
- [ ] Application Insights configured
- [ ] Telemetry data flowing
- [ ] Custom events tracked
- [ ] Page views recorded
- [ ] Errors logged

## 🔄 Pull Request Preview Testing

If using PR preview environments:

### PR Creation
- [ ] Branch created from main
- [ ] Changes pushed to branch
- [ ] Pull request opened
- [ ] GitHub Actions triggered
- [ ] Preview environment created
- [ ] Preview URL posted in PR comments

### PR Preview Verification
- [ ] Preview URL accessible
- [ ] Changes visible in preview
- [ ] Functionality tested in preview
- [ ] No regressions found
- [ ] Preview isolated from production

### PR Cleanup
- [ ] PR merged to main
- [ ] Production deployed
- [ ] Preview environment deleted automatically
- [ ] No orphaned preview environments

## 📊 Monitoring & Maintenance

### Regular Checks
- [ ] Deployment logs reviewed weekly
- [ ] Application Insights dashboard checked
- [ ] Error rates monitored
- [ ] Performance metrics tracked
- [ ] User feedback collected

### Security Maintenance
- [ ] Deployment token rotated quarterly
- [ ] Dependencies updated regularly (`npm audit`)
- [ ] Security patches applied promptly
- [ ] APIM access logs reviewed

### Documentation Updates
- [ ] Deployment docs updated with learnings
- [ ] Known issues documented
- [ ] Team trained on deployment process
- [ ] Runbooks created for common issues

## 🐛 Troubleshooting Checklist

If deployment fails, check:

### Build Failures
- [ ] `package-lock.json` committed and up-to-date
- [ ] Node.js version compatible (20.x)
- [ ] All dependencies installable (`npm ci` locally)
- [ ] TypeScript compilation succeeds
- [ ] No missing imports or broken references

### Deployment Failures
- [ ] Deployment token valid and not expired
- [ ] GitHub secret name correct: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [ ] Azure Static Web App status is "Ready"
- [ ] No Azure service outages
- [ ] Workflow permissions correct

### Runtime Errors
- [ ] Browser console checked for errors
- [ ] Network tab checked for 404s
- [ ] `staticwebapp.config.json` routing correct
- [ ] Asset paths correct in `dist/`
- [ ] Environment variables set correctly

### API Connection Issues
- [ ] APIM base URL correct
- [ ] CORS configured in APIM
- [ ] Backend services healthy
- [ ] Network connectivity from Azure
- [ ] Authentication configured if required

## 📞 Escalation Contacts

If stuck, escalate to:

1. **Build/Workflow Issues**: DevOps team or GitHub support
2. **Azure Infrastructure**: Azure support ticket
3. **APIM Configuration**: EsDAICoE platform team
4. **Application Bugs**: Development team lead
5. **Security Concerns**: Security team

## 📚 Reference Documentation

- [Azure Deployment Guide](./AZURE_DEPLOYMENT.md) - Complete step-by-step
- [Quick Deploy Reference](./QUICKSTART_DEPLOY.md) - 5-minute guide
- [Full Deployment Guide](./DEPLOYMENT.md) - All deployment options
- [GitHub Actions Workflow](./.github/workflows/azure-static-web-apps.yml) - Workflow file

## ✅ Sign-Off

Once all items checked:

- **Deployed by**: _______________
- **Date**: _______________
- **Environment**: ☐ Production ☐ Staging ☐ Development
- **Version**: _______________
- **Deployment URL**: _______________
- **Verification completed**: ☐ Yes ☐ No
- **Issues found**: ☐ None ☐ Minor ☐ Major (document below)

**Notes**:
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

---

**Checklist Version**: 1.0
**Last Updated**: 2024
**Maintained By**: EVA DevBench Team
