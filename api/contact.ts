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


import Mailjet from 'node-mailjet'

export default async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(
      'This is the contact API. Please send a POST request with JSON.',
      { status: 200 }
    )
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { name, email, message } = await req.json()
  const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC!,
    process.env.MJ_APIKEY_PRIVATE!
  )

  try {
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

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Mailjet error:', err)
    return new Response(JSON.stringify({ success: false }), { status: 500 })
  }
}
