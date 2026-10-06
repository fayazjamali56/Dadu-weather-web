// Live weather from Open-Meteo (free, no API key)
const API_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_MIN = 10;

async function fetchWeather(loc) {
  const key = "wx_" + loc.slug;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || "null");
    if (hit && Date.now() - hit.t < CACHE_MIN * 60000) return hit.d;
  } catch (_) {}

  const p = new URLSearchParams({
    latitude: loc.lat, longitude: loc.lon, timezone: "Asia/Karachi", forecast_days: 7,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
  });
  const res = await fetch(`${API_URL}?${p}`);
  if (!res.ok) throw new Error("Weather service returned " + res.status);
  const data = await res.json();
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch (_) {}
  return data;
}
