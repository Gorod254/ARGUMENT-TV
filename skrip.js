alert("Сайт працює!");

// --- КОНФІГУРАЦІЯ ---
const RSS_SOURCES = {
    "УП": "https://www.pravda.com.ua/rss/",
    "Громадське": "https://hromadske.ua/rss",
    "Суспільне": "https://suspilne.media/rss/99.rss",
    "Думська": "https://dumskaya.net/rssnews.xml",
    "24 Канал": "https://24tv.ua/rss/allNews.xml",
    "Південь Сьогодні": "https://yug.today/feed/"
};

const weatherCoords = {
    "Balta": {lat: 47.93, lon: 29.62},
    "Podilsk": {lat: 47.74, lon: 29.53},
    "Kodyma": {lat: 48.09, lon: 29.12},
    "Ananiv": {lat: 47.72, lon: 29.96},
    "Liubashivka": {lat: 47.83, lon: 30.25},
    "Savran": {lat: 48.13, lon: 30.08},
    "Pishchana": {lat: 48.20, lon: 29.75},
    "Zelenogirske": {lat: 47.84, lon: 30.22},
    "Slobidka": {lat: 47.88, lon: 29.35},
    "Okny": {lat: 47.53, lon: 29.46}
};

const jokes = [
    "Новини: Сьогодні в Подільському районі було настільки сонячно, що навіть погода в смартфоні заплющила очі.",
    "Балтські новини: Вчора на площі знайшли гаманець. Господарю прохання не турбувати, ми вже купили радіоприймач!",
    "— Куме, ви чули, що Аргумент TV тепер показує новини кожні 5 хвилин? — Чув, тепер я не встигаю навіть каву допити, як новини змінюються!"
];

// --- ФУНКЦІЇ ---

// 1. Годинник
function updateClock() {
    const el = document.getElementById('digital-clock');
    if(el) el.textContent = new Date().toLocaleTimeString('uk-UA', { hour12: false });
}

// 2. Валюти (НБУ)
async function fetchCurrency() {
    try {
        const resp = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        const data = await resp.json();
        const codes = ['USD', 'EUR', 'GBP', 'PLN', 'MDL'];
        let text = "Курс НБУ: ";
        data.filter(i => codes.includes(i.cc)).forEach(i => {
            text += `${i.cc}: ${i.rate.toFixed(2)} | `;
        });
        document.querySelector('.currency-bar marquee').textContent = text;
    } catch(e) { console.error("Currency error"); }
}

// 3. Погода
async function updateWeather(city) {
    const c = weatherCoords[city];
    try {
        const resp = await fetch(`https://www.7timer.info/bin/api.pl?lon=${c.lon}&lat=${c.lat}&product=civil&output=json`);
        const data = await resp.json();
        const cur = data.dataseries[0];
        document.querySelector('.temp').textContent = `${cur.temp2m}°C`;
        const states = { "clearday": "Ясно", "pcloudy": "Мінлива хмарність", "mcloudy": "Хмарно", "cloudy": "Пасмурно", "rain": "Дощ", "snow": "Сніг" };
        document.querySelector('.desc').textContent = states[cur.weather] || cur.weather;
    } catch(e) { document.querySelector('.desc').textContent = "Помилка"; }
}

// 4. Новини з архівом 8 годин
async function fetchNews() {
    const container = document.getElementById('news-container');
    let allNews = [];
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";

    for (let [name, url] of Object.entries(RSS_SOURCES)) {
        try {
            const resp = await fetch(proxy + encodeURIComponent(url));
            const data = await resp.json();
            if (data.items) {
                data.items.forEach(item => {
                    allNews.push({
                        title: item.title,
                        link: item.link,
                        time: new Date(item.pubDate.replace(/-/g, "/")),
                        source: name
                    });
                });
            }
        } catch (e) { console.log(name + " error"); }
    }

    allNews.sort((a, b) => b.time - a.time);
    const limit = new Date(Date.now() - 8 * 60 * 60 * 1000);
    const filtered = allNews.filter(n => n.time > limit);

    container.innerHTML = filtered.map(n => `
        <a href="${n.link}" target="_blank" class="news-item">
            <span class="news-source">${n.source}</span>
            <span class="news-time">${n.time.getHours()}:${String(n.time.getMinutes()).padStart(2, '0')}</span>
            <div class="news-title" style="font-weight:bold; margin-top:5px;">${n.title}</div>
        </a>
    `).join('');
}

// 5. Плеєри
function initPlayers() {
    // Відео
    const v = document.getElementById('video');
    const src = 'https://ext.cdn.nashnet.tv/228.0.2.45/index.m3u8';
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(v);
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
        v.src = src;
    }

    // Радіо
    const r = document.getElementById('radio-player');
    const btn = document.getElementById('playRadio');
    btn.onclick = () => {
        if (r.paused) { r.play(); btn.textContent = "STOP"; }
        else { r.pause(); btn.textContent = "PLAY"; }
    };
}

// --- ЗАПУСК ---
document.addEventListener('DOMContentLoaded', () => {
    initPlayers();
    updateClock();
    setInterval(updateClock, 1000);
    fetchCurrency();
    fetchNews();
    setInterval(fetchNews, 300000); // 5 хв
    updateWeather("Balta");

    // Бургер
    document.getElementById('menuBtn').onclick = () => document.getElementById('sideMenu').classList.toggle('active');
    
    // Анекдот
    document.getElementById('jokeBtn').onclick = (e) => {
        e.preventDefault();
        const j = jokes[Math.floor(Math.random() * jokes.length)];
        document.getElementById('joke-display').innerHTML = `<p style="padding:10px; border-left:3px solid red;">${j}</p>`;
    };

    // Місто
    document.getElementById('city-select').onchange = (e) => updateWeather(e.target.value);
});
