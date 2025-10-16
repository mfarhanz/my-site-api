import { describe, it, expect } from 'vitest'
import handler from '../api/contact.js'

describe('POST /api/contact', () => {
    it('returns 405 if method is not POST', async () => {
        const req = new Request('http://localhost/api/contact', { method: 'GET' })
        const res = await handler(req)
        expect(res.status).toBe(405)
    })

    it('returns 200 on valid POST with mock data', async () => {
        const req = new Request('http://localhost/api/contact', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Tester',
                email: 'test@example.com',
                message: 'This is a test message'
            }),
            headers: { 'Content-Type': 'application/json' }
        })

        // mock Mailjet to avoid sending real emails
        const mockMailjet: any = {
            post: () => ({
                request: async () => ({ body: { Messages: [] } })
            })
        }
        const mod = await import('node-mailjet')
        mod.default.apiConnect = () => mockMailjet

        const res = await handler(req)
        expect(res.status).toBe(200)
    })
})
