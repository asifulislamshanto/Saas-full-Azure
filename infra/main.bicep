@description('The name of the environment (dev, staging, prod)')
param environment string = 'dev'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The base name for all resources')
param baseName string = 'saas${uniqueString(resourceGroup().id)}'

@description('The Stripe secret key')
@secure()
param stripeSecretKey string

@description('The Stripe webhook secret')
@secure()
param stripeWebhookSecret string

@description('The JWT secret for token generation')
@secure()
param jwtSecret string

@description('The frontend URL for CORS')
param frontendUrl string = 'https://${baseName}-frontend.azurewebsites.net'



// Main Infrastructure Orchestration
targetScope = 'resourceGroup'

// Parameters
@description('Environment name')
param environment string

@description('Location for resources')
param location string = resourceGroup().location

@description('Base name for resources')
param baseName string

@secure()
param stripeSecretKey string

@secure()
param stripeWebhookSecret string

@secure()
param jwtSecret string

param frontendUrl string = 'http://localhost:3000'

// Variables
var storageAccountName = '${baseName}storage'
var cosmosAccountName = '${baseName}-cosmos'
var functionAppName = '${baseName}-functions'
var appInsightsName = '${baseName}-insights'

// Storage
module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    storageAccountName: storageAccountName
    location: location
  }
}

// Cosmos DB
module cosmos 'modules/cosmosdb.bicep' = {
  name: 'cosmosdb'
  params: {
    accountName: cosmosAccountName
    location: location
  }
}

// Application Insights
module insights 'modules/appinsights.bicep' = {
  name: 'appinsights'
  params: {
    appInsightsName: appInsightsName
    location: location
  }
}

// Functions
module functions 'modules/functions.bicep' = {
  name: 'functions'
  params: {
    functionAppName: functionAppName
    location: location
    storageConnectionString: storage.outputs.connectionString
    cosmosEndpoint: cosmos.outputs.endpoint
    cosmosKey: cosmos.outputs.primaryKey
    cosmosDatabase: cosmos.outputs.databaseName
    appInsightsKey: insights.outputs.instrumentationKey
    jwtSecret: jwtSecret
    stripeSecretKey: stripeSecretKey
    stripeWebhookSecret: stripeWebhookSecret
    frontendUrl: finalFrontendUrl
  }
}

// Static Web App
module staticWeb 'modules/staticwebapp.bicep' = {
  name: 'staticwebapp'
  params: {
    staticWebAppName: staticWebAppName
    location: location
    backendUrl: functions.outputs.functionAppUrl
  }
}

// Outputs
output functionAppUrl string = functions.outputs.functionAppUrl
output staticWebAppUrl string = staticWeb.outputs.staticWebAppUrl
output cosmosEndpoint string = cosmos.outputs.endpoint
output storageAccountName string = storage.outputs.storageAccountName
