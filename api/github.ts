import type { VercelRequest, VercelResponse } from '@vercel/node'

const allowedOrigins = [
  'http://localhost:5173',
  'https://mfarhanz.github.io'
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { repo, type } = req.query

  // Validate params
  if (!type) {
    res.status(400).json({ error: 'Missing type parameter' })
    return
  }

  try {
    // Base GitHub username
    const username = 'mfarhanz'
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json'
    }

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    let response
    let data

    switch (type) {
      // ✅ Get repo metadata (description, stars, etc.)
      case 'repo': {
        if (!repo) {
          res.status(400).json({ error: 'Missing repo parameter' })
          return
        }
        response = await fetch(`https://api.github.com/repos/${username}/${repo}`, { headers })
        data = await response.json()

        if (!response.ok) {
          res.status(response.status).json({ error: data.message })
          return
        }

        res.status(200).json({
          name: data.name,
          description: data.description,
          language: data.language,
          stars: data.stargazers_count,
          forks: data.forks_count,
          watchers: data.watchers_count,
          url: data.html_url,
          updated_at: data.updated_at
        })
        return
      }

      // ✅ Get user profile picture (and some profile info)
      case 'profile': {
        response = await fetch(`https://api.github.com/users/${username}`, { headers })
        data = await response.json()

        if (!response.ok) {
          res.status(response.status).json({ error: data.message })
          return
        }

        res.status(200).json({
          avatar_url: data.avatar_url,
          name: data.name,
          bio: data.bio,
          public_repos: data.public_repos,
          followers: data.followers,
          following: data.following
        })
        return
      }

      default:
        res.status(400).json({ error: 'Invalid type parameter' })
    }
  } catch (err) {
    console.error('GitHub API error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
