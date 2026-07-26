export const encrypt = (text: string, key: string) => {
  return [...text].map((char, i) =>
    (char.charCodeAt(0) ^ key.charCodeAt(i % key.length)).toString(16).padStart(2, '0')
  ).join('')
}

export const decrypt = (hex: string, key: string): string => {
  const pairs = hex.match(/.{1,2}/g)

  // Guard clause: if the string is empty or invalid, return empty string
  if (!pairs) return ''

  return pairs
    .map((hexChar: string, i: number) => {
      const charCode = parseInt(hexChar, 16) ^ key.charCodeAt(i % key.length)
      return String.fromCharCode(charCode)
    })
    .join('')
}

export async function fileToBase64(file: File, onProgress?: (percent: number) => void): Promise<string> {
  // For very large files, use streaming approach
  if (file.size > 100 * 1024 * 1024) { // 100MB threshold for streaming
    return await streamFileToBase64(file, onProgress)
  }

  return new Promise((resolve, reject) => {
    const reader: any = new FileReader()

    if (onProgress) {
      reader.onloadstart = () => onProgress(0)
      reader.onprogress = (e: ProgressEvent) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      reader.onloadend = () => onProgress(100)
    }

    reader.readAsDataURL(file)

    reader.onload = () => resolve(reader.result)
    reader.onerror = (error: any) => reject(error)
  })
}

// Streaming base64 conversion for very large files (can handle 1GB+)
export async function streamFileToBase64(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const chunkSize = 1024 * 1024 * 4 // 4MB chunks for better performance
  const fileSize = file.size
  let offset = 0
  let base64Result = ''

  // Get the data URL prefix first
  const mimeType = file.type || 'application/octet-stream'
  const prefix = `data:${mimeType};base64,`

  return new Promise(async (resolve, reject) => {
    try {
      while (offset < fileSize) {
        const slice = file.slice(offset, Math.min(offset + chunkSize, fileSize))
        const base64Chunk = await new Promise<string>((res, rej) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            const base64Content: any = result.split(',')[1]
            res(base64Content)
          }
          reader.onerror = err => rej(err)
          reader.readAsDataURL(slice)
        })

        base64Result += base64Chunk
        offset += chunkSize

        if (onProgress) {
          const percent = Math.min(Math.round((offset / fileSize) * 100), 100)
          onProgress(percent)
        }

        // Yield to main thread more frequently for large files
        if (fileSize > 500 * 1024 * 1024) { // For files > 500MB
          await new Promise(r => setTimeout(r, 2)) // 2ms delay
        } else {
          await new Promise(r => setTimeout(r, 1)) // 1ms delay
        }
      }

      resolve(prefix + base64Result)
    } catch (err) {
      reject(err)
    }
  })
}

export async function fileToChunkedBase64(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  const chunkSize = 1024 * 1024 * 3 // 3MB chunks (divisible by 3 for Base64 safety)
  const fileSize = file.size
  const chunks: string[] = []
  let offset = 0

  return new Promise(async (resolve, reject) => {
    while (offset < fileSize) {
      const slice = file.slice(offset, offset + chunkSize)

      try {
        const base64Chunk = await new Promise<string>((res, rej) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            // Remove data URL prefix (e.g., "data:video/mp4;base64,")
            const base64Content: any = result.split(',')[1]
            res(base64Content)
          }
          reader.onerror = err => rej(err)
          reader.readAsDataURL(slice)
        })

        chunks.push(base64Chunk)
        offset += chunkSize

        if (onProgress) {
          const percent = Math.min(Math.round((offset / fileSize) * 100), 100)
          onProgress(percent)
        }

        // Yield to main thread to prevent freezing
        await new Promise(r => setTimeout(r, 0))
      } catch (err) {
        reject(err)
        return
      }
    }
    resolve(chunks)
  })
}

export function formatRelativeDate(dateString: string) {
  const inputDate = new Date(dateString)

  const now = new Date()

  // Reset time for accurate day comparison

  const today: any = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target: any = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  )

  const diffTime = today - target

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'

  return inputDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = date.toLocaleString('en-GB', { month: 'short' })
  const year = date.getFullYear()
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12
  return `${day} ${month} ${year}, ${hours}:${minutes}${period}`
}

/**
 * Format a number into a compact human-readable string.
 * - < 1000: as-is (e.g. 42, 999)
 * - 1,000–999,999: "1.5k" (1 decimal if needed)
 * - >= 1,000,000: "1.5m"
 */
export function formatCompactNumber(val: number): string {
  if (val == null || isNaN(val)) return '0'
  const abs = Math.abs(val)
  const sign = val < 0 ? '-' : ''

  if (abs < 1000) return `${sign}${abs}`
  if (abs < 1_000_000) {
    const k = abs / 1000
    return `${sign}${parseFloat(k.toFixed(1))}k`
  }
  const m = abs / 1_000_000
  return `${sign}${parseFloat(m.toFixed(1))}m`
}

export const fetchApi = async ({
  url,
  method = 'GET',
  body,
  headers,
  logResponse = false
}: {
  url: string
  method?: 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
  body?: any
  headers?: any
  logResponse?: boolean
}) => {
  try {
    const response = await fetch(url, {
      method: method,
      body: body,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers
      }
    })

    if (logResponse) {
      // console.log('Response:', response)
    }
    return response
  } catch (err: any) {
    if (logResponse) {

      throw err.statusMessage
    }
  }
}

/**
 * Get initials from a name string (e.g. "John Doe" -> "JD")
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.trim()?.charAt(0)?.toUpperCase() || ''
  const l = lastName?.trim()?.charAt(0)?.toUpperCase() || ''
  return f + l || '?'
}

/**
 * Get avatar src URL. Returns undefined if no valid photo path exists,
 * so UAvatar falls back to showing initials via the `text` prop.
 */
export function getAvatarSrc(photoPath: string | null | undefined, apiBase: string): string | undefined {
  if (!photoPath) return undefined
  return `${apiBase}/storage/${photoPath}`
}

/**
 * Format a last message preview for the thread list.
 * When the message is a file, shows a descriptive label instead of empty content.
 */
export function formatLastMessage(lastMessage: any): string {
  if (!lastMessage) return 'No messages yet'
  if (lastMessage.type === 'file') {
    const fileName = lastMessage.attachment_path || lastMessage.attachment || ''
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    let fileLabel = 'file'
    if (['pdf'].includes(ext)) fileLabel = 'PDF'
    else if (['doc', 'docx'].includes(ext)) fileLabel = 'Word document'
    else if (['xls', 'xlsx'].includes(ext)) fileLabel = 'spreadsheet'
    else if (ext === 'csv') fileLabel = 'CSV file'
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) fileLabel = 'photo'
    else if (ext) fileLabel = ext.toUpperCase() + ' file'
    return `📎 Sent a ${fileLabel}`
  }
  return lastMessage.content || 'No messages yet'
}
