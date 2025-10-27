import type { VercelRequest, VercelResponse } from '@vercel/node'

export const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://mfarhanz.pages.dev'
]

export function handleCors(
  req: VercelRequest,
  res: VercelResponse,
  methods: string[]
): boolean {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(','))
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true // stop processing
  }

  if (!methods.includes(req.method!)) {
    res.status(405).json({ error: 'Method Not Allowed' })
    return true
  }

  return false // continue processing
}
