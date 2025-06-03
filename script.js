document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const currentCity = document.getElementById('current-city');
    const currentTemp = document.getElementById('current-temp');
    const currentWind = document.getElementById('current-wind');
    const currentHumidity = document.getElementById('current-humidity');
    const weatherDesc = document.getElementById('weather-desc');
    const feelsLike = document.getElementById('feels-like');
    const windSpeed = document.getElementById('wind-speed');
    const humidity = document.getElementById('humidity');
    const forecastContainer = document.getElementById('forecast-container');

    // API Key - Replace with your actual API key
    const API_KEY = 'YOUR_API_KEY'; // Get one from OpenWeatherMap

    // Initial load with default city
    fetchWeather('London');

    // Event Listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });

    locationBtn.addEventListener('click', getLocationWeather);

    // Functions
    async function fetchWeather(city) {
        try {
            // Current weather
            const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
            const currentData = await currentResponse.json();
            
            if (currentData.cod === '404') {
                alert('City not found. Please try another city.');
                return;
            }
            
            updateCurrentWeather(currentData);
            
            // Forecast
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
            const forecastData = await forecastResponse.json();
            updateForecast(forecastData);
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        }
    }

    function updateCurrentWeather(data) {
        const date = new Date(data.dt * 1000).toISOString().split('T')[0];
        currentCity.textContent = `${data.name} (${date})`;
        currentTemp.textContent = data.main.temp.toFixed(1);
        currentWind.textContent = data.wind.speed.toFixed(1);
        currentHumidity.textContent = data.main.humidity;
        
        // Weather description with capital first letter
        const description = data.weather[0].description;
        weatherDesc.textContent = description.charAt(0).toUpperCase() + description.slice(1);
        
        feelsLike.textContent = data.main.feels_like.toFixed(1);
        windSpeed.textContent = data.wind.speed.toFixed(1);
        humidity.textContent = data.main.humidity;
    }

    function updateForecast(data) {
        forecastContainer.innerHTML = '';
        
        // Get forecast for next 5 days at 12:00 PM each day
        const dailyForecasts = data.list.filter(item => {
            return item.dt_txt.includes('12:00:00');
        }).slice(0, 5);
        
        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000).toISOString().split('T')[0];
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-date">(${date})</div>
                <div class="forecast-temp">Temp: ${day.main.temp.toFixed(1)}°C</div>
                <div class="forecast-wind">Wind: ${day.wind.speed.toFixed(1)} M/S</div>
                <div class="forecast-humidity">Humidity: ${day.main.humidity}%</div>
            `;
            
            forecastContainer.appendChild(forecastItem);
        });
    }

    function getLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    try {
                        // Current weather
                        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                        const currentData = await currentResponse.json();
                        updateCurrentWeather(currentData);
                        
                        // Forecast
                        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                        const forecastData = await forecastResponse.json();
                        updateForecast(forecastData);
                        
                        // Update input field
                        cityInput.value = currentData.name;
                        
                    } catch (error) {
                        console.error('Error fetching weather data:', error);
                        alert('Error fetching weather data. Please try again.');
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to retrieve your location. Please enable location services or search for a city manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please search for a city manually.');
        }
    }
});