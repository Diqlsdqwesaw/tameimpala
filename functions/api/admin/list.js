export async function onRequestGet({ env }) {
  try {
    const list = await env.INVITES.list({ prefix: '' });
    const invites = list.keys.map(k => k.name);
    return Response.json({ invites, error: null });
  } catch (error) {
    return Response.json({ invites: [], error: error.message }, { status: 500 });
  }
}
