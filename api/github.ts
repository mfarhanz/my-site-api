import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from './utils/cors.js'

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
      // ✅ Get repo metadata
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

        res.status(200).json({
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
        });

        return;
      }

      // ✅ Get some profile info
      case 'profile': {
        response = await fetch(`https://api.github.com/users/${username}`, { headers });
        data = await response.json();

        if (!response.ok) {
          res.status(response.status).json({ error: data.message });
          return;
        }

        res.status(200).json({
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
