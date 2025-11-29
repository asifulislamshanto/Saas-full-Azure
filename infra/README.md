# Azure Infrastructure - Backend Only

Clean, modular Bicep templates for multi-tenant SaaS backend.

## Structure

```
infra/
├── main.bicep              # Orchestrator (50 lines)
├── parameters.dev.json     # Dev parameters
├── parameters.prod.json    # Prod parameters (Key Vault refs)
├── deploy.sh              # Bash deploy
├── deploy.ps1             # PowerShell deploy
└── modules/
    ├── storage.bicep      # Blob storage for assets
    ├── cosmosdb.bicep     # NoSQL database
    ├── functions.bicep    # Serverless API
    └── appinsights.bicep  # Monitoring & logs
```

## Quick Deploy

### 1. Configure
Edit `parameters.dev.json`:
```json
{
  "baseName": { "value": "yourcompany" },
  "stripeSecretKey": { "value": "sk_test_..." },
  "jwtSecret": { "value": "random-secret-key" },
  "frontendUrl": { "value": "http://localhost:3000" }
}
```

### 2. Deploy

**Bash:**
```bash
chmod +x deploy.sh
./deploy.sh dev eastus
```

**PowerShell:**
```powershell
.\deploy.ps1 -Environment dev -Location eastus
```

**Azure CLI:**
```bash
az group create --name saas-dev-rg --location eastus
az deployment group create \
  --resource-group saas-dev-rg \
  --template-file main.bicep \
  --parameters parameters.dev.json
```

## Resources Deployed

| Resource | Purpose | Cost (dev) |
|----------|---------|------------|
| Cosmos DB | Multi-tenant database | ~$1-5/mo |
| Storage Account | File/asset storage | ~$1-3/mo |
| Function App | Backend REST API | ~$0-5/mo |
| App Insights | Monitoring & logs | ~$2-5/mo |

**Total:** ~$5-20/month (development)

## Module Details

### storage.bicep
- Standard LRS storage
- `assets` container for uploads
- CORS enabled for browser uploads
- SAS token support

### cosmosdb.bicep
- Serverless Cosmos DB (pay-per-request)
- Database: `saas-db`
- Containers:
  - `tenants` (partition: `/id`)
  - `users` (partition: `/tenantId`)
  - `assets` (partition: `/tenantId`)

### functions.bicep
- Linux Consumption Plan
- Node.js 18 runtime
- Environment variables:
  - Database credentials
  - Storage connection
  - Stripe keys
  - JWT secret
- CORS configured for frontend

### appinsights.bicep
- Log Analytics Workspace
- Application Insights component
- 30-day log retention

## Outputs

After deployment:

```bash
functionAppUrl        # https://yourcompany-functions.azurewebsites.net
cosmosEndpoint        # https://yourcompany-cosmos.documents.azure.com:443/
storageAccountName    # yourcompanystorage
```

## Deploy Backend Code

```bash
cd backend
func azure functionapp publish {functionAppName}
```

The function app name is: `{baseName}-functions`

## Frontend Deployment

The frontend can be deployed anywhere:

**Option 1: Vercel**
```bash
cd frontend
vercel --prod
```

**Option 2: Netlify**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=build
```

**Option 3: Azure Static Web Apps** (manual)
```bash
cd frontend
npm run build
# Upload build/ folder via Azure Portal
```

**Option 4: Any static host**
- Build: `npm run build`
- Deploy `build/` folder

Set environment variable:
```
REACT_APP_API_URL={functionAppUrl}
```

## Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `{functionAppUrl}/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to parameters

## Production Deployment

### 1. Create Key Vault
```bash
az keyvault create \
  --name mycompany-kv \
  --resource-group saas-prod-rg \
  --location eastus

# Add secrets
az keyvault secret set --vault-name mycompany-kv \
  --name jwt-secret --value "production-secret"
az keyvault secret set --vault-name mycompany-kv \
  --name stripe-secret-key --value "sk_live_..."
az keyvault secret set --vault-name mycompany-kv \
  --name stripe-webhook-secret --value "whsec_..."
```

### 2. Update parameters.prod.json
Update Key Vault ID and frontend URL

### 3. Deploy
```bash
./deploy.sh prod eastus
```

## Cost Optimization

**Dev Environment:**
- Serverless Cosmos DB (pay per request)
- Consumption Functions (pay per execution)
- LRS Storage (cheapest redundancy)
- **~$5-20/month**

**Production (moderate traffic):**
- Consider provisioned throughput for Cosmos DB
- Premium Functions for better performance
- GRS Storage for redundancy
- **~$100-300/month**

## Security Best Practices

✅ All secrets in Key Vault (production)  
✅ HTTPS only enforcement  
✅ CORS configured for frontend only  
✅ Storage account private (no public access)  
✅ Managed identities (can be enabled)  
✅ Application Insights for monitoring

## Clean Up

Delete everything:
```bash
az group delete --name saas-dev-rg --yes --no-wait
```

## Monitoring

View logs:
```bash
# Stream function logs
func azure functionapp logstream {functionAppName}

# View in portal
az portal show
# Navigate to Application Insights → Logs
```

## Troubleshooting

**Deployment fails:**
```bash
# Validate template
az deployment group validate \
  --resource-group saas-dev-rg \
  --template-file main.bicep \
  --parameters parameters.dev.json
```

**Function app not working:**
- Check Application Insights for errors
- Verify all environment variables are set
- Check function app logs in Azure Portal

**Can't connect to Cosmos DB:**
- Verify firewall settings (allow Azure services)
- Check if keys are correct
- Ensure containers are created

## Next Steps

1. ✅ Deploy infrastructure
2. 📦 Deploy backend code to Functions
3. 🎨 Deploy frontend to your preferred host
4. 🔗 Configure Stripe webhooks
5. 🧪 Test registration and login
6. 📤 Test file uploads
7. 💳 Test subscription flow