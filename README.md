# B1 Polish Exam Bot — Landing Page

Готовый лендинг для продвижения Telegram-бота подготовки к экзамену B1 по польскому языку.

## Структура
- `index.html` — основной файл лендинга (Tailwind через CDN).
- `assets/css/custom.css` — небольшие стили поверх Tailwind.
- `assets/js/main.js` — мобильное меню, плавная прокрутка, простой трекинг.
- `assets/img/logo.svg` — логотип/иконка.
- `manifest.webmanifest`, `robots.txt`, `sitemap.xml`.

## Что заменить
- Ссылку на Telegram-бота: найдите `https://t.me/your_bot_here` в `index.html` и замените на ссылку на вашего бота.
- Авторские права и контактный email в футере.
- При желании поменяйте ссылки на картинки на свои.

## Быстрый старт локально
Откройте `index.html` в браузере. Никаких сборщиков не требуется.

## Деплой
### Вариант 1. GitHub Pages
1. Создайте репозиторий, загрузите файлы.
2. В настройках включите Pages -> Deploy from branch, каталог `/ (root)`.
3. Откройте адрес из Pages.

### Вариант 2. Netlify / Vercel
Просто перетащите папку в Netlify/Vercel или подключите репозиторий. Статический билд не требуется.

### Вариант 3. Firebase Hosting
1. `npm i -g firebase-tools`
2. `firebase login`
3. `firebase init hosting` (One-page app: **No**, public dir: `.`)
4. `firebase deploy`

## Настройки через JS
Можно быстро переопределить ссылку на бота без правки HTML:
```js
localStorage.setItem('BOT_LINK_OVERRIDE', 'https://t.me/your_real_bot')
```
