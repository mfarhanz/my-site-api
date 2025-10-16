// import Mailjet from 'node-mailjet';
// import { env } from '$env/dynamic/private';

// export const POST = async ({ request }) => {
  // const { name, email, message } = await request.json();
  // const mailjet = Mailjet.apiConnect(env.MJ_APIKEY_PUBLIC, env.MJ_APIKEY_PRIVATE);

  // try {
    // await mailjet.post('send', { version: 'v3.1' }).request({
      // Messages: [
        // {
          // From: {
            // Email: 'mfz.bin@gmail.com',
            // Name: 'Portfolio Contact'
          // },
          // To: [
            // {
              // Email: 'mfz.bin@gmail.com',
              // Name: 'You'
            // }
          // ],
          // TemplateID: 7402715,
          // TemplateLanguage: true,
          // Variables: {
            // sender_name: name,
            // sender_email: email,
            // sender_message: message
          // }
        // }
      // ]
    // });

    // return new Response(JSON.stringify({ success: true }), { status: 200 });
  // } catch (err) {
    // console.error('Mailjet error:', err);
    // return new Response(JSON.stringify({ success: false }), { status: 500 });
  // }
// };


import type { VercelRequest, VercelResponse } from '@vercel/node'
import Mailjet from 'node-mailjet'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).send(
      'This is the contact API. Please send a POST request with JSON.'
    )
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  try {
    const { name, email, message } = req.body

    const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC!,
      process.env.MJ_APIKEY_PRIVATE!
    )

    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: 'mfz.bin@gmail.com', Name: 'Portfolio Contact' },
          To: [{ Email: 'mfz.bin@gmail.com', Name: 'You' }],
          TemplateID: 7402715,
          TemplateLanguage: true,
          Variables: {
            sender_name: name,
            sender_email: email,
            sender_message: message
          }
        }
      ]
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Mailjet error:', err)
    res.status(500).json({ success: false })
  }
}
