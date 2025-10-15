import { useState , useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const API_KEY = "f921580417e352b125930c3aedae46c0";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('Warszawa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("Warszawa");

  const fetchWeather = async (cityName) => {
    if (!cityName) return;


    //ustawienie stanu na ładowianie, wyczyszcxzenie błędów i danych
    setLoading(true);
    setError(null);
    setWeatherData(null);

    const url = `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;

    try{
      const response = await fetch(url);

      if(!response.ok){
        if(response.status === 404) {
          throw new Error("nie znaleziono miasta");
        }

        throw new Error('błąd serwera: ${response.statusText}');
      }

      const data = await response.json();

      setWeatherData(data);
      setCity(cityName);
      
    }
    catch (error) {
      setError(error.message);

    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

//aktualizacja stanu cityinput przy każdej wpisanej wartości
  const handleInputChange = (e) => {
    setCityInput(e.target.value);
  };

  //obsługa wysyłania formularza 
  const handleSubmit = (e) => {
    e.preventDefault(); //zapobiega przeładowaniu ustrony
    if (cityInput.trim() !== '') {
      fetchWeather(cityInput.trim());
    }
  };

//renderowanie warunkowe panelu z pogodą 
  const renderWeatherPanel = () => {
    if (loading) {
      return <p className='loading'> ładowanie danych........</p>
    }

    if (error){
      return <p className="error"> błąd {error}</p>
    }

    if(weatherData) {
            //wyciągnięcie danych z obiektu
            const {main, weather, name, sys} = weatherData;
            const temperature = Math.round(main.temp);
            const description = weather[0].description;
            const iconCode = weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
            const country = sys.country;

            return(
              <div className="weather-panel-content">
                <h2>Pogoda dla {name}, {country}</h2>
                <div className="weather-details">
                  <img src={iconUrl} alt={description} className="weather-icon" />
                  <p className="temperature">{temperature}*C</p>
                  <p className="description">{description}</p>
                </div>
              </div>
            );
    }
    return <p>Wpisz miasto i naciśnij "Pobierz" aby sprawdzić pogodę.</p>;
  }



  return (
    <>
     <div className='App'>
        <h1>Aktualna Pogoda</h1>

        <form onSubmit={handleSubmit} className="form">
          <input 
          type="text"
          value={cityInput}
          onChange={handleInputChange}
          placeholder='wpisz nazwe miasta'
          
          />

          <button type='submit' disabled={loading}>
        
          </button>
        </form>

          <div className='weather-panel'>
              {renderWeatherPanel()}
          </div>
     </div>
    </>
  );
}

export default App
