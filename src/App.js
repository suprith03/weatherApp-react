import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Card, CardContent, Typography, Grid, Autocomplete } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaArrowDown } from "react-icons/fa";
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const [inputCity, setInputCity] = useState("");
  const [data, setData] = useState({});
  const [forecast, setForecast] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const getWeatherDetails = (cityName) => {
    if (!cityName) return;
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
    axios.get(apiURL).then((res) => {
      setData(res.data);
      const { lat, lon } = res.data.coord;
      const forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;
      axios.get(forecastURL).then((forecastRes) => {
        setForecast(forecastRes.data.daily);
      });
      setError("");
    }).catch((err) => {
      setError("Unable to fetch weather data. Please try again.");
    });
  };

  const handleChangeInput = (e) => {
    const city = e.target.value;
    setInputCity(city);
    if (city.length > 2) {
      axios.get(`https://api.openweathermap.org/data/2.5/find?q=${city}&appid=${apiKey}`)
        .then((res) => {
          const uniqueSuggestions = Array.from(new Set(res.data.list.map(city => `${city.name}, ${city.sys.country}`)));
          setSuggestions(uniqueSuggestions.filter(suggestion => suggestion.toLowerCase().includes(city.toLowerCase())));
        }).catch((err) => {
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    getWeatherDetails(inputCity);
  };

  const generateChartData = (forecast) => {
    return {
      labels: forecast.map(day => new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: 'short' })),
      datasets: [{
        label: 'Temperature (°C)',
        data: forecast.map(day => ((day.temp.day) - 273.15).toFixed(2)),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      }]
    };
  };

  const formatPrecipitation = (value) => {
    const percentage = value * 100;
    return percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2);
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <Grid container justifyContent="center" className="main-container">
      <Grid item xs={12} md={8}>
        <div className="weatherBg">
          <h1 className="heading">Weather App</h1>
          <div className="d-grid gap-3 col-4 mt-4">
            <Autocomplete
              freeSolo
              options={suggestions}
              onInputChange={(event, newValue) => {
                setInputCity(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Enter City Name"
                  variant="outlined"
                  onChange={handleChangeInput}
                  onKeyDown={handleKeyDown}
                  value={inputCity}
                  className="autocomplete-input"
                />
              )}
            />
            <Button variant="contained" className="search-button" onClick={handleSearch}>
              Search
            </Button>
          </div>
          {error && <Typography color="error">{error}</Typography>}
          <FaArrowDown className="down-arrow" onClick={scrollToContent} />
        </div>

        {Object.keys(data).length > 0 &&
          <div className="col-md-12 text-center mt-5">
            <Typography variant="h4" className="city-heading">{data?.name}</Typography>
            <Card className="weatherResultBox">
              <CardContent>
                <img src={`https://openweathermap.org/img/wn/${data?.weather[0]?.icon}@2x.png`} alt="icon" />
                <Typography variant="h5" component="div" className="weatherCity">
                  {data?.name}
                </Typography>
                <Typography variant="h6" className="weatherTemp">
                  {((data?.main?.temp) - 273.15).toFixed(2)}°C
                </Typography>
                <Typography variant="body2">
                  Humidity: {data?.main?.humidity}%
                </Typography>
                <Typography variant="body2">
                  Wind Speed: {data?.wind?.speed} m/s
                </Typography>
                <Typography variant="body2">
                  {data?.weather[0]?.description}
                </Typography>
              </CardContent>
            </Card>
          </div>
        }
        
        {forecast.length > 0 &&
  <Grid container spacing={2} className="mt-5">
    <Typography variant="h5" className="forecast-heading">7-Days Forecast</Typography>
    <Grid container spacing={2} justifyContent="center">
      {forecast.slice(0, 4).map((day, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card className="forecastCard">
            <CardContent>
              <Typography variant="h6">
                {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: 'long' })}
              </Typography>
              <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt="icon" />
              <Typography variant="h6">
                {((day.temp.day) - 273.15).toFixed(2)}°C
              </Typography>
              <Typography variant="body2">
                {day.weather[0].description}
              </Typography>
              <Typography variant="body2">
                Precipitation: {formatPrecipitation(day.pop)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2} justifyContent="center" className="mt-2">
      {forecast.slice(4, 7).map((day, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card className="forecastCard">
            <CardContent>
              <Typography variant="h6">
                {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: 'long' })}
              </Typography>
              <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt="icon" />
              <Typography variant="h6">
                {((day.temp.day) - 273.15).toFixed(2)}°C
              </Typography>
              <Typography variant="body2">
                {day.weather[0].description}
              </Typography>
              <Typography variant="body2">
                Precipitation: {formatPrecipitation(day.pop)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Grid>
}
        {
        forecast.length > 0 &&
          <div className="mt-5">
            <Typography variant="h5" className="chart-heading">Temperature Chart</Typography>
            <Line data={generateChartData(forecast)} />
          </div>
        }
      </Grid>
    </Grid>
  );
}

export default App;
