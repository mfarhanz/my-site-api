import type { VercelResponse } from '@vercel/node'
import { handleError } from '../utils/handle-error.js'

export async function fetchGitHub(
    res: VercelResponse,
    url: string,
    headers: HeadersInit,
    transform?: (data: any) => any
) {
    try {
        const response = await fetch(url, { headers })
        const data = await response.json()

        if (handleError(res, response, data)) return null

        return transform ? transform(data) : data
    } catch (err) {
        console.error('GitHub API error:', err)
        res.status(500).json({ error: 'Internal Server Error' })
        return null
    }
}
