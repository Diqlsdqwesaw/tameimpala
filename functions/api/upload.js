function generateId(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const invite = formData.get('invite')?.toUpperCase().trim();
    const file = formData.get('image');
    const response = await fetch(new URL('/public/invites.json', request.url));

    if (!invite || !file) {
      return new Response('Invite and image required!', { status: 400 });
    }

    // Fetch & validate from JSON
    const response = await fetch(new URL('/invites.json', request.url));
    if (!response.ok) {
      return new Response('Invite check failed!', { status: 500 });
    }
    const invites = await response.json();
    if (!invites.includes(invite)) {
      return new Response('Invalid invite!', { status: 403 });
    }

    if (!file.type.startsWith('image/')) {
      return new Response('Images only!', { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response('Max 5MB!', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || 'jpg');

    // Unique ID
    let id, key;
    while (true) {
      id = generateId();
      key = `${id}${ext}`;
      const exists = await env.MY_BUCKET.head(key);
      if (!exists) break;
    }

    await env.MY_BUCKET.put(key, bytes, {
      httpMetadata: { contentType: file.type }
    });

    const host = request.headers.get('host') || 'comlord.xyz';
    const publicUrl = `https://${host}/${key}`;
    return Response.json({ url: publicUrl });
  } catch (error) {
    return Response.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
