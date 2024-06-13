import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const { title, author, genre, city, results } = location.state;
  const navigate = useNavigate();
  const [hoveredShelter, setHoveredShelter] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    console.log('Search results:', results);
    if (results.length > 0) {
      const averageLat = results.reduce((sum, result) => sum + parseFloat(result.latitude), 0) / results.length;
      const averageLng = results.reduce((sum, result) => sum + parseFloat(result.longitude), 0) / results.length;
      setMapCenter({ lat: averageLat, lng: averageLng });
    }
  }, [results]);

  const handleViewShelter = (result) => {
    navigate(`/shelter/${result.shelter_id}`, { state: { shelter: result } });
  };

  const formatResults = (results) => {
    return results.map((result, index) => {
      return {
        key: `resultID${index + 1}`,
        location: {
          lat: parseFloat(result.latitude),
          lng: parseFloat(result.longitude),
        },
        ...result
      };
    }).filter(result => !isNaN(result.location.lat) && !isNaN(result.location.lng));
  };

  const formattedResults = formatResults(results);

  const handleInfoWindowClose = () => {
  setHoveredShelter(null);
  };

  return (
    <main className="search-results">
      <h1>Search Results</h1>
      <div className="result">
        <p><strong>Title:</strong><span className="data"> {title}</span></p>
        <p><strong>Author:</strong><span className="data"> {author}</span></p>
        <p><strong>Genre:</strong><span className="data"> {genre}</span></p>
        <p><strong>City:</strong><span className="data"> {city}</span></p>
      </div>

      <div className="map-container-search">
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <Map
            className="map"
            defaultZoom={10}
            center={mapCenter}
            style={{ width: '100%', height: '400px' }}
            scrollwheel={true}
            disableDefaultUI={true}
          >
            {formattedResults.map((result) => (
              <Marker
                key={result.key}
                position={{ lat: result.location.lat, lng: result.location.lng }}
                onMouseOver={() => setHoveredShelter(result)}
                onClick={() => handleViewShelter(result)}
              />
            ))}
            {hoveredShelter && (
              <InfoWindow
                position={{
                  lat: hoveredShelter.location.lat + 0.0005,
                  lng: hoveredShelter.location.lng
                }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="search-results-info-window">
                  <span>{hoveredShelter.civic_number} {hoveredShelter.street_name}, {hoveredShelter.city}</span>
                  <button
                    className="info-window-button"
                    onClick={() => handleViewShelter(hoveredShelter)}
                  >
                    View Content
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </main>
  );
}

export default SearchResults;