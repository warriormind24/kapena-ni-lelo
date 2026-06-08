export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Required: your Facebook Page Graph API access token
    // - Create a Facebook App in Facebook for Developers
    // - Generate a Page Access Token (and permissions)
    // - Store it as FACEBOOK_PAGE_ACCESS_TOKEN in Vercel environment variables
    const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!token) {
      res.status(500).json({
        error: 'Missing FACEBOOK_PAGE_ACCESS_TOKEN env var',
        hint: 'Add it in Vercel → Project → Settings → Environment Variables.'
      });
      return;
    }

    const pageId = process.env.FACEBOOK_PAGE_ID || '61552045534404';

    const limitRaw = req.query?.limit;
    const limit = Math.max(1, Math.min(25, Number(limitRaw) || 10));

    const fields = [
      'id',
      'message',
      'created_time',
      'permalink_url'
    ].join(',');

    // Fetch newest posts from the profile/page feed (Graph API)
    // Note: Facebook will only return what your access token is allowed to read.
    // For Pages this is /{page-id}/posts.
    // For Profiles, Graph API support is more restricted; however trying /{id}/posts often works for owned content.
    const graphUrl = new URL(`https://graph.facebook.com/v19.0/${pageId}/posts`);
    graphUrl.searchParams.set('access_token', token);
    graphUrl.searchParams.set('limit', String(limit));
    graphUrl.searchParams.set('fields', fields);

    const upstream = await fetch(graphUrl.toString(), {
      headers: {
        'User-Agent': 'kapena-ni-lelo-facebook-page-posts/1.0',
        'Accept': 'application/json'
      }
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: 'Facebook Graph API request failed',
        details: data
      });
      return;
    }

    const posts = (data?.data || [])
      .map((p) => ({
        id: p.id,
        url: p.permalink_url,
        title: p.message ? p.message.slice(0, 80) : 'Facebook post',
        content: p.message || '',
        created_time: p.created_time
      }))
      // keep items with URL for embeddable rendering
      .filter((p) => typeof p.url === 'string' && p.url.length > 0);

    res.status(200).json({ ok: true, posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: String(err?.message || err) });
  }
}

