const $ = (id) => document.getElementById(id);

const weatherDescriptions = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Dense drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"], 57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"], 67: ["Heavy freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"], 80: ["Rain showers", "🌦️"], 81: ["Rain showers", "🌧️"],
  82: ["Heavy showers", "⛈️"], 85: ["Snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Severe thunderstorm", "⛈️"]
};

async function fetchJSON(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json();
}

async function getWeather(city) {
  const query = city.trim();
  if (!query) throw new Error("Please enter a city name.");

  const geoURL = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoURL.search = new URLSearchParams({ name: query, count: "1", language: "en", format: "json" });
  const geoData = await fetchJSON(geoURL);

  if (!geoData.results?.length) throw new Error(`No city found for "${query}".`);
  const place = geoData.results[0];

  const weatherURL = new URL("https://api.open-meteo.com/v1/forecast");
  weatherURL.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    forecast_days: "5",
    timezone: "auto"
  });

  const data = await fetchJSON(weatherURL);
  if (!data.current || !data.daily) throw new Error("Weather data format was unexpected.");
  renderDashboard(place, data);
}

function renderDashboard(place, data) {
  const c = data.current;
  const [description, icon] = weatherDescriptions[c.weather_code] || ["Conditions unavailable", "🌡️"];
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  $("cityName").textContent = [place.name, region].filter(Boolean).join(", ");
  $("localTime").textContent = `Local time: ${c.time.replace("T", " ")}`;
  $("temperature").textContent = Math.round(c.temperature_2m);
  $("condition").textContent = description;
  $("weatherIcon").textContent = icon;
  $("humidity").innerHTML = `${c.relative_humidity_2m}<small>%</small>`;
  $("wind").innerHTML = `${c.wind_speed_10m}<small> km/h</small>`;
  $("feelsLike").innerHTML = `${Math.round(c.apparent_temperature)}<small>°C</small>`;
  $("feelsText").textContent = `Feels like ${Math.round(c.apparent_temperature)}°C`;
  $("precipitation").innerHTML = `${c.precipitation}<small> mm</small>`;
  $("humidityBar").style.width = `${Math.max(0, Math.min(100, c.relative_humidity_2m))}%`;
  $("windDirection").textContent = `Direction: ${c.wind_direction_10m}°`;
  $("todayDate").textContent = new Date(c.time).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });

  const tip = c.precipitation > 0 ? "Rain is currently recorded. Consider carrying an umbrella." :
    c.temperature_2m >= 32 ? "It is warm outside. Stay hydrated and seek shade." :
    c.wind_speed_10m >= 25 ? "It is breezy. Take care outdoors." :
    "Conditions look relatively calm. Have a great day!";
  $("weatherTip").textContent = tip;

  renderForecast(data.daily);
}

function renderForecast(daily) {
  const grid = $("forecastGrid");
  grid.innerHTML = "";
  daily.time.forEach((date, i) => {
    const [label, icon] = weatherDescriptions[daily.weather_code[i]] || ["Variable", "🌡️"];
    const day = i === 0 ? "Today" : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" });
    const card = document.createElement("article");
    card.className = "forecast-day";
    card.innerHTML = `
      <div class="day">${day}</div>
      <div class="icon" title="${label}">${icon}</div>
      <div class="temps">${Math.round(daily.temperature_2m_max[i])}° <span>${Math.round(daily.temperature_2m_min[i])}°</span></div>
      <div class="rain-chance">☂ ${daily.precipitation_probability_max[i] ?? 0}%</div>
    `;
    grid.appendChild(card);
  });
}

$("searchForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("searchButton");
  const status = $("status");
  button.disabled = true;
  button.textContent = "Loading...";
  status.className = "status";
  status.textContent = "Fetching live weather data...";
  try {
    await getWeather($("cityInput").value);
    status.textContent = "Weather updated successfully.";
  } catch (error) {
    console.error(error);
    status.className = "status error";
    status.textContent = error instanceof TypeError
      ? "Network error. Check your internet connection and try again."
      : error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Search";
  }
});

$("searchForm").requestSubmit();
