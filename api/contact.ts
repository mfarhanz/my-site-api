import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../utils/cors.js'
import { CATCH_ALL_ADDRESS } from '../utils/constants.js'
import { verifyNonce } from '../utils/verify-key.js'
import { checkRateLimit } from '../utils/rate-limit.js'
import { formatSeconds } from '../utils/misc.js'
import Mailjet from 'node-mailjet'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleCors(req, res, ['POST', 'GET'])) return;

    if (req.method === 'GET') {
        res.status(200).send('You have reached the contact form\'s api endpoint for mfarhanz.pages.dev.\nNothing to see here.');
        return;
    }

    const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
        req.socket.remoteAddress ||
        "unknown";

    // rate limit check
    const { allowed, retryIn } = await checkRateLimit(ip);
    if (!allowed) {
        return res.status(429).json({ success: false, error: `Too many requests! Try again in ${retryIn ? formatSeconds(retryIn) : 'a few minutes'}.` });
    }

    try {
        // hp - honeypot field in client
        const { name, email, message, hp, nonce } = req.body;

        // honeypot check — if anything is filled in, it's a bot
        if (hp && hp.trim() !== '') {
            return res.status(418).json({ success: false, error: "Bot detected! Access denied." });
        }

        // check if request is coming from the contacts/ page of my site, by checking the provided nonce
        if (!verifyNonce(nonce)) {
            return res.status(401).json({ success: false, error: "Invalid/missing nonce" });
        }

        const mailjet = Mailjet.apiConnect(
            process.env.MJ_APIKEY_PUBLIC!,
            process.env.MJ_APIKEY_PRIVATE!
        );

        await mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: { Email: CATCH_ALL_ADDRESS, Name: 'Portfolio Contact' },
                    To: [{ Email: CATCH_ALL_ADDRESS, Name: 'You' }],
                    TemplateID: 7402715,  // mailjet email template id (created in the Mailjet dashboard)
                    TemplateLanguage: true,
                    Variables: {
                        sender_name: name,
                        sender_email: email,
                        sender_message: message
                    }
                }
            ]
        });

        res.status(200).json({ success: true });

    } catch (err) {
        console.error('Mailjet error:', err);
        res.status(500).json({ success: false });
    }
}
