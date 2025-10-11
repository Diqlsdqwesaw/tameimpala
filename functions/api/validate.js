export async function onRequestPost({ request }) {
  try {
    const { invite } = await request.json();
    if (!invite || invite.length !== 8) {
      return Response.json({ valid: false });
    }

    const code = invite.toUpperCase().trim();
    const response = await fetch('https://comlord.xyz/invites.txt');  // Or relative: new URL('/invites.txt', request.url).href
    if (!response.ok) {
      return Response.json({ valid: false });
    }
    const text = await response.text();
    const invites = text.split('\n').map(line => line.trim().toUpperCase()).filter(Boolean);
    const valid = invites.includes(code);
    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false });
  }
}