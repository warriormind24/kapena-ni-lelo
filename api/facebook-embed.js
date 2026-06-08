export default async function handler(req, res) {
  try {
    const url = req.query?.url;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Missing or invalid "url" query parameter.' });
      return;
    }

    // Use Facebook oEmbed endpoint.
    // This returns a safe embed HTML snippet for many public posts.
    // Note: Facebook may still refuse for some content (private posts/pages).
    const oembedUrl = `https://www.facebook.com/plugins/oembed.php?url=${encodeURIComponent(url)}&format=json`;

    const upstream = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'kapena-ni-lelo-site/1.0',
        'Accept': 'application/json',
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Facebook oEmbed request failed.', details: text });
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      res.status(502).json({ error: 'Invalid JSON received from Facebook.', details: text });
      return;
    }

    if (!data || data.type !== 'rich' || !data.html) {
      res.status(200).json({
        ok: false,
        message: 'Facebook did not return embed HTML for this URL.',
        data,
      });
      return;
    }

    // Return embed HTML. Frontend will render it.
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      ok: true,
      url,
      title: data.title,
      html: data.html,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: String(err?.message || err) });
  }
}

