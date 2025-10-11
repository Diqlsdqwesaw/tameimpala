export async function onRequestPost({ request }) {
  try {
    const { invite } = await request.json();
    if (!invite || invite.length !== 8) {
      return Response.json({ valid: false });
    }
    const code = invite.toUpperCase().trim();
    const jsonResponse = await fetch(new URL('/public/invites.json', request.url));  // Renamed to jsonResponse
    if (!jsonResponse.ok) {
      return Response.json({ valid: false });
    }
    const invites = await jsonResponse.json();
    const valid = invites.includes(code);
    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false });
  }
}
