function generateInvite() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function onRequestPost({ request, env }) {
  try {
    const { count } = await request.json();
    if (!count || count < 1 || count > 50) {
      return new Response('Invalid count (1-50)!', { status: 400 });
    }
    const invites = [];
    for (let i = 0; i < count; i++) {
      const code = generateInvite();
      await env.INVITES.put(code, 'valid');
      invites.push(code);
    }
    return Response.json({ invites });
  } catch (error) {
    return new Response('Generation failed!', { status: 500 });
  }
}