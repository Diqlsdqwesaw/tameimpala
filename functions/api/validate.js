export async function onRequestPost({ request }) {
  try {
    const { invite } = await request.json();
    if (!invite || invite.length !== 8) {
      return Response.json({ valid: false });
    }
    const code = invite.toUpperCase().trim();
    const response = await fetch(new URL('/invites.json', request.url));
    if (!response.ok) {
      return Response.json({ valid: false });
    }
    const invites = await response.json();
    const response = await fetch(new URL('/public/invites.json', request.url));
    const valid = invites.includes(code);
    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false });
  }
}
