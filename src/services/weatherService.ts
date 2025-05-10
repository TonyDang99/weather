import axios from 'axios';
import { WeatherData, ForecastData } from '../types/weather';

// Replace 'YOUR_API_KEY' with your actual OpenWeather API key
// Get your API key from: https://openweathermap.org/api
const API_KEY = 'e6a50c1c18d70156f26230cb0382e1a7';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getCurrentWeather = async (city: string): Promise<WeatherData> => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: city,
      appid: API_KEY,
      units: 'metric', // Use metric units (Celsius)
    },
  });
  return response.data;
};

export const getForecast = async (city: string): Promise<ForecastData> => {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      q: city,
      appid: API_KEY,
      units: 'metric', // Use metric units (Celsius)
    },
  });
  return response.data;
}; 