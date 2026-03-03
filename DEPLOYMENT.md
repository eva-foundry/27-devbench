# EVA DevBench - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying EVA DevBench to Azure EsDAICoESub sandbox environment for production use.

## 📋 Prerequisites

### Required Services
- **Azure Static Web Apps** (recommended) OR **Azure App Service**
- **Azure APIM Gateway** (backend API proxy)
- **Azure Entra ID** (authentication)
- **Azure Blob Storage** (context bundle file uploads)
- **Node.js 18+** (build environment)

### Required Access
- Azure subscription admin access
- APIM configuration permissions
- Entra ID app registration permissions
- Static Web Apps or App Service deployment permissions

## 🏗️ Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.production` file:

```env
# APIM Gateway Base URL (required)
VITE_APIM_BASE_URL=https://api.esdaicoe.example.gc.ca/devbench/v1

# Optional: Enable demo mode fallback
VITE_DEMO_MODE_ENABLED=true

# Optional: Default language
VITE_DEFAULT_LANGUAGE=en
```

### 3. Build for Production
```bash
npm run build
```

This creates a `dist/` directory with optimized assets:
- Minified JavaScript bundles
- Optimized CSS
- Static assets
- index.html entry point

### 4. Preview Build Locally
```bash
npm run preview
```
Access at `http://localhost:4173` to verify build.

## 🌐 Deployment Options

### Option A: Azure Static Web Apps (Recommended)

**Benefits**:
- Built-in CDN
- Automatic HTTPS
- Staging environments
- GitHub Actions integration
- Low cost for internal apps

**Steps**:

1. **Create Static Web App**
```bash
az staticwebapp create \
  --name eva-devbench \
  --resource-group esd-aicoe-rg \
  --location canadacentral \
  --sku Standard
```

2. **Configure Build Settings**
In Azure Portal → Static Web App → Configuration:
- **App location**: `/`
- **Api location**: `` (leave empty, using APIM)
- **Output location**: `dist`
- **Build command**: `npm run build`

3. **Set Environment Variables**
In Azure Portal → Static Web App → Configuration → Application settings:
```
VITE_APIM_BASE_URL=https://api.esdaicoe.example.gc.ca/devbench/v1
VITE_DEMO_MODE_ENABLED=false
```

4. **Deploy via GitHub Actions**

The GitHub Actions workflow is already configured in `.github/workflows/azure-static-web-apps.yml`.

**Required GitHub Secrets**:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Get this from Azure Portal → Static Web App → Deployment token

**Setup Steps**:

a. In Azure Portal, get your deployment token:
   - Navigate to your Static Web App
   - Go to "Settings" → "Deployment"
   - Copy the "Deployment token"

b. Add the secret to your GitHub repository:
   - Go to your GitHub repository
   - Navigate to "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Paste the deployment token

c. Push to main branch or create a pull request to trigger deployment

5. **Configure Routing**

The `staticwebapp.config.json` is already included in the project root and handles:
- SPA routing fallback to index.html
- API route configuration
- Security headers
- MIME type mappings

You can customize it for your Azure environment by updating the domain in the Content-Security-Policy header.

### Option B: Azure App Service

**Benefits**:
- More configuration options
- Custom domains easier
- Staging slots
- Better monitoring integration

**Steps**:

1. **Create App Service Plan**
```bash
az appservice plan create \
  --name eva-devbench-plan \
  --resource-group esd-aicoe-rg \
  --location canadacentral \
  --sku B1 \
  --is-linux
```

2. **Create Web App**
```bash
az webapp create \
  --name eva-devbench \
  --resource-group esd-aicoe-rg \
  --plan eva-devbench-plan \
  --runtime "NODE:18-lts"
```

3. **Configure App Settings**
```bash
az webapp config appsettings set \
  --name eva-devbench \
  --resource-group esd-aicoe-rg \
  --settings \
    VITE_APIM_BASE_URL="https://api.esdaicoe.example.gc.ca/devbench/v1" \
    VITE_DEMO_MODE_ENABLED="false"
```

4. **Deploy Build**
```bash
# Build locally
npm run build

# Create deployment package
cd dist
zip -r ../deploy.zip .
cd ..

# Deploy to Azure
az webapp deploy \
  --name eva-devbench \
  --resource-group esd-aicoe-rg \
  --src-path deploy.zip \
  --type zip
```

5. **Configure for SPA**
Add `web.config` to `dist/` before deployment:

```xml
<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

## 🔐 Authentication Configuration

### 1. Register Entra ID Application

1. **Azure Portal** → **Entra ID** → **App registrations** → **New registration**

2. **Configure App Registration**:
   - **Name**: EVA DevBench
   - **Supported account types**: Single tenant
   - **Redirect URI**: `https://eva-devbench.azurestaticapps.net/` (or your domain)

3. **Note Application (client) ID**

4. **Add Redirect URIs**:
   - Platform: Single-page application (SPA)
   - URIs:
     - `https://eva-devbench.azurestaticapps.net`
     - `http://localhost:5173` (dev)

5. **Configure API Permissions**:
   - Add: `api://devbench-api/DevBench.User`
   - Grant admin consent

### 2. Update Application Code

Modify `src/lib/config.ts`:

```typescript
export const ENTRA_CONFIG = {
  clientId: 'YOUR_CLIENT_ID',
  authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
  redirectUri: window.location.origin,
  scopes: ['api://devbench-api/DevBench.User']
}
```

Install MSAL:
```bash
npm install @azure/msal-browser @azure/msal-react
```

Update `src/lib/config.ts` `getAccessToken()`:

```typescript
import { PublicClientApplication } from '@azure/msal-browser'

const msalInstance = new PublicClientApplication({
  auth: ENTRA_CONFIG,
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
})

export async function getAccessToken(): Promise<string> {
  try {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      await msalInstance.loginRedirect({
        scopes: ENTRA_CONFIG.scopes
      })
      return ''
    }

    const response = await msalInstance.acquireTokenSilent({
      scopes: ENTRA_CONFIG.scopes,
      account: accounts[0]
    })

    return response.accessToken
  } catch (error) {
    console.error('Token acquisition failed:', error)
    await msalInstance.loginRedirect({
      scopes: ENTRA_CONFIG.scopes
    })
    return ''
  }
}
```

## 🔌 APIM Configuration

### 1. Configure CORS

In Azure APIM → APIs → DevBench API → Settings → CORS:

```
Allowed origins:
  - https://eva-devbench.azurestaticapps.net
  - http://localhost:5173 (dev only)

Allowed methods:
  - GET, POST, PUT, DELETE, OPTIONS

Allowed headers:
  - *

Allow credentials: Yes
```

### 2. Configure API Policies

Add inbound policy to validate tokens:

```xml
<policies>
  <inbound>
    <validate-jwt header-name="Authorization" failed-validation-httpcode="401">
      <openid-config url="https://login.microsoftonline.com/{TENANT_ID}/v2.0/.well-known/openid-configuration" />
      <audiences>
        <audience>api://devbench-api</audience>
      </audiences>
    </validate-jwt>
    
    <set-header name="x-forwarded-for" exists-action="override">
      <value>@(context.Request.IpAddress)</value>
    </set-header>
    
    <cors>
      <allowed-origins>
        <origin>https://eva-devbench.azurestaticapps.net</origin>
      </allowed-origins>
      <allowed-methods>
        <method>GET</method>
        <method>POST</method>
        <method>PUT</method>
        <method>DELETE</method>
        <method>OPTIONS</method>
      </allowed-methods>
      <allowed-headers>
        <header>*</header>
      </allowed-headers>
      <expose-headers>
        <header>*</header>
      </expose-headers>
    </cors>
  </inbound>
  <backend>
    <forward-request />
  </backend>
  <outbound />
  <on-error />
</policies>
```

## 📊 Monitoring & Logging

### Application Insights Integration

1. **Create Application Insights**
```bash
az monitor app-insights component create \
  --app eva-devbench-insights \
  --location canadacentral \
  --resource-group esd-aicoe-rg
```

2. **Add to Static Web App / App Service**
In Azure Portal → Configuration → Application settings:
```
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

3. **Add Client-Side Tracking**
```bash
npm install @microsoft/applicationinsights-web
```

Create `src/lib/telemetry.ts`:
```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true
  }
})

appInsights.loadAppInsights()
appInsights.trackPageView()

export default appInsights
```

## 🧪 Validation Checklist

Before going live:

- [ ] Build succeeds without warnings
- [ ] Demo mode works with mock data
- [ ] APIM connection successful (/health endpoint returns 200)
- [ ] Authentication flow completes (Entra ID)
- [ ] File upload to blob storage works
- [ ] SSE events stream correctly
- [ ] All pages responsive on mobile/tablet/desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces correctly
- [ ] Both EN and FR languages display
- [ ] Review mode toggles correctly
- [ ] File review status persists after refresh
- [ ] Security headers set correctly
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Application Insights receiving telemetry
- [ ] Error boundaries catch and display errors gracefully

## 🚨 Troubleshooting

### Issue: "Not authenticated" banner persists
**Solution**: Check `getAccessToken()` implementation and Entra ID configuration

### Issue: APIM returns 401 Unauthorized
**Solution**: Verify JWT token is valid and audience matches APIM policy

### Issue: CORS errors in browser console
**Solution**: Add frontend domain to APIM CORS allowed origins

### Issue: SSE events not streaming
**Solution**: Verify APIM supports SSE (streaming), check Content-Type: text/event-stream

### Issue: File uploads fail
**Solution**: Check signed URL expiration, verify blob storage CORS settings

### Issue: Build errors with "Cannot find module"
**Solution**: Run `npm ci` to clean install dependencies

### Issue: Styles not loading
**Solution**: Verify `index.html` includes `/src/main.css`

## 📈 Performance Optimization

### Recommendations for Production

1. **Enable CDN**: Use Azure Front Door or CDN for static assets
2. **Compress Assets**: Enable gzip/brotli compression (automatic in Static Web Apps)
3. **Cache Headers**: Set appropriate cache durations for /assets/*
4. **Lazy Loading**: Already implemented for routes
5. **Code Splitting**: Vite handles automatically
6. **Image Optimization**: Use WebP format for icons/images
7. **Bundle Analysis**: Run `npm run build -- --analyze` to check bundle size

## 🔒 Security Hardening

### Production Security Checklist

- [ ] Content Security Policy (CSP) headers configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (HSTS) enabled
- [ ] No console.log statements in production builds
- [ ] Environment variables never exposed client-side (except VITE_ prefixed)
- [ ] All API calls use HTTPS
- [ ] Sensitive data warnings active for PB data class
- [ ] Rate limiting configured in APIM
- [ ] Authentication required for all API endpoints
- [ ] RBAC enforced in backend

## 📞 Support Contacts

- **Azure Issues**: Azure support ticket
- **APIM Configuration**: EsDAICoE platform team
- **Entra ID**: Identity and access management team
- **Application Issues**: Review EXPORT.md and PRD.md

---

**Document Version**: 1.0  
**Last Updated**: 2024-01  
**Maintained By**: EVA DevBench Team
