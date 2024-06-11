import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useLocation } from 'react-router-dom';
import './AllShelters.css';
import { useMapCenter } from '../../MapCenterContext';

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
  const location = useLocation();
  const { mapCenter, setMapCenter } = useMapCenter();
  const [shelters, setShelters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(1);
  const mapRef = useRef(null);

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
      }).filter(shelter => !isNaN(shelter.location.lat) && !isNaN(shelter.location.lng));
      setLocations(formattedData);
      setLoading(false);
    };

    formatShelters();
  }, [shelters]);

  useEffect(() => {
    if (location.state && location.state.center) {
      const center = {
        lat: parseFloat(location.state.center.lat),
        lng: parseFloat(location.state.center.lng),
      };
      if (!isNaN(center.lat) && !isNaN(center.lng)) {
        setMapCenter(center);
      }
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    }
  }, [location.state, setMapCenter]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchLocations(selectedCity);
    }
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
      const cityCoordinates = await fetchCityCoordinates(city);
      if (cityCoordinates) {
        setMapCenter({ lat: cityCoordinates.lat, lng: cityCoordinates.lng });
        setMapKey(prevKey => prevKey + 1);
      }

      const response = await axios.get(city ? `/api/shelters?city=${city}` : '/api/shelters');
      const data = response.data;

      const formattedData = data.map((shelter, index) => {
        return {
          key: `shelterID${index + 1}`,
          location: {
            lat: parseFloat(shelter.latitude),
            lng: parseFloat(shelter.longitude),
          },
        };
      }).filter(shelter => !isNaN(shelter.location.lat) && !isNaN(shelter.location.lng));
      setLocations(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!mapCenter || isNaN(mapCenter.lat) || isNaN(mapCenter.lng)) {
    return <div>Invalid map center coordinates</div>;
  }

  return (
    <div className="all-shelters-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name..."
          value={selectedCity}
          onChange={handleCityChange}
          onKeyPress={handleKeyPress}
        />
        <button onClick={() => fetchLocations(selectedCity)}>Search</button>
      </div>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <Map
          key={mapKey}
          className="map-container"
          defaultZoom={13}
          defaultCenter={mapCenter}
          onLoad={mapInstance => {
            mapRef.current = mapInstance;
          }}
          scrollwheel={true}
          disableDefaultUI={true}
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>

      <video controls autoplay muted>
        <source src="/ShelterAnimation.mov" type="video/quicktime" />
        Your browser does not support the video tag.
      </video>

    </div>
  );
};

export default AllShelters;