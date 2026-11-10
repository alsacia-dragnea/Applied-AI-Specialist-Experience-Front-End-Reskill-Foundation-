variable "kubeconfig_path" {
  description = "Path to the kubeconfig of the target cluster (ROSA / ROKS / any Kubernetes)."
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "kubeconfig context to use. Null = current context."
  type        = string
  default     = null
}

variable "namespace" {
  description = "Namespace for the application."
  type        = string
  default     = "chapter-and-co-prod"
}

variable "db_username" {
  description = "PostgreSQL username."
  type        = string
  default     = "chapter"
}

variable "db_storage" {
  description = "PersistentVolumeClaim size for PostgreSQL."
  type        = string
  default     = "5Gi"
}
