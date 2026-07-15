export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const query = getQuery(event)
    const url = query.url as string
    const filename = query.filename as string || 'document'

    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'URL parameter is required'
      })
    }

    // Fetch the file from the external URL
    const fileResponse = await fetch(url, {
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

    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream'

    // Read the entire response body
    const buffer = await fileResponse.arrayBuffer()

    // Set response headers for file download
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')

    // Send the file data
    return send(event, buffer)
  } catch (error) {
    console.error('Download error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to download document'
    })
  }
})
