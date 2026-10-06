const CODES = {
  0:["Clear sky","☀️","🌙"],1:["Mostly clear","🌤️","🌙"],2:["Partly cloudy","⛅","☁️"],3:["Overcast","☁️","☁️"],
  45:["Fog","🌫️","🌫️"],48:["Freezing fog","🌫️","🌫️"],51:["Light drizzle","🌦️","🌧️"],53:["Drizzle","🌦️","🌧️"],55:["Heavy drizzle","🌧️","🌧️"],
  61:["Light rain","🌦️","🌧️"],63:["Rain","🌧️","🌧️"],65:["Heavy rain","🌧️","🌧️"],80:["Rain showers","🌦️","🌧️"],81:["Rain showers","🌧️","🌧️"],82:["Violent showers","⛈️","⛈️"],
  95:["Thunderstorm","⛈️","⛈️"],96:["Thunderstorm, hail","⛈️","⛈️"],99:["Thunderstorm, hail","⛈️","⛈️"],
};
const wx = (code, day = 1) => { const c = CODES[code] || ["Unknown","🌡️","🌡️"]; return { label:c[0], icon: day ? c[1] : c[2] }; };
const deg = n => Math.round(n) + "°";
const hhmm = iso => new Date(iso).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Karachi"});

function renderHeroNow(el, loc) {
  fetchWeather(loc).then(d => {
    const c = d.current, w = wx(c.weather_code, c.is_day);
    el.innerHTML = `<h3>${loc.name} now</h3>
      <div style="display:flex;align-items:center;gap:16px"><span style="font-size:3.4rem">${w.icon}</span>
      <div><div class="temp">${deg(c.temperature_2m)}</div><div class="cond">${w.label}</div></div></div>
      <p class="meta" style="margin:14px 0 0">Feels ${deg(c.apparent_temperature)} · Humidity ${c.relative_humidity_2m}% · Wind ${Math.round(c.wind_speed_10m)} km/h</p>`;
  }).catch(() => { el.innerHTML = `<p>Could not load live weather. Check your internet and refresh.</p>`; });
}

function renderLocationCardGrid(el, list) {
  el.innerHTML = list.map(l => `<a class="location-card" href="weather.html?loc=${l.slug}">
    <img src="${l.image}" alt="" onerror="this.style.display='none'">
    <div class="card-body"><h3>${l.name}</h3><div class="card-temp" data-c="${l.slug}">…</div><div class="card-cond">Loading</div></div></a>`).join("");
  list.forEach(l => fetchWeather(l).then(d => {
    const c = d.current, w = wx(c.weather_code, c.is_day), box = el.querySelector(`[data-c="${l.slug}"]`);
    box.textContent = deg(c.temperature_2m); box.nextElementSibling.textContent = `${w.icon} ${w.label}`;
  }).catch(() => { el.querySelector(`[data-c="${l.slug}"]`).nextElementSibling.textContent = "Unavailable"; }));
}

function attachLocationSearch(input, box) {
  input.addEventListener("input", () => {
    box.innerHTML = searchLocations(input.value).map(l => `<a href="weather.html?loc=${l.slug}">${l.name}</a>`).join("");
  });
  document.addEventListener("click", e => { if (!box.contains(e.target) && e.target !== input) box.innerHTML = ""; });
}

async function renderDetailPage() {
  const loc = getLocationBySlug(new URLSearchParams(location.search).get("loc"));
  const $ = s => document.querySelector(s), set = (s, v) => { const e = $(s); if (e) e.textContent = v; };
  document.querySelectorAll("[data-detail-name]").forEach(e => e.textContent = loc.name);
  document.title = `${loc.name} Weather — Dadu Weather`;
  set("[data-detail-place]", loc.place);
  const img = $("[data-detail-image]"); img.src = loc.image; img.alt = loc.name;
  try {
    const d = await fetchWeather(loc), c = d.current, w = wx(c.weather_code, c.is_day), dy = d.daily;
    $("[data-now-icon]").innerHTML = `<span style="font-size:4rem">${w.icon}</span>`;
    set("[data-now-temp]", deg(c.temperature_2m)); set("[data-now-cond]", w.label);
    set("[data-now-feels]", "Feels like " + deg(c.apparent_temperature));
    set("[data-now-high]", deg(dy.temperature_2m_max[0])); set("[data-now-low]", deg(dy.temperature_2m_min[0]));
    const stats = { humidity:c.relative_humidity_2m+"%", wind:Math.round(c.wind_speed_10m)+" km/h", pressure:Math.round(c.pressure_msl)+" hPa",
      rain:(dy.precipitation_probability_max[0] ?? 0)+"%", cloud:c.cloud_cover+"%", uv:Math.round(dy.uv_index_max[0]),
      sunrise:hhmm(dy.sunrise[0]), sunset:hhmm(dy.sunset[0]) };
    for (const k in stats) set(`[data-stat="${k}"]`, stats[k]);
    const h = d.hourly, start = Math.max(0, h.time.findIndex(t => t >= c.time));
    $("[data-hourly]").innerHTML = h.time.slice(start, start + 24).map((t, i) => {
      const j = start + i, hr = +t.slice(11, 13), day = hr >= 6 && hr < 18;
      return `<div><span class="time">${i ? hhmm(t) : "Now"}</span><span style="font-size:1.5rem">${wx(h.weather_code[j], day).icon}</span><span class="temp">${deg(h.temperature_2m[j])}</span><span class="time">${h.precipitation_probability[j] ?? 0}%</span></div>`;
    }).join("");
    $("[data-forecast]").innerHTML = dy.time.map((t, i) => {
      const w2 = wx(dy.weather_code[i]), name = i ? new Date(t).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}) : "Today";
      return `<div><span class="day">${name}</span><span style="font-size:1.5rem">${w2.icon}</span><span class="cond">${w2.label} · ☔ ${dy.precipitation_probability_max[i] ?? 0}%</span><span class="temp">${deg(dy.temperature_2m_max[i])} <span class="lo">${deg(dy.temperature_2m_min[i])}</span></span></div>`;
    }).join("");
  } catch (e) {
    const b = $("[data-error-banner]"); b.style.display = "block";
    b.textContent = "Could not load live weather right now. Check your internet connection and refresh the page.";
  }
}
