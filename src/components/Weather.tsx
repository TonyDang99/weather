import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  InputAdornment,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { WeatherData, ForecastData } from '../types/weather';

const getWeatherIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@4x.png`;

// 1. Helper for dynamic background (simple version)
const getBackgroundGradient = (weatherMain: string, mode: string) => {
  if (mode === 'dark') return 'linear-gradient(135deg, #232526 0%, #414345 100%)';
  switch (weatherMain) {
    case 'Clear': return 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)';
    case 'Clouds': return 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
    case 'Rain': return 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)';
    case 'Thunderstorm': return 'linear-gradient(135deg, #232526 0%, #414345 100%)';
    case 'Snow': return 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
    default: return 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
  }
};

// Theme definitions
const THEMES = [
  {
    name: 'Classic',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  },
  {
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
  },
  {
    name: 'Sunset',
    gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
  },
  {
    name: 'Aurora',
    gradient: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 50%, #91eac9 100%)',
  },
  {
    name: 'Night',
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
  },
];

const Weather: React.FC<{ mode: string; toggleMode: () => void }> = ({ mode, toggleMode }) => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const weatherMain = weather ? weather.weather[0].main : '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: selectedTheme.gradient,
        py: { xs: 2, sm: 6 },
        px: 1,
        transition: 'background 0.6s',
      }}
    >
      {/* Theme Picker Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center', alignItems: 'center' }}>
        {THEMES.map(theme => (
          <Button
            key={theme.name}
            onClick={() => setSelectedTheme(theme)}
            sx={{
              minWidth: 0,
              width: 44,
              height: 44,
              borderRadius: '50%',
              p: 0,
              border: selectedTheme.name === theme.name ? '3px solid #1976d2' : '2px solid #fff',
              boxShadow: selectedTheme.name === theme.name ? '0 0 0 2px #1976d2' : '0 1px 4px 0 rgba(0,0,0,0.10)',
              background: theme.gradient,
              transition: 'border 0.2s, box-shadow 0.2s',
              outline: 'none',
            }}
            aria-label={theme.name}
          />
        ))}
      </Box>
      {/* Show theme name on wall */}
      <Typography align="center" fontWeight={700} fontSize={18} color="#1976d2" sx={{ mb: 1, letterSpacing: 1, textShadow: '0 2px 8px #fff8' }}>
        {selectedTheme.name} Theme
      </Typography>
      <Container maxWidth="sm" disableGutters={isMobile}>
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 6, background: mode === 'dark' ? 'rgba(30,30,30,0.75)' : 'rgba(255,255,255,0.55)', position: 'relative', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
          {/* Dark mode toggle button */}
          <Button
            onClick={toggleMode}
            sx={{ position: 'absolute', top: 16, right: 16, minWidth: 0, p: 1, borderRadius: '50%', zIndex: 2, background: mode === 'dark' ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.7)' }}
            color="inherit"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </Button>
          <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" align="center" gutterBottom fontWeight={700} color={mode === 'dark' ? '#fff' : '#1976d2'} sx={{ letterSpacing: 1, mb: 2 }}>
            Weather Forecast
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <TextField
              label="Enter city name"
              value={city}
              fullWidth
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{ mb: { xs: 2, sm: 0 } }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                minWidth: { xs: '100%', sm: 120 },
                fontWeight: 700,
                height: { xs: 48, sm: 'auto' },
              }}
              onClick={handleSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
            >
              SEARCH
            </Button>
          </Box>

          <Fade in={!!error} unmountOnExit>
            <Alert severity="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Alert>
          </Fade>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={48} color="primary" />
            </Box>
          )}

          {weather && (
            <Card elevation={0} sx={{ mb: 4, borderRadius: 6, background: mode === 'dark' ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.35)', boxShadow: '0 4px 24px 0 rgba(31,38,135,0.17)', backdropFilter: 'blur(12px)', p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 320 }}>
              <CardContent sx={{ width: '100%', p: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={700} color={mode === 'dark' ? '#fff' : '#1976d2'} sx={{ mb: 1, letterSpacing: 1 }}>
                    {weather.name}, {weather.sys.country}
                  </Typography>
                  <img
                    src={getWeatherIconUrl(weather.weather[0].icon)}
                    alt={weather.weather[0].description}
                    width={isMobile ? 90 : 120}
                    height={isMobile ? 90 : 120}
                    style={{ filter: 'drop-shadow(0 2px 8px #1976d2aa)' }}
                  />
                  <Typography variant={isMobile ? 'h2' : 'h1'} fontWeight={700} color={mode === 'dark' ? '#fff' : '#1976d2'} sx={{ mt: 1, mb: 0.5, fontSize: isMobile ? 48 : 72 }}>
                    {Math.round(weather.main.temp)}°C
                  </Typography>
                  <Typography color={mode === 'dark' ? '#eee' : 'textSecondary'} fontSize={isMobile ? 16 : 20} sx={{ mb: 1 }}>
                    {weather.weather[0].description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2, width: '100%' }}>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={600} fontSize={isMobile ? 13 : 15}>Feels like</Typography>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={700}>{Math.round(weather.main.feels_like)}°C</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={600} fontSize={isMobile ? 13 : 15}>Humidity</Typography>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={700}>{weather.main.humidity}%</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={600} fontSize={isMobile ? 13 : 15}>Wind</Typography>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={700}>{weather.wind.speed} m/s</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={600} fontSize={isMobile ? 13 : 15}>Pressure</Typography>
                    <Typography color={mode === 'dark' ? '#fff' : '#1976d2'} fontWeight={700}>{weather.main.pressure} hPa</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {forecast && (
            (() => {
              // Filter forecast to get one entry per day (preferably around 12:00, using the city's local time)
              const cityTimezone = forecast.city?.timezone || 0; // in seconds
              const dailyMap = new Map();
              forecast.list.forEach(item => {
                // Adjust dt for the city's timezone
                const localDt = item.dt + cityTimezone;
                const date = new Date(localDt * 1000);
                // Use local date string for the day key
                const day = date.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
                // Prefer 12:00, fallback to closest to 12:00
                if (
                  !dailyMap.has(day) ||
                  Math.abs(date.getHours() - 12) < Math.abs(new Date((dailyMap.get(day).dt + cityTimezone) * 1000).getHours() - 12)
                ) {
                  dailyMap.set(day, item);
                }
              });
              const dailyForecasts = Array.from(dailyMap.values()).slice(0, 5);
              return (
                <Box sx={{ overflowX: 'auto', display: 'flex', flexDirection: 'row', gap: 2, py: 1, px: 0, mt: 2, mb: 1 }}>
                  {dailyForecasts.map((item, index) => (
                    <Card key={index} elevation={0} sx={{ minWidth: 120, borderRadius: 5, background: mode === 'dark' ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.35)', boxShadow: '0 2px 12px 0 rgba(31,38,135,0.13)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} color={mode === 'dark' ? '#fff' : '#1976d2'} sx={{ mb: 1 }}>
                        {new Date((item.dt + cityTimezone) * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                      </Typography>
                      <img
                        src={getWeatherIconUrl(item.weather[0].icon)}
                        alt={item.weather[0].description}
                        width={40}
                        height={40}
                        style={{ marginBottom: 4 }}
                      />
                      <Typography variant="h6" fontWeight={700} color={mode === 'dark' ? '#fff' : '#1976d2'}>
                        {Math.round(item.main.temp)}°
                      </Typography>
                      <Typography color={mode === 'dark' ? '#eee' : 'textSecondary'} fontSize={13} sx={{ mt: 0.5 }}>
                        {item.weather[0].main}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              );
            })()
          )}
        </Paper>
      </Container>
      {/* Vietnam sovereignty message at the bottom */}
      <Box sx={{ width: '100%', mt: 4, mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography fontWeight={700} fontSize={16} color="#d32f2f" align="center" sx={{ letterSpacing: 1, textShadow: '0 2px 8px #fff8', display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/vietnam-flag.svg" alt="Vietnam flag" style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 2, boxShadow: '0 1px 4px #0003' }} />
          TRƯỜNG SA - HOÀNG SA LÀ CỦA VIỆT NAM
          <img src="/vietnam-flag.svg" alt="Vietnam flag" style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 2, boxShadow: '0 1px 4px #0003' }} />
        </Typography>
      </Box>
    </Box>
  );
};

export default Weather; 