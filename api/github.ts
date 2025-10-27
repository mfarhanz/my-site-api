import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors, allowedOrigins } from './_utils/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['GET'])) return

  const { repo, type } = req.query;

  // Validate params
  if (!type) {
    res.status(400).json({ error: 'Missing type parameter' });
    return;
  }

  try {
    // Base GitHub username
    const username = 'mfarhanz';
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json'
    }

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    let response;
    let data;

    switch (type) {
      // ✅ Get repo metadata (description, stars, etc.)
      case 'repo': {
        if (!repo) {
          res.status(400).json({ error: 'Missing repo parameter' });
          return;
        }
        response = await fetch(`https://api.github.com/repos/${username}/${repo}`, { headers });
        data = await response.json();

        if (!response.ok) {
          res.status(response.status).json({ error: data.message });
          return;
        }

        // res.status(200).json({
        //   name: data.name,
        //   description: data.description,
        //   language: data.language,
        //   stars: data.stargazers_count,
        //   forks: data.forks_count,
        //   watchers: data.watchers_count,
        //   url: data.html_url,
        //   updated_at: data.updated_at
        // });
        res.status(200).json(data);
        return;
      }

      // ✅ Get user profile picture (and some profile info)
      case 'profile': {
        response = await fetch(`https://api.github.com/users/${username}`, { headers });
        data = await response.json();

        if (!response.ok) {
          res.status(response.status).json({ error: data.message });
          return;
        }

        // res.status(200).json({
        //   avatar_url: data.avatar_url,
        //   name: data.name,
        //   bio: data.bio,
        //   public_repos: data.public_repos,
        //   followers: data.followers,
        //   following: data.following
        // })
        res.status(200).json(data);
        return;
      }

      default:
        res.status(400).json({ error: 'Invalid type parameter' });
    }
  } catch (err) {
    console.error('GitHub API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
