/* --- BURGER MENU --- */
function toggleMenu(){
    document.getElementById("menu")
        .classList.toggle("open");
}

/* --- CLOCK --- */
function updateClock(){
    let now = new Date();
    let clock = document.getElementById("clock");
    clock.innerHTML = now.toLocaleTimeString("uk-UA");
}
setInterval(updateClock, 1000);

/* --- NBU CURRENCY --- */
async function loadCurrency(){
    try {
        let res = await fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json");
        let data = await res.json();
        let symbols = {EUR:'Євро',USD:'Долар',GBP:'Фунт',PLN:'Злотий',MDL:'Молдавський лей'};
        let output = "Курс НБУ: ";
        for(let c in symbols){
            let found = data.find(x=>x.cc === c);
            if(found) output += `${symbols[c]} ${found.rate.toFixed(2)} | `;
        }
        document.getElementById("currency").innerText = output;
    } catch { }
}
loadCurrency();
setInterval(loadCurrency, 1000*60*10);

/* --- VIDEO PLAYER --- */
let video = document.getElementById("video");
let videoSrc = "https://ext.cdn.nashnet.tv/228.0.2.45/index.m3u8";
if(Hls.isSupported()){
    let hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
}

/* --- WEATHER --- */
const cities = ["Балта","Подільськ","Кодима","Ананьїв","Любашівка",
"Саврань","Піщана","Зеленогірське","Слобідка","Окни"];

let citySelect = document.getElementById("citySelect");
cities.forEach(c=>{
    citySelect.innerHTML += `<option>${c}</option>`;
});

const weatherKey = "<<<YOUR_OPENWEATHERMAP_KEY_HERE>>>";
citySelect.onchange = loadWeather;

async function loadWeather(){
    let city = citySelect.value;
    let res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=uk&appid=${weatherKey}`);
    let d = await res.json();
    if(d.main){
        document.getElementById("weatherInfo").innerHTML =
        `${d.weather[0].description.toUpperCase()}, 🌡 ${d.main.temp}°C, `+
        `💧 Вологість ${d.main.humidity}%, 💨 Вітер ${d.wind.speed}м/с, `+
        `🧭 Тиск ${d.main.pressure} гПа`;
    }
}
loadWeather();

/* --- JOKE (Анекдот) --- */
function loadJoke(){
    fetch("https://v2.jokeapi.dev/joke/Any?lang=uk")
    .then(r=>r.json())
    .then(j=>{
        let txt = j.setup ? j.setup + "<br><i>"+ j.delivery+"</i>" : j.joke;
        document.getElementById("joke").innerHTML = txt;
    });
}
loadJoke();

/* --- NEWS RSS --- */
const newsFeeds = [
    "https://rss.unian.net/feed/allnews.rss",
    "https://gromadske.ua/rss",
    "https://24tv.ua/rss",
    "https://tsn.ua/rss",
    "https://dumska.com/feed/"
];

const rssApi = "https://api.rss2json.com/v1/api.json?rss_url=";

async function loadNews(){
    let ticker = document.getElementById("newsTicker");
    ticker.innerHTML = "";
    for(let feed of newsFeeds){
        let res = await fetch(rssApi + encodeURIComponent(feed));
        let data = await res.json();
        data.items.slice(0,5).forEach(item=>{
            ticker.innerHTML += `<a href="${item.link}" target="_blank">${item.title}</a>`;
        });
    }
}
loadNews();
setInterval(loadNews, 1000*60*5);
