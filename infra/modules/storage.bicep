// Storage Account
module storage 'modules/storage.bicep' = {
  name: 'storageDeployment'
  params: {
    storageAccountName: '${baseName}storage'
    location: location
    containerName: 'assets'
  }
}
