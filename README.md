# Маклер.Хаб — сайт maklerhub.ru

- `site/` — готовый сайт (`index.html` + `img/`). Всё, что в этой папке, публикуется автоматически.
- `Кода/` — исходные блоки, перенесённые из Битрикс24.
- `tools/build.js` — собирает `site/index.html` из блоков: `node tools/build.js Кода site`.

Публикация: любое изменение в ветке `main` через 1–2 минуты появляется на сайте (GitHub Actions → GitHub Pages).

Локальный просмотр: `py -m http.server 8080 --directory site`, затем http://localhost:8080.
