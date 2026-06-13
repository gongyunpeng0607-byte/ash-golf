// Seed all products with golf-themed SVG placeholder images
const TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODExOTM5NTgsImlkIjoiMDE5ZWI3NmItYjAwMS03OGZlLWJlMzItOGVjM2FlZDg1NzYyIiwicmlkIjoiMDZiYTI1MzctNzcyOS00YTkwLWJkOGItYzFiMTI1ZTdkODkxIn0._4siyzgGgmvzUQAr4XLNS4r2t0pPwgkGwvhCWzBvEHzjNUFL35go3gm8VgP2E05j6-pfijbuJZAxENrdv8CwCA';

function makeSvg(bg, emoji, brand, name, accent) {
  return 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><defs><linearGradient id="g"><stop offset="0" style="stop-color:' + bg + '"/><stop offset="1" style="stop-color:#111"/></linearGradient></defs><rect fill="url(#g)" width="400" height="500"/><text fill="white" font-size="80" text-anchor="middle" x="200" y="230">' + emoji + '</text><text fill="white" font-size="16" font-weight="bold" text-anchor="middle" x="200" y="310">' + brand + '</text><text fill="' + accent + '" font-size="13" text-anchor="middle" x="200" y="340">' + name + '</text></svg>'
  );
}

async function main() {
  const res1 = await fetch('https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io/v2/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql: 'SELECT id, name, brand FROM Product ORDER BY id' } }] }),
  });
  const data1 = await res1.json();
  const rows = data1.results[0].response.result.rows;

  const colors = ['#1a5632', '#1a1a2e', '#2d2d2d', '#3a3a3a', '#0d1b2a', '#1a1a2e', '#2a2a2a', '#1a5632', '#333', '#111'];
  const emojis = ['🏌️', '⚪', '🎒', '🧤', '⚪', '🔭', '🏌️', '⚪', '👕', '🎯'];

  const stmts = rows.map((row, i) => {
    const id = row[0].value;
    const name = (row[1].value || '').slice(0, 15);
    const brand = (row[2].value || 'GOLF').toUpperCase();
    const svg = makeSvg(colors[i % colors.length], emojis[i % emojis.length], brand, name, '#d4a853');
    return { type: 'execute', stmt: { sql: "UPDATE Product SET images = '" + svg + "' WHERE id = '" + id + "'" } };
  });

  const res2 = await fetch('https://ash-golf-gongyunpeng0607-byte.aws-ap-northeast-1.turso.io/v2/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: stmts }),
  });
  const data2 = await res2.json();
  const bad = (data2.results || []).filter(r => r.type !== 'ok');
  console.log('Updated:', stmts.length - bad.length, '/', stmts.length);
  if (bad.length) console.log('Errors:', bad.slice(0, 3).map(r => r.error?.message));
}

main().catch(e => console.error(e));
