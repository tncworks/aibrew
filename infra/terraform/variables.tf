variable "project_id" {
  description = "GCP プロジェクトID (環境別)"
  type        = string
}

variable "region" {
  description = "Cloud Run / Scheduler のリージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "environment" {
  description = "dev / stg / prod"
  type        = string
}

variable "web_image" {
  description = "Next.js サービス用のコンテナイメージ"
  type        = string
}

variable "job_image" {
  description = "Cloud Run Jobs (crawler/summarize/publish) 用のコンテナイメージ"
  type        = string
}

variable "scheduler_timezone" {
  description = "Cloud Scheduler のタイムゾーン"
  type        = string
  default     = "Asia/Tokyo"
}
