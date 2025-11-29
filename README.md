# Multi-Tenant SaaS Platform on Azure

A production-ready, full-stack multi-tenant SaaS application built with React, Azure Functions, Cosmos DB, and Stripe.

## 🚀 Features

- **Multi-Tenancy** - Complete tenant isolation for data and assets
- **Authentication** - JWT-based auth with secure password hashing
- **File Management** - Upload, list, and delete files with Azure Blob Storage
- **Subscription Management** - Stripe integration with multiple pricing tiers
- **Storage Quotas** - Per-tenant storage limits enforcement
- **Role-Based Access** - Admin and user roles with permission control
- **Serverless Backend** - Azure Functions for auto-scaling REST API
- **Modern Frontend** - React with Tailwind CSS and responsive design
- **Infrastructure as Code** - Bicep templates for reproducible deployments

## 📁 Project Structure

```
saas-fullstack-azure/
│
├── infra/                     # Azure infrastructure (Bicep)
│   ├── main.bicep             # Main orchestrator
│   ├── parameters.dev.json    # Dev configuration
│   ├── parameters.prod.json   # Prod configuration
│   ├── deploy.sh              # Bash deployment script
│   ├── deploy.ps1             # PowerShell deployment script
│   └── modules/
│       ├── storage.bicep      # Blob storage for files
│       ├── cosmosdb.bicep     # NoSQL database
│       ├── functions.bicep    # Serverless API
│       └── appinsights.bicep  # Monitoring & logs
│
├── backend/                   # Azure Functions API
│   ├── package.json
│   ├── host.json
│   ├── local.settings.json
│   ├── utils/
│   │   ├── db.js              # Cosmos DB helpers
│   │   ├── auth.js            # JWT & password utils
│   │   ├── storage.js         # Blob storage helpers
│   │   └── response.js        # HTTP response utils
│   └── functions/
│       ├── auth/
│       │   ├── login/         # User login endpoint
│       │   └── register/      # User registration endpoint
│       ├── assets/
│       │   ├── upload-url/    # Generate upload URLs
│       │   ├── list/          # List tenant assets
│       │   └── delete/        # Delete assets
│       └── subscription/
│           ├── create/        # Create Stripe checkout
│           └── webhook/       # Handle Stripe webhooks
│
├── frontend/                  # React application
│   ├── package.json
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── components/        # Reusable UI components
│       ├── pages/             # Page components
│       ├── context/           # React context (auth, tenant)
│       └── services/          # API calls
│
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client

### Backend
- **Azure Functions** - Serverless compute
- **Node.js 18** - JavaScript runtime
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Stripe** - Payment processing

### Infrastructure
- **Azure Cosmos DB** - NoSQL database (Serverless)
- **Azure Blob Storage** - Object storage for files
- **Azure Functions** - Serverless API hosting
- **Application Insights** - Monitoring and logging
- **Azure Bicep** - Infrastructure as Code

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Azure CLI** ([Install](https://docs.microsoft.com/cli/azure/install-azure-cli))
- **Azure Functions Core Tools** ([Install](https://docs.microsoft.com/azure/azure-functions/functions-run-local))
- **Azure Subscription** ([Free Trial](https://azure.microsoft.com/free/))
- **Stripe Account** ([Sign Up](https://stripe.com/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/saas-fullstack-azure.git
cd saas-fullstack-azure
```

### 2. Deploy Infrastructure

```bash
cd infra

# Login to Azure
az login
az account set --subscription "Your Subscription"

# Update parameters
nano parameters.dev.json
# Edit: baseName, stripeSecretKey, jwtSecret

# Deploy
chmod +x deploy.sh
./deploy.sh dev eastus

# Note the outputs: functionAppUrl, cosmosEndpoint, storageAccountName
```

### 3. Deploy Backend

```bash
cd ../backend

# Install dependencies
npm install

# Deploy to Azure
func azure functionapp publish {your-baseName}-functions
```

### 4. Run Frontend Locally

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=https://{your-baseName}-functions.azurewebsites.net
EOF

# Start development server
npm start
```

Visit http://localhost:3000

## 🔧 Local Development

### Backend Local Development

```bash
cd backend

# Install dependencies
npm install

# Configure local settings
cp local.settings.json.example local.settings.json
# Edit local.settings.json with your Azure credentials

# Start local function host
npm start
```

Functions available at: http://localhost:7071/api/

### Frontend Local Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend available at: http://localhost:3000

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│      Azure Functions (REST API)         │
│  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │  Auth  │  │ Assets │  │ Subscr.  │  │
│  └────────┘  └────────┘  └──────────┘  │
└───────┬─────────────┬──────────┬────────┘
        │             │          │
        ▼             ▼          ▼
  ┌──────────┐  ┌─────────┐  ┌────────┐
  │ Cosmos   │  │  Blob   │  │ Stripe │
  │   DB     │  │ Storage │  │  API   │
  └──────────┘  └─────────┘  └────────┘
```

## 📊 Database Schema

### Tenants Container
```json
{
  "id": "tenant-uuid",
  "name": "Company Name",
  "slug": "company-name",
  "subscription": {
    "plan": "pro",
    "status": "active",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx"
  },
  "settings": {
    "maxUsers": 50,
    "maxStorage": 107374182400,
    "features": ["basic", "priority-support"]
  }
}
```

### Users Container
```json
{
  "id": "user-uuid",
  "tenantId": "tenant-uuid",
  "email": "user@example.com",
  "password": "hashed-password",
  "fullName": "John Doe",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Assets Container
```json
{
  "id": "asset-uuid",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "fileName": "document.pdf",
  "blobName": "uuid.pdf",
  "size": 1024000,
  "contentType": "application/pdf",
  "status": "uploaded",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 🔐 Authentication Flow

1. User registers → Creates tenant + admin user
2. User logs in → Returns JWT token
3. Client stores token → Includes in Authorization header
4. Backend validates token → Extracts user/tenant info
5. Backend enforces tenant isolation → All queries filtered by tenantId

## 💳 Subscription Plans

| Plan | Users | Storage | Price |
|------|-------|---------|-------|
| Free | 5 | 1 GB | $0 |
| Starter | 10 | 10 GB | $29/mo |
| Pro | 50 | 100 GB | $99/mo |
| Enterprise | Unlimited | Unlimited | $299/mo |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new tenant & user
- `POST /api/auth/login` - Login and get JWT token

### Assets (Requires Auth)
- `POST /api/assets/upload-url` - Get SAS URL for upload
- `GET /api/assets` - List tenant assets
- `DELETE /api/assets/{id}` - Delete asset

### Subscriptions (Admin Only)
- `POST /api/subscription/create` - Create Stripe checkout
- `POST /api/subscription/webhook` - Stripe webhook handler

## 📱 Frontend Pages

- `/` - Landing page
- `/login` - User login
- `/register` - New tenant registration
- `/dashboard` - Main dashboard (protected)
- `/assets` - File management (protected)
- `/subscription` - Subscription management (protected)
- `/settings` - Account settings (protected)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Production Deployment

### 1. Create Key Vault for Secrets

```bash
# Create Key Vault
az keyvault create \
  --name mycompany-kv \
  --resource-group saas-prod-rg \
  --location eastus

# Add secrets
az keyvault secret set --vault-name mycompany-kv \
  --name jwt-secret --value "your-production-secret"
az keyvault secret set --vault-name mycompany-kv \
  --name stripe-secret-key --value "sk_live_..."
az keyvault secret set --vault-name mycompany-kv \
  --name stripe-webhook-secret --value "whsec_..."
```

### 2. Update Production Parameters

Edit `infra/parameters.prod.json` with your Key Vault ID

### 3. Deploy Production Infrastructure

```bash
cd infra
./deploy.sh prod eastus
```

### 4. Deploy Backend to Production

```bash
cd backend
func azure functionapp publish mycompany-functions
```

### 5. Deploy Frontend

**Option 1: Vercel**
```bash
cd frontend
npm run build
vercel --prod
```

**Option 2: Netlify**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### 6. Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://mycompany-functions.azurewebsites.net/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 7. Configure Custom Domain (Optional)

```bash
# Add custom domain to Function App
az functionapp config hostname add \
  --webapp-name mycompany-functions \
  --resource-group saas-prod-rg \
  --hostname api.yourdomain.com
```

## 📊 Monitoring

### Application Insights

```bash
# View in Azure Portal
az portal show

# Stream function logs
func azure functionapp logstream mycompany-functions
```

### Cost Monitoring

```bash
# View cost analysis
az consumption usage list \
  --start-date 2024-01-01 \
  --end-date 2024-01-31
```

## 💰 Cost Estimation

### Development Environment
- Cosmos DB (Serverless): ~$1-5/month
- Storage Account: ~$1-3/month
- Function App (Consumption): ~$0-5/month
- Application Insights: ~$2-5/month
- **Total: ~$5-20/month**

### Production (Moderate Traffic)
- Cosmos DB: ~$50-200/month
- Storage Account: ~$10-50/month
- Function App: ~$150-300/month
- Application Insights: ~$20-100/month
- **Total: ~$230-650/month**

## 🔒 Security Best Practices

✅ All secrets stored in Azure Key Vault (production)  
✅ HTTPS-only enforcement  
✅ JWT tokens with expiration  
✅ Password hashing with bcrypt  
✅ CORS configured for frontend only  
✅ Storage account private (no public blob access)  
✅ Input validation on all endpoints  
✅ SQL injection prevention (parameterized queries)  
✅ Rate limiting on API endpoints  
✅ Application Insights for security monitoring

## 🐛 Troubleshooting

### Backend Issues

**Functions not starting:**
```bash
# Check logs
func azure functionapp logstream {functionAppName}

# Verify environment variables
az functionapp config appsettings list \
  --name {functionAppName} \
  --resource-group {resourceGroup}
```

**Can't connect to Cosmos DB:**
- Verify firewall settings allow Azure services
- Check connection string in environment variables
- Ensure containers are created

### Frontend Issues

**API calls failing:**
- Verify REACT_APP_API_URL is correct
- Check CORS configuration in backend
- Verify JWT token is being sent

**Build fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Infrastructure Documentation](./infra/README.md)
- [Azure Functions Docs](https://docs.microsoft.com/azure/azure-functions/)
- [Cosmos DB Docs](https://docs.microsoft.com/azure/cosmos-db/)
- [Stripe API Docs](https://stripe.com/docs/api)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Azure Functions](https://azure.microsoft.com/services/functions/)
- [Cosmos DB](https://azure.microsoft.com/services/cosmos-db/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/saas-fullstack-azure/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/saas-fullstack-azure/discussions)
- **Email**: support@yourcompany.com

## 🗺️ Roadmap

- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Team management
- [ ] API rate limiting
- [ ] Webhooks for tenant events
- [ ] Advanced analytics dashboard
- [ ] Multi-region deployment
- [ ] CDN integration
- [ ] Docker support

---

**Built with ❤️ using Azure, React, and Stripe**