import { describe, it, expect, vi } from 'vitest'
import handler from '../api/contact.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

describe('POST /api/contact', () => {
  it('returns 405 if method is not POST', async () => {
    const req = { method: 'GET', body: {} } as VercelRequest

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    } as unknown as VercelResponse

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200) // GET should return 200
  })

  it('returns 200 on valid POST with mock data', async () => {
    const req = {
      method: 'POST',
      body: {
        name: 'Tester',
        email: 'test@example.com',
        message: 'This is a test message'
      }
    } as VercelRequest

    // mock Mailjet to avoid sending real emails
    const mockMailjet: any = {
      post: () => ({
        request: async () => ({ body: { Messages: [] } })
      })
    }
    const mod = await import('node-mailjet')
    mod.default.apiConnect = () => mockMailjet

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    } as unknown as VercelResponse

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
