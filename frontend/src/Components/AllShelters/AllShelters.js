import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import './AllShelters.css';

const PoiMarkers = ({ pois }) => {
  const map = useMap();

  const handleClick = (ev) => {
    if (!map) return;
    if (!ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
  };

  return (
    <>
      {pois.map((poi) => (
        <Marker
          key={poi.key}
          position={poi.location}
          title={poi.key}
          clickable={true}
          onClick={handleClick}
        />
      ))}
    </>
  );
};

PoiMarkers.propTypes = {
  pois: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    location: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }).isRequired,
  })).isRequired,
};

const AllShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 45.4215, lng: -75.6910 });
  const [map, setMap] = useState(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await axios.get('/api/shelters');
        if (response.status === 200) {
          setShelters(response.data);
        } else {
          console.error('Failed to fetch shelters');
        }
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    fetchShelters();
  }, []);

  useEffect(() => {
    const formatShelters = () => {
      const formattedData = shelters.map((shelter, index) => {
        return {
          key: `shelterID${index + 1}`,
          location: {
            lat: parseFloat(shelter.latitude),
            lng: parseFloat(shelter.longitude),
          },
        };
      }).filter(shelter => shelter.location.lat && shelter.location.lng);
      setLocations(formattedData);
    };

    formatShelters();
  }, [shelters]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    debounceFetchLocations(e.target.value);
  };

  const fetchCityCoordinates = async (city) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: city,
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        }
      });
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return location;
      } else {
        throw new Error(`No results found for city: ${city}`);
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
      return null;
    }
  };

  const fetchLocations = async (city) => {
    try {
      let data;
      if (city) {
        const cityCoordinates = await fetchCityCoordinates(city);
        if (cityCoordinates) {
          setMapCenter({ lat: cityCoordinates.lat, lng: cityCoordinates.lng });
          if (map) {
            map.panTo({ lat: cityCoordinates.lat, lng: cityCoordinates.lng });
          }
        }
        const response = await axios.get(`/api/shelters?city=${city}`);
        data = response.data;
      } else {
        const response = await axios.get(`/api/shelters`);
        data = response.data;
      }

      const formattedData = data.map((shelter, index) => {
        return {
          key: `shelterID${index + 1}`,
          location: {
            lat: parseFloat(shelter.latitude),
            lng: parseFloat(shelter.longitude),
          },
        };
      }).filter(shelter => shelter.location.lat && shelter.location.lng);

      setLocations(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Custom debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debounceFetchLocations = useCallback(debounce(fetchLocations, 500), []);

  return (
    <div className="all-shelters-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name..."
          value={selectedCity}
          onChange={handleCityChange}
        />
        <button onClick={() => fetchLocations(selectedCity)}>Search</button>
      </div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          className="map-container"
          defaultZoom={13}
          center={mapCenter}
          mapID='e187bd2cd82b5d4f'
          onLoad={mapInstance => setMap(mapInstance)}
          scrollwheel={true}
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>
    </div>
  );
};

export default AllShelters;