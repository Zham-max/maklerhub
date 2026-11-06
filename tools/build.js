// Собирает блоки из Сайт/Кода в Сайт/site/index.html, вынося base64-картинки в site/img
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const SRC = process.argv[2], OUT = process.argv[3];
fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });

// id якорей из Битрикс24, на которые ссылается меню
const anchors = {
  '02-pervyy-ekran.html': 'b371', '03-o-kompanii.html': 'b451',
  // b455 и b459 (риелторам / застройщикам) стоят внутри 04-rieltoram-zastroyshchikam.html
  '07-meropriyatiya.html': 'b753', '08-kontakty.html': 'b757',
};
const names = {
  '01-header.html': ['logo', 'redcat'], '02-pervyy-ekran.html': 'hero-logo', '03-o-kompanii.html': 'about-logo',
  '06-partnery.html': 'partner', '09-podval.html': 'footer-logo',
};
const ext = { 'image/png': 'png', 'image/svg+xml': 'svg', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const seen = new Map();

let body = '';
for (const f of fs.readdirSync(SRC).filter(f => f.endsWith('.html')).sort()) {
  let html = fs.readFileSync(path.join(SRC, f), 'utf8');
  html = html.replace(/<link rel="(preconnect|stylesheet)" href="https:\/\/fonts\.googleapis\.com[^"]*">\s*/g, '');
  let n = 0;
  html = html.replace(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)/g, (_, mime, b64) => {
    const buf = Buffer.from(b64, 'base64');
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    if (!seen.has(hash)) {
      const base = [].concat(names[f] || 'img'), name = `${base[n] || base[0] + '-' + n}.${ext[mime]}`;
      n++;
      fs.writeFileSync(path.join(OUT, 'img', name), buf);
      seen.set(hash, 'img/' + name);
    }
    return seen.get(hash);
  });
  const id = anchors[f];
  body += `\n<!-- ${f} -->\n<div class="blk"${id ? ` id="${id}"` : ''}>\n${html.trim()}\n</div>\n`;
}

const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Маклер.Хаб — ассоциация риелторов, оператор платформы RedCat</title>
<meta name="description" content="Маклер.Хаб объединяет риелторов и застройщиков на платформе RedCat. Все новостройки региона в одном сервисе. Улан-Удэ.">
<link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32.png">
<link rel="icon" type="image/png" sizes="512x512" href="img/icon-512.png">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="canonical" href="https://maklerhub.ru/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Маклер.Хаб">
<meta property="og:url" content="https://maklerhub.ru/">
<meta property="og:title" content="Маклер.Хаб — ассоциация риелторов, оператор платформы RedCat">
<meta property="og:description" content="Маклер.Хаб объединяет риелторов и застройщиков на платформе RedCat. Все новостройки региона в одном сервисе. Улан-Удэ.">
<meta property="og:image" content="https://maklerhub.ru/img/icon-512.png">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta property="og:image:alt" content="Маклер.Хаб">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap">
<style>
html { scroll-behavior: smooth; }
body { margin: 0; background: #fff; -webkit-font-smoothing: antialiased; }
/* подписи анимации первого экрана выходят за край на телефоне */
html, body { overflow-x: clip; }
/* шапка липнет к верху страницы целиком, а не внутри своего блока */
.blk:first-of-type { position: sticky; top: 0; z-index: 50; }
.blk[id] { scroll-margin-top: 80px; }
</style>
</head>
<body>${body}
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), page);
console.log('images:', [...seen.values()].join(', '));
console.log('index.html bytes:', Buffer.byteLength(page));
