locals {
  monitoring_metric_prefix = "custom.googleapis.com/aibrew/${var.environment}"
}

resource "google_monitoring_alert_policy" "digest_slo" {
  display_name = "aibrew-${var.environment}-digest-slo"
  combiner     = "OR"

  conditions {
    display_name = "Digest pipeline success before 06:45"
    condition_monitoring_query_language {
      duration = "0s"
      query    = <<-EOT
        fetch ${local.monitoring_metric_prefix}/digest/pipeline_success
        | filter metric.slot = '0630'
        | group_by [], sum(val())
        | condition val() < 1
      EOT
      trigger {
        count = 1
      }
    }
  }

  notification_channels = var.notification_channels
  documentation {
    content  = "07:00 JST版の生成が完了しなかったため、自動フォールバックを確認してください。"
    mime_type = "text/markdown"
  }
}

resource "google_monitoring_alert_policy" "monthly_cost" {
  display_name = "aibrew-${var.environment}-cost-guardrail"
  combiner     = "OR"

  conditions {
    display_name = "Monthly cost exceeds ${var.monthly_cost_threshold} USD"
    condition_monitoring_query_language {
      duration = "0s"
      query    = <<-EOT
        fetch ${local.monitoring_metric_prefix}/billing/monthly_usd
        | group_by [], sum(val())
        | condition val() > ${var.monthly_cost_threshold}
      EOT
      trigger {
        count = 1
      }
    }
  }

  notification_channels = var.notification_channels
  documentation {
    content  = "Cloud Run/Vertex AIコストが閾値を超えました。ジョブ設定とトラフィックを確認してください。"
    mime_type = "text/markdown"
  }
}
