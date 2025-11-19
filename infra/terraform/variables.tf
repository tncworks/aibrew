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

variable "notification_channels" {
  description = "Cloud Monitoring Alert Policyの通知チャンネル (オプション)"
  type        = list(string)
  default     = []
}

variable "monthly_cost_threshold" {
  description = "月次コスト警戒ライン (USD)"
  type        = number
  default     = 40
}
