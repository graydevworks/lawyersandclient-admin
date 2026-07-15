export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface TicketReporter {
  id: number | string
  name: string
  email?: string
  role?: string
}

export interface ResolutionNote {
  id: number | string
  note: string
  created_at: string
  created_by?: {
    id: number | string
    name: string
  }
}

export interface Ticket {
  id: number | string
  subject: string
  description: string
  status: TicketStatus
  reporter: TicketReporter
  created_at: string
  updated_at?: string
  resolution_notes?: ResolutionNote[]
  assigned_to?: {
    id: number | string
    name: string
  }
  attachment_url?: string
}

export interface TicketMeta {
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export interface TicketResponse {
  success: boolean
  data: {
    data: {
      tickets?: Ticket[]
      data?: Ticket[]
      ticket?: Ticket
    }
    meta?: TicketMeta
  }
}

export interface TicketStats {
  success: boolean
  data: {
    total: number
    open: number
    in_progress: number
    resolved: number
    closed: number
    avg_resolution_time?: string
    period?: {
      date_from: string
      date_to: string
    }
  }
}

export interface UpdateTicketPayload {
  status?: TicketStatus
  resolution_note?: string
}

export interface ResolutionNotePayload {
  note: string
}
