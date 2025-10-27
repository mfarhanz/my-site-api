import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '$lib/cors.js'
import { getGitHubHeaders } from '$lib/github-headers.js'
import { GITHUB_USERNAME } from '$lib/constants.js'
import { fetchGitHub } from '$lib/github-fetch.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleCors(req, res, ['GET'])) return

    const { name } = req.query;
    const headers = getGitHubHeaders()

    if (!name) {
        res.status(400).json({ error: 'Missing name parameter' });
        return;
    }

    const data = await fetchGitHub(
        res,
        `https://api.github.com/repos/${GITHUB_USERNAME}/${name}`,
        headers,
        data => ({
            name: data.name,
            description: data.description,
            language: data.language,
            stars: data.stargazers_count,
            forks: data.forks_count,
            watchers: data.watchers_count,
            problems: data.open_issues_count,
            tags: data.topics,
            url: data.html_url,
            created_at: data.created_at,
            updated_at: data.updated_at,
            pushed_at: data.pushed_at,
            releases_url: data.releases_url,
            deployments_url: data.deployments_url,
            homepage: data.homepage,
            license: data.license
        })
    )

    if (!data) return
    res.status(200).json(data)
}
