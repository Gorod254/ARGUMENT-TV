// 1. ГОДИННИК
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('uk-UA', { hour12: false });
    document.getElementById('digital-clock').textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// 2. ВІДЕОПЛЕЄР (M3U8)
const video = document.getElementById('video');
const videoSrc = 'https://ext.cdn.nashnet.tv/228.0.2.45/index.m3u8';

if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Для Safari на iPhone (HLS підтримується нативно)
    video.src = videoSrc;
}

// 3. РАДІОПЛЕЄР
const radio = document.getElementById('radio-player');
const playBtn = document.getElementById('playRadio');

playBtn.addEventListener('click', () => {
    if (radio.paused) {
        radio.play();
        playBtn.textContent = 'STOP';
        playBtn.style.backgroundColor = '#555';
    } else {
        radio.pause();
        playBtn.textContent = 'PLAY';
        playBtn.style.backgroundColor = '#e30613';
    }
});

// 4. БУРГЕР МЕНЮ
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');

menuBtn.addEventListener('click', () => {
    sideMenu.classList.toggle('active');
});

// Закриття меню при кліку на контент
document.addEventListener('click', (e) => {
    if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        sideMenu.classList.remove('active');
    }
});

// 5. КУРС ВАЛЮТ (НБУ)
async function getCurrency() {
    try {
        const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        const data = await response.json();
        const codes = ['USD', 'EUR', 'GBP', 'PLN', 'MDL'];
        let tickerText = "Курс НБУ: ";
        
        data.forEach(item => {
            if (codes.includes(item.cc)) {
                tickerText += `${item.cc}: ${item.rate.toFixed(2)}грн | `;
            }
        });
        document.querySelector('.currency-bar marquee').textContent = tickerText;
    } catch (e) {
        console.log("Помилка валют");
    }
}
getCurrency();

// 6. АНЕКДОТИ
const jokes = [
    "— Куме, а що таке агрегатор новин? — Це коли ти знаєш все, але нічого не встигаєш прочитати!",
    "Новини: Сьогодні в Подільському районі було настільки сонячно, що навіть погода в смартфоні заплющила очі.",
    "Балтські новини: Вчора на площі знайшли гаманець. Господарю прохання не турбувати, ми вже купили радіоприймач!"
];

document.getElementById('jokeBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    document.getElementById('joke-display').innerHTML = `<p style="padding:10px; background:#222; border-left:3px solid red;">${randomJoke}</p>`;
});
// 7. ЛОГІКА ПОГОДИ
const weatherData = {
    "Balta": {lat: 47.93, lon: 29.62},
    "Podilsk": {lat: 47.74, lon: 29.53},
    "Kodyma": {lat: 48.09, lon: 29.12},
    "Ananiv": {lat: 47.72, lon: 29.96},
    "Liubashivka": {lat: 47.83, lon: 30.25},
    "Savran": {lat: 48.13, lon: 30.08}
};

async function updateWeather(city) {
    const coords = weatherData[city];
    try {
        // Використовуємо відкрите API (7-timer) для прогнозу без ключів
        const resp = await fetch(`https://www.7timer.info/bin/api.pl?lon=${coords.lon}&lat=${coords.lat}&product=civil&output=json`);
        const data = await resp.json();
        
        const current = data.dataseries[0];
        const temp = current.temp2m;
        const weatherState = current.weather;
        
        document.querySelector('.temp').textContent = `${temp}°C`;
        document.querySelector('.desc').textContent = `Стан: ${weatherState}`;
    } catch (e) {
        document.querySelector('.desc').textContent = "Помилка оновлення";
    }
}

// Слухаємо зміну міста в списку
document.getElementById('city-select').addEventListener('change', (e) => {
    updateWeather(e.target.value);
});

// Запускаємо погоду для Балти при старті
updateWeather("Balta");

