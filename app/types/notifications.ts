export type NotificationType = 'announcement' | 'platform_update' | 'promotion' | 'security_alert'
export type NotificationTarget = 'all' | 'clients' | 'lawyers'

export interface Notification {
  id: number | string
  title: string
  message: string
  type: NotificationType
  target: NotificationTarget
  views?: number
  delivered?: number
  created_at?: string
}

export interface NotificationAnalytics {
  sent_by_type: {
    announcement: number
    platform_update: number
    promotion: number
    security_alert: number
  }
  last_broadcast_performance: {
    open_rate: number
    opened: number
    delivered: number
    recipient_count: number
  }
}

export interface NotificationMeta {
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export interface NotificationResponse {
  success: boolean
  data: {
    data: {
      notifications: Notification[]
      analytics: NotificationAnalytics
    }
    meta: NotificationMeta
  }
}

export interface CreateNotificationPayload {
  title: string
  message: string
  type: NotificationType
  target: NotificationTarget
}

export interface UpdateNotificationPayload {
  id: number | string
  [key: string]: unknown
}
