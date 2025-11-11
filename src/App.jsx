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
  const [citiesToCompare, setCitiesToCompare] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [mode, setMode] = useState(`single`);
  const [comparisonInput, setComparisonInput] = useState("");

  const fetchComparisonWeather = async () => {
  setLoading(true);
  try {
   
    const requests = citiesToCompare.map(city =>
      fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=pl`)
        .then(res => res.json()) 
    );

    const results = await Promise.all(requests);

    setComparisonData(results);
  } catch (error) {
    setError("Coś poszło nie tak przy pobieraniu wielu miast");
  } finally {
    setLoading(false);
  }
  };


  const handleComparisonInput = (e) => {
    setComparisonInput(e.target.value);
  }

  const handleAddCity = (e) => {
    e.preventDefault();
    const newCity = comparisonInput.trim();
  

  if (newCity && !citiesToCompare.includes(newCity) && citiesToCompare.length < 3){
    setCitiesToCompare([...citiesToCompare, newCity]);
    setComparisonInput("");
  }

}
  const handleRemoveCity = (cityToRemove) => {
    setCitiesToCompare(citiesToCompare.filter(city => city !== cityToRemove));
  };



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


  const handleInputChange = (e) => {
    setCityInput(e.target.value);
  };


  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (cityInput.trim() !== '') {
      fetchWeather(cityInput.trim());
    }
  };

  const renderWeatherPanel = () => {
    if (loading) {
      return <p className='loading'> ładowanie danych........</p>
    }

    if (error){
      return <p className="error"> błąd {error}</p>
    }

    if(weatherData) {
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

      <div className="mode-switcher" style={{ marginBottom: '20px' }}>
        <button onClick={() => setMode('single')} disabled={mode === 'single'}>
          Pojedyncze miasto
        </button>
        <button onClick={() => setMode('compare')} disabled={mode === 'compare'}>
          Porównaj miasta
        </button>
      </div>

      {mode === 'single' && (
        <>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              value={cityInput}
              onChange={handleInputChange}
              placeholder='wpisz nazwe miasta'
            />
            <button type='submit' disabled={loading}>
              Pobierz
            </button>
          </form>

          <div className='weather-panel'>
            {renderWeatherPanel()}
          </div>
        </>
      )}

      {mode === 'compare' && (
        <div className="comparison-mode">

          <form onSubmit={handleAddCity} className="form">
            <input
              type="text"
              value={comparisonInput}
              onChange={handleComparisonInput}
              placeholder='Dodaj miasto (max 3)'
              disabled={loading || citiesToCompare.length >= 3}
            />
            <button
              type='submit'
              disabled={loading || citiesToCompare.length >= 3 || comparisonInput.trim() === ''}
            >
              Dodaj
            </button>
          </form>

          <div className="city-tags" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0' }}>
            {citiesToCompare.length === 0 && <p>Brak dodanych miast</p>}
            {citiesToCompare.map((city, index) => (
              <span key={index} style={{ background: '#525252ff', padding: '5px 10px', borderRadius: '15px' }}>
                {city}
                <button onClick={() => handleRemoveCity(city)} style={{ marginLeft: '5px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'red', fontWeight: 'bold' }}>
                  X
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={fetchComparisonWeather}
            disabled={loading || citiesToCompare.length < 2}
            style={{ padding: '10px 20px', fontSize: '16px', margin: '10px 0 30px', cursor: 'pointer' }}
          >
            PORÓWNAJ TERAZ
          </button>

          <div className='weather-panel'>
            {loading && <p className='loading'>Ładowanie danych...</p>}
            {error && <p className="error">Błąd: {error}</p>}

            {comparisonData.length > 0 && (
              <div className="comparison-cards" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {comparisonData.map((data, index) => {
                  const { main, weather, name, sys } = data;
                  return (
                    <div key={index} className="weather-panel-content" style={{ flex: '0 1 250px', border: '1px solid #ccc', borderRadius: '8px', margin: '0' }}>
                      <h2>{name}, {sys.country}</h2>
                      <div className="weather-details">
                        <img src={`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`} alt={weather[0].description} className="weather-icon" />
                        <p className="temperature">{Math.round(main.temp)}°C</p>
                        <p className="description">{weather[0].description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {comparisonData.length > 0 && (
              <div className="temp-differences" style={{ marginTop: '30px', background: '#4b4949ff', padding: '15px', borderRadius: '8px', textAlign: 'left' }}>
                <h3>Podsumowanie:</h3>
                <p>Najcieplej: <strong>{Math.max(...comparisonData.map(d => d.main.temp)).toFixed(1)}°C</strong></p>
                <p>Najzimniej: <strong>{Math.min(...comparisonData.map(d => d.main.temp)).toFixed(1)}°C</strong></p>
                <p>Różnica: <strong>{(Math.max(...comparisonData.map(d => d.main.temp)) - Math.min(...comparisonData.map(d => d.main.temp))).toFixed(1)}°C</strong></p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  </>
);
}

export default App
