// Cosmos DB
module cosmosdb 'modules/cosmosdb.bicep' = {
  name: 'cosmosdbDeployment'
  params: {
    accountName: '${baseName}-cosmos'
    location: location
    databaseName: 'saas-db'
  }
}
