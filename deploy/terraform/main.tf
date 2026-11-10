terraform {
  required_version = ">= 1.6"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.31"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

# Generated at apply time and stored only in Terraform state / the cluster Secret.
# Use a remote, encrypted backend (S3+KMS, GCS, Terraform Cloud) for real environments.
resource "random_password" "db" {
  length  = 32
  special = false
}

resource "random_password" "jwt" {
  length  = 64
  special = false
}

resource "kubernetes_namespace_v1" "app" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/part-of" = "chapter-and-co"
    }
  }
}

# Creates the Secret that deploy/base expects (name: chapter-and-co-backend).
resource "kubernetes_secret_v1" "backend" {
  metadata {
    name      = "chapter-and-co-backend"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }
  data = {
    DB_USERNAME = var.db_username
    DB_PASSWORD = random_password.db.result
    JWT_SECRET  = random_password.jwt.result
  }
}

resource "kubernetes_secret_v1" "postgres" {
  metadata {
    name      = "postgres-credentials"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }
  data = {
    POSTGRES_DB       = "chapter_and_co"
    POSTGRES_USER     = var.db_username
    POSTGRES_PASSWORD = random_password.db.result
  }
}

resource "kubernetes_stateful_set_v1" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }
  spec {
    service_name = "postgres"
    replicas     = 1
    selector {
      match_labels = { app = "postgres" }
    }
    template {
      metadata {
        labels = { app = "postgres" }
      }
      spec {
        container {
          name  = "postgres"
          image = "postgres:17-alpine"
          port {
            container_port = 5432
          }
          env_from {
            secret_ref {
              name = kubernetes_secret_v1.postgres.metadata[0].name
            }
          }
          env {
            name  = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }
          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
          }
          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", "chapter_and_co"]
            }
            period_seconds = 10
          }
        }
      }
    }
    volume_claim_template {
      metadata {
        name = "data"
      }
      spec {
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = { storage = var.db_storage }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }
  spec {
    selector = { app = "postgres" }
    port {
      port        = 5432
      target_port = 5432
    }
    cluster_ip = "None"
  }
}
