
// ======================================
// WEATHER DASHBOARD - JAVASCRIPT
// ======================================

// Main Function
async function getWeather() {

    // Get City Name
    const city = document.getElementById("cityInput").value.trim();

    const error = document.getElementById("error");
    const button = document.querySelector("button");

    // Check Empty Input
    if (city === "") {
        error.innerText = "Please enter a city name!";
        return;
    }

    try {

        // Loading Message
        error.style.color = "blue";
        error.innerText = "Loading weather data...";

        button.disabled = true;

        // ======================================
        // STEP 1: FETCH CITY LOCATION
        // ======================================

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        // Check API Response
        if (!geoResponse.ok) {
            throw new Error("Location API request failed!");
        }

        // Convert Response into JSON
        const geoData = await geoResponse.json();

        // Check City Exists
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found! Try another city.");
        }

        // Get Latitude and Longitude
        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;


        // ======================================
        // STEP 2: FETCH WEATHER DATA
        // ======================================

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        // Check Weather API Response
        if (!weatherResponse.ok) {
            throw new Error("Weather API request failed!");
        }

        // Convert JSON Data
        const weatherData = await weatherResponse.json();

        // Get Current Weather Object
        const current = weatherData.current;

        if (!current) {
            throw new Error("Weather information unavailable!");
        }


        // ======================================
        // STEP 3: EXTRACT WEATHER INFORMATION
        // ======================================

        const temperature = current.temperature_2m;

        const humidity = current.relative_humidity_2m;

        const wind = current.wind_speed_10m;

        const feelsLike = current.apparent_temperature;

        const weatherCode = current.weather_code;


        // ======================================
        // STEP 4: WEATHER CONDITION
        // ======================================

        let condition = "";

        let icon = "";

        switch (weatherCode) {

            case 0:
                condition = "Clear Sky";
                icon = "☀️";
                break;

            case 1:
                condition = "Mainly Clear";
                icon = "🌤️";
                break;

            case 2:
                condition = "Partly Cloudy";
                icon = "⛅";
                break;

            case 3:
                condition = "Overcast";
                icon = "☁️";
                break;

            case 45:
            case 48:
                condition = "Foggy";
                icon = "🌫️";
                break;

            case 51:
            case 53:
            case 55:
                condition = "Drizzle";
                icon = "🌦️";
                break;

            case 61:
            case 63:
            case 65:
            case 80:
            case 81:
            case 82:
                condition = "Rainy";
                icon = "🌧️";
                break;

            case 71:
            case 73:
            case 75:
            case 77:
            case 85:
            case 86:
                condition = "Snowy";
                icon = "❄️";
                break;

            case 95:
            case 96:
            case 99:
                condition = "Thunderstorm";
                icon = "⛈️";
                break;

            default:
                condition = "Weather Information";
                icon = "🌡️";
        }


        // ======================================
        // STEP 5: DISPLAY DATA IN HTML
        // ======================================

        document.getElementById("city").innerText =
            location.name + ", " + (location.country || "");

        document.getElementById("temperature").innerText =
            temperature + " °C";

        document.getElementById("humidity").innerText =
            humidity + " %";

        document.getElementById("wind").innerText =
            wind + " km/h";

        document.getElementById("condition").innerText =
            icon + " " + condition;


        // Optional: Display Feels Like
        let feelsElement = document.getElementById("feelsLike");

        if (feelsElement) {
            feelsElement.innerText = feelsLike + " °C";
        }


        // Success Message
        error.style.color = "green";

        error.innerText = "Weather data loaded successfully!";


        // Console Output
        console.log("City:", location.name);

        console.log("Temperature:", temperature);

        console.log("Humidity:", humidity);

        console.log("Wind Speed:", wind);

        console.log("Weather:", condition);


    }

    // ======================================
    // STEP 6: ERROR HANDLING
    // ======================================

    catch (err) {

        console.error("Error:", err);

        error.style.color = "red";

        if (err instanceof TypeError) {
            error.innerText =
                "Network error! Check your internet connection.";
        } else {
            error.innerText = err.message;
        }

    }

    // ======================================
    // STEP 7: FINALLY BLOCK
    // ======================================

    finally {

        button.disabled = false;

    }

}


// ======================================
// END OF WEATHER DASHBOARD JAVASCRIPT
// ======================================
