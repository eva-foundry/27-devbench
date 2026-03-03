# Azure Static Web Apps Deployment with GitHub Actions

This project is configured to automatically deploy to Azure Static Web Apps using GitHub Actions whenever code is pushed to the `main` branch or when pull requests are opened.

## 🚀 Quick Setup Guide

### Step 1: Create Azure Static Web App

1. **Using Azure Portal**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → "Static Web App"
   - Fill in the details:
     - **Subscription**: Select your subscription
     - **Resource Group**: `esd-aicoe-rg` (or your resource group)
     - **Name**: `eva-devbench`
     - **Plan type**: Standard (for production) or Free (for testing)
     - **Region**: Canada Central
     - **Deployment details**: Select "GitHub" and choose your repository
     - **Build presets**: Custom
     - **App location**: `/`
     - **Api location**: (leave empty)
     - **Output location**: `dist`
   - Click "Review + create" → "Create"

2. **Using Azure CLI**:
   ```bash
   az staticwebapp create \
     --name eva-devbench \
     --resource-group esd-aicoe-rg \
     --location canadacentral \
     --sku Standard \
     --source https://github.com/YOUR_ORG/YOUR_REPO \
     --branch main \
     --app-location "/" \
     --output-location "dist" \
     --token YOUR_GITHUB_PAT
   ```

### Step 2: Get Deployment Token

1. In Azure Portal, navigate to your newly created Static Web App
2. Go to "Settings" → "Deployment" (or "Configuration")
3. Find "Deployment token" and click "Manage deployment token"
4. Copy the token (it's a long string starting with something like `c3RhdGljX3dlYl9hcHBz...`)

### Step 3: Configure GitHub Secret

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Create the secret:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: Paste the deployment token from Step 2
5. Click "Add secret"

### Step 4: Configure Additional Secrets (Optional)

If you need to set environment-specific configuration:

1. In GitHub repository → "Settings" → "Secrets and variables" → "Actions"
2. Add secrets for build-time configuration:
   - `APIM_BASE_URL`: Your APIM gateway URL
   - `VITE_APIM_BASE_URL`: Same as above (if needed at build time)

**Note**: Vite environment variables must be prefixed with `VITE_` to be included in the build.

### Step 5: Trigger Deployment

**Option A: Push to main branch**
```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

**Option B: Create a pull request**
- Create a branch and push changes
- Open a pull request to `main`
- GitHub Actions will create a staging environment for preview
- When merged, it will deploy to production

**Option C: Manual trigger**
- Go to your GitHub repository
- Click "Actions" tab
- Select "Azure Static Web Apps CI/CD" workflow
- Click "Run workflow" → "Run workflow"

### Step 6: Monitor Deployment

1. Go to "Actions" tab in your GitHub repository
2. Click on the running workflow
3. Watch the build and deployment progress
4. Once complete, you'll see the deployment URL in the logs

### Step 7: Access Your Deployed App

1. In Azure Portal → Your Static Web App → "Overview"
2. Find the "URL" (e.g., `https://eva-devbench.azurestaticapps.net`)
3. Click to open your deployed application

## 📋 Workflow Features

The configured workflow (`.github/workflows/azure-static-web-apps.yml`) includes:

### Automatic Deployments
- ✅ Deploys on push to `main` branch
- ✅ Creates preview environments for pull requests
- ✅ Cleans up preview environments when PRs are closed
- ✅ Can be manually triggered via workflow_dispatch

### Build Optimization
- ✅ Uses Node.js 20
- ✅ Caches npm dependencies for faster builds
- ✅ Runs production build with optimizations
- ✅ Skips app build in Azure (builds before upload)

### Preview Environments
When you create a pull request:
- A unique staging URL is created (e.g., `https://eva-devbench-pr-123.azurestaticapps.net`)
- Each commit to the PR updates the preview
- Preview is automatically deleted when PR is closed

## 🔧 Configuration Files

### GitHub Actions Workflow
**Location**: `.github/workflows/azure-static-web-apps.yml`

Key configuration:
```yaml
- name: Deploy to Azure Static Web Apps
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "/"
    api_location: ""
    output_location: "dist"
    skip_app_build: true
```

### Static Web App Configuration
**Location**: `staticwebapp.config.json`

Configures:
- SPA routing (all routes serve `index.html`)
- API routes
- Security headers
- MIME types

### Build Configuration
**Location**: `package.json`

Build command: `npm run build`
- Compiles TypeScript
- Bundles with Vite
- Optimizes assets
- Outputs to `dist/`

## 🌐 Environment Variables

### Build-Time Variables (Vite)
Set in GitHub Actions workflow or Azure Portal:
```env
VITE_APIM_BASE_URL=https://api.esdaicoe.example.gc.ca/devbench/v1
VITE_DEMO_MODE_ENABLED=true
VITE_DEFAULT_LANGUAGE=en
```

### Runtime Configuration (Azure Static Web Apps)
Set in Azure Portal → Static Web App → Configuration → Application settings:
- These are NOT available to the client-side app
- Use for server-side API configuration only

## 🔐 Security Considerations

### Required Permissions
The GitHub Actions workflow needs:
- `contents: read` - To checkout code
- `pull-requests: write` - To comment on PRs with preview URLs

### Secrets Best Practices
- ✅ Never commit the deployment token to the repository
- ✅ Store deployment token in GitHub Secrets
- ✅ Rotate deployment tokens periodically
- ✅ Use separate tokens for production and staging if needed

### CORS Configuration
Update `staticwebapp.config.json` to allow your backend:
```json
{
  "globalHeaders": {
    "Access-Control-Allow-Origin": "https://api.esdaicoe.example.gc.ca",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-evadb-*"
  }
}
```

## 🐛 Troubleshooting

### Deployment Fails: "Invalid deployment token"
**Solution**: 
1. Get a fresh deployment token from Azure Portal
2. Update the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub

### Build Fails: "Cannot find module"
**Solution**:
1. Ensure `package-lock.json` is committed
2. Workflow uses `npm ci` (clean install)
3. Check Node.js version matches (workflow uses Node 20)

### App Loads Blank Page
**Solution**:
1. Check browser console for errors
2. Verify `staticwebapp.config.json` has correct routing fallback
3. Check that `dist/index.html` was created during build

### CSS/Assets Not Loading
**Solution**:
1. Verify build output in `dist/` folder
2. Check `index.html` references `/src/main.css` (or bundled CSS)
3. Review asset paths in Vite config

### Preview Environment Not Created
**Solution**:
1. Verify PR is opened against `main` branch
2. Check workflow permissions
3. Ensure `GITHUB_TOKEN` has PR write access

## 📊 Monitoring Deployments

### GitHub Actions
- View deployment status: Repository → Actions tab
- See deployment logs: Click on workflow run → Expand steps
- Check deployment time: Typically 2-5 minutes

### Azure Portal
- View deployments: Static Web App → "Deployments"
- Check logs: Static Web App → "Application Insights" (if configured)
- Monitor traffic: Static Web App → "Metrics"

## 🚀 Advanced Configuration

### Custom Domain
1. Azure Portal → Static Web App → "Custom domains"
2. Add your domain (e.g., `eva-devbench.example.gc.ca`)
3. Configure DNS CNAME record
4. SSL certificate is provisioned automatically

### Staging Slots
Azure Static Web Apps Standard plan supports named environments:
```bash
az staticwebapp environment create \
  --name eva-devbench \
  --resource-group esd-aicoe-rg \
  --environment-name staging
```

### Authentication (Azure Entra ID)
Configure in Azure Portal → Static Web App → "Authentication":
1. Add Entra ID as identity provider
2. Configure redirect URIs
3. Set authentication rules in `staticwebapp.config.json`

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [staticwebapp.config.json Reference](https://docs.microsoft.com/azure/static-web-apps/configuration)

## 🆘 Need Help?

1. Check deployment logs in GitHub Actions
2. Review Azure Static Web App logs in Azure Portal
3. Consult [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide
4. Contact Azure support for infrastructure issues
5. Review [PRD.md](./PRD.md) and [EXPORT.md](./EXPORT.md) for application details

---

**Last Updated**: 2024
**Workflow Version**: 1.0
