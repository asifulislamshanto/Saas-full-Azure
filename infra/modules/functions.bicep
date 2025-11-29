
// Azure Functions (Backend)
module functions 'modules/functions.bicep' = {
  name: 'functionsDeployment'
  params: {
    functionAppName: '${baseName}-functions'
    location: location
    storageAccountName: storage.outputs.storageAccountName
    cosmosEndpoint: cosmosdb.outputs.endpoint
    cosmosKey: cosmosdb.outputs.primaryKey
    cosmosDatabase: cosmosdb.outputs.databaseName
    storageConnectionString: storage.outputs.connectionString
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    jwtSecret: jwtSecret
    stripeSecretKey: stripeSecretKey
    stripeWebhookSecret: stripeWebhookSecret
    frontendUrl: frontendUrl
  }
}
