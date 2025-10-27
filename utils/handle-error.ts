import type { VercelResponse } from '@vercel/node'

export const handleError = (res: VercelResponse, response: Response, data: any) => {
    if (!response.ok) {
        res.status(response.status).json({ error: data.message })
        return true // means: handled, stop further execution
    }
    return false
}
