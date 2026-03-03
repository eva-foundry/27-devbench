# Quick Deployment Reference

## ⚡ TL;DR - Get Deployed in 5 Minutes

### 1. Create Static Web App (Azure Portal)
```
Resource Type: Static Web App
Name: eva-devbench
Region: Canada Central
Plan: Standard
```

### 2. Copy Deployment Token
```
Azure Portal → Your Static Web App → Settings → Deployment → Copy Token
```

### 3. Add GitHub Secret
```
GitHub Repo → Settings → Secrets → Actions → New secret
Name: AZURE_STATIC_WEB_APPS_API_TOKEN
Value: [paste token]
```

### 4. Push to Main
```bash
git push origin main
```

### 5. Access Your App
```
GitHub Actions → Check deployment
Azure Portal → Static Web App → URL → Open
```

## 📋 Pre-Deployment Checklist

- [ ] Azure Static Web App created
- [ ] Deployment token copied
- [ ] GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` configured
- [ ] Build succeeds locally: `npm run build`
- [ ] Code pushed to `main` branch

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `.github/workflows/azure-static-web-apps.yml` | GitHub Actions workflow |
| `staticwebapp.config.json` | Azure SWA configuration |
| `package.json` | Build scripts |
| `vite.config.ts` | Build configuration |

## 🌐 URLs After Deployment

| Environment | URL Pattern |
|-------------|-------------|
| Production | `https://[app-name].azurestaticapps.net` |
| PR Preview | `https://[app-name]-pr-[number].azurestaticapps.net` |
| Custom Domain | `https://eva-devbench.example.gc.ca` |

## 🔧 Common Commands

```bash
# Build locally
npm run build

# Preview build
npm run preview

# Check Azure Static Web App
az staticwebapp show \
  --name eva-devbench \
  --resource-group esd-aicoe-rg

# List deployments
az staticwebapp environment list \
  --name eva-devbench \
  --resource-group esd-aicoe-rg
```

## 🐛 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check `npm ci` runs locally |
| Blank page | Verify `staticwebapp.config.json` routing |
| 401 errors | Configure APIM CORS |
| Assets missing | Check `dist/` folder contents |

## 📖 Full Documentation

- **Complete deployment guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Azure-specific setup**: [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)
- **Application overview**: [README.md](./README.md)
- **Product requirements**: [PRD.md](./PRD.md)

## 🆘 Support

- **Azure issues**: Azure support portal
- **GitHub Actions**: Check workflow logs
- **APIM connectivity**: Platform team
- **Application bugs**: Review [EXPORT.md](./EXPORT.md)
