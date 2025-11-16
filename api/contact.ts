import type { VercelRequest, VercelResponse } from '@vercel/node'
import Mailjet from 'node-mailjet'
import { handleCors } from '../utils/cors.js'
import { CATCH_ALL_ADDRESS } from '../utils/constants.js'
import { verifyNonce } from '../utils/verify-key.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['POST', 'GET'])) return;

  if (req.method === 'GET') {
    res.status(200).send('You have reached the contact form\'s api endpoint for mfarhanz.pages.dev.\nNothing to see here.');
    return;
  }

  try {
    // hp - honeypot field in client
    const { name, email, message, hp, nonce } = req.body;

    // honeypot check — if anything is filled in, it's a bot
    if (hp && hp.trim() !== '') {
      return res.status(418).json({ success: false, error: "Bot detected!" });
    }

    // check if request is coming from the contacts/ page of my site, by checking the provided nonce
    if (!verifyNonce(nonce)) {
      return res.status(401).json({ success: false, error: "Invalid/missing nonce!" });
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
          TemplateID: 7402715,  // sample mailjet email template id
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
