# SaaS Backend - Azure Functions

Multi-tenant SaaS backend built with Azure Functions, Cosmos DB, and Blob Storage.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Multi-tenancy**: Tenant isolation for all data and assets
- **Asset Management**: Upload/download/delete files with SAS URLs
- **Subscription Management**: Stripe integration for payments
- **Storage Quotas**: Enforced per-tenant storage limits
- **Role-based Access**: Admin and user roles

## Project Structure

```
backend/
├── functions/
│   ├── auth/
│   │   ├── login/          # User login
│   │   └── register/       # User registration
│   ├── assets/
│   │   ├── upload-url/     # Generate upload URLs
│   │   ├── list/           # List tenant assets
│   │   └── delete/         # Delete assets
│   └── subscription/
│       ├── create/         # Create Stripe checkout
│       └── webhook/        # Handle Stripe webhooks
└── utils/
    ├── auth.js            # JWT & password utilities
    ├── db.js              # Cosmos DB helpers
    ├── storage.js         # Blob storage helpers
    └── response.js        # HTTP response utilities
```

## Prerequisites

- Node.js 18+
- Azure Functions Core Tools
- Azure account with:
  - Cosmos DB database
  - Storage Account
  - Function App (optional for deployment)
- Stripe account

## Environment Variables

Create `local.settings.json`:

```json
{
  "Values": {
    "COSMOS_ENDPOINT": "https://your-account.documents.azure.com:443/",
    "COSMOS_KEY": "your-cosmos-key",
    "COSMOS_DATABASE": "saas-db",
    "STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;...",
    "STORAGE_CONTAINER": "assets",
    "JWT_SECRET": "your-secret-key",
    "STRIPE_SECRET_KEY": "sk_test_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_...",
    "FRONTEND_URL": "http://localhost:3000"
  }
}
```

## Cosmos DB Setup

Create these containers in your database:

1. **tenants** (partition key: `/id`)
2. **users** (partition key: `/tenantId`)
3. **assets** (partition key: `/tenantId`)

## Installation

```bash
cd backend
npm install
```

## Development

Start the local development server:

```bash
npm start
```

Functions will be available at `http://localhost:7071/api/`

## API Endpoints

### Authentication

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "tenantName": "My Company"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Assets

**POST** `/api/assets/upload-url` (Auth required)
```json
{
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "contentType": "application/pdf"
}
```

**GET** `/api/assets?page=1&limit=20` (Auth required)

**DELETE** `/api/assets/{id}` (Auth required)

### Subscriptions

**POST** `/api/subscription/create` (Admin only)
```json
{
  "plan": "pro"
}
```

**POST** `/api/subscription/webhook` (Stripe webhook)

## Authentication

Include JWT token in requests:

```
Authorization: Bearer <token>
```

## Subscription Plans

- **Free**: 5 users, 1GB storage
- **Starter**: 10 users, 10GB storage
- **Pro**: 50 users, 100GB storage
- **Enterprise**: Unlimited users and storage

## Deployment

Deploy to Azure:

```bash
func azure functionapp publish <function-app-name>
```

## Security Notes

- Change JWT_SECRET in production
- Use environment variables for all secrets
- Enable HTTPS only in production
- Configure CORS appropriately
- Set up Application Insights for monitoring

## Stripe Webhook Setup

1. Create webhook endpoint in Stripe Dashboard
2. Point to: `https://your-function-app.azurewebsites.net/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Testing

```bash
npm test
```

## License

MIT