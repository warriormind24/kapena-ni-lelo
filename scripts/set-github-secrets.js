#!/usr/bin/env node
const sodium = require('tweetsodium');

async function main() {
  const {
    GITHUB_TOKEN,
    VERCEL_TOKEN,
    VERCEL_ORG_ID,
    VERCEL_PROJECT_ID,
    REPO = 'warriormind24/kapena-ni-lelo',
  } = process.env;

  if (!GITHUB_TOKEN) {
    console.error('Missing GITHUB_TOKEN. Create a GitHub PAT and set GITHUB_TOKEN env var.');
    process.exit(1);
  }

  if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
    console.error('Missing one or more Vercel secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
    process.exit(1);
  }

  if (typeof fetch !== 'function') {
    console.error('Global `fetch` is required. Please run this with Node 18+ or install node-fetch and set GLOBAL.fetch.');
    process.exit(1);
  }

  const [owner, repo] = REPO.split('/');
  if (!owner || !repo) {
    console.error('Invalid REPO value. Expected owner/repo');
    process.exit(1);
  }

  const pubKeyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'kapena-ni-lelo-secrets-uploader'
    }
  });

  if (!pubKeyRes.ok) {
    const body = await pubKeyRes.text();
    console.error('Failed to get public key:', pubKeyRes.status, body);
    process.exit(1);
  }

  const pub = await pubKeyRes.json();
  const publicKey = pub.key; // base64
  const keyId = pub.key_id;

  async function putSecret(name, value) {
    const messageBytes = Buffer.from(value);
    const keyBytes = Buffer.from(publicKey, 'base64');
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encrypted = Buffer.from(encryptedBytes).toString('base64');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/secrets/${name}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'kapena-ni-lelo-secrets-uploader',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ encrypted_value: encrypted, key_id: keyId })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed to set secret ${name}: ${res.status} ${txt}`);
    }
  }

  try {
    console.log('Setting secrets on', REPO);
    await putSecret('VERCEL_TOKEN', VERCEL_TOKEN);
    console.log('VERCEL_TOKEN set');
    await putSecret('VERCEL_ORG_ID', VERCEL_ORG_ID);
    console.log('VERCEL_ORG_ID set');
    await putSecret('VERCEL_PROJECT_ID', VERCEL_PROJECT_ID);
    console.log('VERCEL_PROJECT_ID set');
    console.log('All secrets set successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
