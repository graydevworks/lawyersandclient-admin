export type ReportStatus = 'pending' | 'reviewed' | 'resolved'

export interface Reporter {
  name: string
}

export interface Reported {
  name: string
}

export interface Report {
  id: number | string
  subject?: string
  title?: string
  description?: string
  details?: string
  status: ReportStatus
  reporter: Reporter
  reported: Reported
  created_at?: string
  resolution_note?: string
}

export interface ReportMeta {
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export interface ReportResponse {
  success: boolean
  data: {
    data: {
      reports?: Report[]
      data?: Report[]
    }
    meta?: ReportMeta
  }
}

export interface UpdateReportPayload {
  status: ReportStatus
  resolution_note: string
}
