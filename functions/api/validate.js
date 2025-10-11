export async function onRequestPost({ request, env }) {
  try {
    const { invite } = await request.json();
    if (!invite || invite.length !== 8) {
      return Response.json({ valid: false });
    }
    const code = invite.toUpperCase().trim();
    const valid = await env.INVITES.get(code) === 'valid';
    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false });
  }
}