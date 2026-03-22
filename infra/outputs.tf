output "resource_group_name" {
  description = "Nome del Resource Group"
  value       = azurerm_resource_group.main.name
}

output "static_web_app_url" {
  description = "URL pubblico dello Static Web App"
  value       = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "static_web_app_api_key" {
  description = "API key per il deploy (sensibile)"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}
