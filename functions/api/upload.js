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

    if (!invite || !file) {
      return Response.json({ error: 'Invite and image required!' }, { status: 400 });
    }

    // Fetch & validate from JSON
    const jsonResponse = await fetch(new URL('/public/invites.json', request.url));
    if (!jsonResponse.ok) {
      return Response.json({ error: 'Invite check failed: JSON not found' }, { status: 500 });
    }
    const invites = await jsonResponse.json();
    if (!invites.includes(invite)) {
      return Response.json({ error: 'Invalid invite!' }, { status: 403 });
    }

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'Images only!' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Max 5MB!' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || 'jpg');

    // R2 Check: Ensure binding exists
    if (!env.MY_BUCKET) {
      console.error('R2 binding MY_BUCKET missing!');
      return Response.json({ error: 'Server config error: R2 not bound' }, { status: 500 });
    }

    // Unique ID with max tries
    let id, key, tries = 0;
    const maxTries = 100;
    while (tries < maxTries) {
      id = generateId();
      key = `${id}${ext}`;
      try {
        const exists = await env.MY_BUCKET.head(key);
        if (!exists) break;
      } catch (headError) {
        console.error('R2 head error:', headError);
        return Response.json({ error: 'R2 check failed: ' + headError.message }, { status: 500 });
      }
      tries++;
    }
    if (tries >= maxTries) {
      return Response.json({ error: 'ID collision (rare)—try again' }, { status: 500 });
    }

    // Upload to R2
    try {
      await env.MY_BUCKET.put(key, bytes, {
        httpMetadata: { contentType: file.type }
      });
      console.log('Upload success:', key);
    } catch (putError) {
      console.error('R2 put error:', putError);
      return Response.json({ error: 'R2 upload failed: ' + putError.message }, { status: 500 });
    }

    const host = request.headers.get('host') || 'comlord.xyz';
    const publicUrl = `https://${host}/${key}`;
    return Response.json({ url: publicUrl });
  } catch (error) {
    console.error('General upload error:', error);
    return Response.json({ error: 'Upload failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
