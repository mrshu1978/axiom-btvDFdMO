variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  default     = "f7aee463-0253-40aa-a498-772a492be96c"
}

variable "location" {
  description = "Azure region (EU — GDPR compliance)"
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Nome del Resource Group dedicato al progetto"
  type        = string
  default     = "rg-btvdfmo-prod"
}

variable "static_app_name" {
  description = "Nome dello Static Web App"
  type        = string
  default     = "stapp-btvdfmo-prod"
}

variable "environment" {
  description = "Ambiente di deploy"
  type        = string
  default     = "prod"
}
