export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const docIndex = parseInt(event.context.params?.docIndex as string)
    const verificationId = event.context.params?.id

    // First, fetch the verification details to get the document URL
    const verificationResponse = await $fetch(`${apiBase}/admin/verification-queue/${verificationId}`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `${auth_type} ${auth_token}`
      }
    })

    const verificationData = verificationResponse as { data?: { documents?: { checklist?: Array<{ url?: string, file_url?: string }> } } }
    const documents = verificationData?.data?.documents?.checklist || []
    const doc = documents[docIndex]

    if (!doc) {
      throw createError({
        statusCode: 404,
        message: 'Document not found'
      })
    }

    const docUrl = doc.url || doc.file_url

    if (!docUrl) {
      throw createError({
        statusCode: 404,
        message: 'Document URL not found'
      })
    }

    // Fetch the file from the external URL
    const fileResponse = await fetch(docUrl, {
      headers: {
        'Authorization': `${auth_type} ${auth_token}`
      }
    })

    if (!fileResponse.ok) {
      throw createError({
        statusCode: fileResponse.status,
        message: 'Failed to fetch document'
      })
    }

    const blob = await fileResponse.blob()
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = fileResponse.headers.get('content-disposition') || 'attachment'

    // Extract filename from content-disposition if available
    let filename = `document_${docIndex}`
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1]
    }

    // Set response headers for file download
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')

    return send(event, blob)
  } catch (error) {
    console.error('Download error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to download document'
    })
  }
})
