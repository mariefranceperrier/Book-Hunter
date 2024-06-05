import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const { title, author, genre, city, results } = location.state;
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (results.length > 0) {
      const averageLat = results.reduce((sum, result) => sum + parseFloat(result.latitude), 0) / results.length;
      const averageLng = results.reduce((sum, result) => sum + parseFloat(result.longitude), 0) / results.length;
      setMapCenter({ lat: averageLat, lng: averageLng });
    }
  }, [results]);

  const handleViewShelter = (shelterId) => {
    navigate(`/shelter/${shelterId}`);
  };

  return (
    <main className="search-results">
      <h1>Search Results</h1>
      <div className="result">
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Author:</strong> {author}</p>
        <p><strong>Genre:</strong> {genre}</p>
        <p><strong>City:</strong> {city}</p>
      </div>

      <div className="map-container">
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <Map
            className="map"
            defaultZoom={10}
            center={mapCenter}
            style={{ width: '100%', height: '400px' }}
            scrollwheel={true}
          >
            {results.map((result, index) => (
              <Marker
                key={index}
                position={{ lat: parseFloat(result.latitude), lng: parseFloat(result.longitude) }}
                onClick={() => handleViewShelter(result.shelter_id)}
              />
            ))}
          </Map>
        </APIProvider>
      </div>
    </main>
  );
}

export default SearchResults;