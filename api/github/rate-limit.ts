import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '$lib/cors.js'
import { getGitHubHeaders } from '$lib/github-headers.js'
import { fetchGitHub } from '$lib/github-fetch.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleCors(req, res, ['GET'])) return

    const headers = getGitHubHeaders()

    const data = await fetchGitHub(
        res,
        'https://api.github.com/rate_limit',
        headers,
        data => {
            const resetTime = new Date(data.rate.reset * 1000)
            const minutes = Math.ceil((resetTime.getTime() - Date.now()) / 60000)
            res.status(200).json({
                limit: data.rate.limit,
                used: data.rate.used,
                remaining: data.rate.remaining,
                resets_in: minutes
            })
        }
    )

    if (!data) return
    res.status(200).json(data)
}
