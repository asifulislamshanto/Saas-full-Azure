// main.bicep - Minimal clean SaaS setup

@description('Name prefix for all resources')
param prefix string = 'saasapp'

@description('Azure region')
param location string = resourceGroup().location

// --- Storage Account (for assets) ---
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-06-01' = {
  name: '${prefix}storage'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

// --- Blob Container for tenant assets ---
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-06-01' = {
  parent: storageAccount
  name: 'tenant-assets'
  properties: {
    publicAccess: 'None'
  }
}

// --- Cosmos DB (NoSQL) ---
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-03-15' = {
  name: '${prefix}cosmos'
  location: location
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    enableFreeTier: true
    capabilities: [
      { name: 'EnableServerless' }
    ]
  }
}

// --- Cosmos DB database ---
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-03-15' = {
  parent: cosmosAccount
  name: 'saasdb'
  properties: {
    resource: {
      id: 'saasdb'
    }
  }
}

// --- Azure Functions App Plan ---
resource functionPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${prefix}-funcplan'
  location: location
  sku: {
    name: 'Y1' // Consumption plan
    tier: 'Dynamic'
  }
  kind: 'functionapp'
}

// --- Azure Functions App ---
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${prefix}-funcapp'
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: functionPlan.id
    siteConfig: {
      appSettings: [
        { name: 'FUNCTIONS_EXTENSION_VERSION'; value: '~4' }
        { name: 'WEBSITE_RUN_FROM_PACKAGE'; value: '1' }
        { name: 'AzureWebJobsStorage'; value: storageAccount.properties.primaryEndpoints.blob } // basic connection
      ]
    }
  }
}

// --- Frontend App Service (optional) ---
resource frontendApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${prefix}-frontend'
  location: location
  kind: 'app'
  properties: {
    serverFarmId: functionPlan.id
  }
}
