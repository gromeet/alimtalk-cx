export default async function handler(req, res) {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    return res.status(500).json({ error: 'Server config error' });
  }

  const allowed = ['kucham.html', 'uvid.html', 'foremong.html', 'meariset.html', 'index.html', 'kucham-faq.html', 'data/kucham.json'];

  // GET: SHA 조회
  if (req.method === 'GET') {
    const filename = req.query.filename || 'kucham.html';
    if (!allowed.includes(filename)) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const apiUrl = `https://api.github.com/repos/gromeet-team/alimtalk-cx/contents/${filename}`;
    const ghRes = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await ghRes.json();
    return res.status(200).json({ sha: data.sha });
  }

  // POST: 저장
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, sha, filename } = req.body;
  if (!content || !sha || !filename) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (!allowed.includes(filename)) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const apiUrl = `https://api.github.com/repos/gromeet-team/alimtalk-cx/contents/${filename}`;

  const ghRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `[알림톡] ${filename} 수정`,
      content,
      sha,
    }),
  });

  const data = await ghRes.json();
  if (!ghRes.ok) {
    return res.status(ghRes.status).json({ error: data.message });
  }

  return res.status(200).json({ ok: true });
}
