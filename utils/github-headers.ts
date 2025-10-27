export const getGitHubHeaders = () => {
    const headers: HeadersInit = {
        'Accept': 'application/vnd.github+json'
    }
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers
}
