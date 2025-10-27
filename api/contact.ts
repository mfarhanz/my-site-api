import type { VercelRequest, VercelResponse } from '@vercel/node'
import Mailjet from 'node-mailjet'
import { handleCors } from '$lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res, ['POST', 'GET'])) return;

  if (req.method === 'GET') {
    res.status(200).send('You have reached the contact form\'s api endpoint for mfarhanz.pages.dev.\nNothing to see here.');
    return;
  }

  try {
    const { name, email, message } = req.body;
    const catchAllAdress = 'mfz.bin@gmail.com';

    const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC!,
      process.env.MJ_APIKEY_PRIVATE!
    );

    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: catchAllAdress, Name: 'Portfolio Contact' },
          To: [{ Email: catchAllAdress, Name: 'You' }],
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
