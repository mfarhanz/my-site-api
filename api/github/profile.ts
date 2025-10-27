import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '$lib/cors.js'
import { getGitHubHeaders } from '$lib/github-headers.js'
import { fetchGitHub } from '$lib/github-fetch.js'
import { GITHUB_USERNAME } from '$lib/constants.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleCors(req, res, ['GET'])) return

    const headers = getGitHubHeaders()

    const data = await fetchGitHub(
        res,
        `https://api.github.com/users/${GITHUB_USERNAME}`,
        headers,
        data => ({
            login: data.login,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            type: data.type,
            name: data.name,
            company: data.company,
            location: data.location,
            public_repos: data.public_repos,
            public_gists: data.public_gists,
            followers: data.followers,
            following: data.following,
            created_at: data.created_at,
            updated_at: data.updated_at,
            activity_url: data.events_url
        })
    )

    if (!data) return
    res.status(200).json(data)
}
