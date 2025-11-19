terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  env_suffix = "-${var.environment}"
}

resource "google_project_service" "required" {
  for_each = toset([
    "run.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudscheduler.googleapis.com",
    "secretmanager.googleapis.com",
    "firestore.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
  ])
  service = each.key
}

resource "google_firestore_database" "default" {
  name        = "(default)"
  project     = var.project_id
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.required]
}

resource "google_secret_manager_secret" "slack_webhook" {
  secret_id = "digest-slack-webhook${local.env_suffix}"
  replication {
    auto {}
  }
}

resource "google_cloud_run_v2_service" "digest_web" {
  name     = "digest-web${local.env_suffix}"
  location = var.region

  template {
    containers {
      image = var.web_image
      resources {
        limits = {
          cpu    = "0.25"
          memory = "512Mi"
        }
      }
    }
    scaling {
      max_instance_count = 10
      min_instance_count = 0
    }
  }

  traffic {
    percent         = 100
    type            = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image]
  }
}

resource "google_cloud_run_v2_job" "digest_jobs" {
  for_each = {
    crawler   = "digest-crawler"
    summarize = "digest-summarize"
    publish   = "digest-publish"
  }

  name     = "${each.value}${local.env_suffix}"
  location = var.region

  template {
    template {
      containers {
        image = var.job_image
        env {
          name  = "DIGEST_STAGE"
          value = each.key
        }
      }
      service_account = "projects/${var.project_id}/serviceAccounts/cloud-run-invoker@${var.project_id}.iam.gserviceaccount.com"
    }
  }
}

resource "google_cloud_scheduler_job" "digest_slots" {
  for_each = {
    slot0530 = "30 5 * * *"
    slot0600 = "0 6 * * *"
    slot0630 = "30 6 * * *"
  }

  name        = "digest-${each.key}${local.env_suffix}"
  description = "Cloud Run crawler job trigger for ${each.key}"
  schedule    = each.value
  time_zone   = var.scheduler_timezone

  http_target {
    uri = "https://cloudrun.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/${google_cloud_run_v2_job.digest_jobs["crawler"].name}:run"
    http_method = "POST"
    oidc_token {
      service_account_email = "projects/${var.project_id}/serviceAccounts/cloud-run-invoker@${var.project_id}.iam.gserviceaccount.com"
    }
  }
}
