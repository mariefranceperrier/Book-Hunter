import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import './AllShelters.css';

const initialLocations = [
  { key: 'shelterID1', location: { lat: 45.417618, lng: -75.690423 } },
  { key: 'shelterID2', location: { lat: 45.419681, lng: -75.707810 } },
  { key: 'shelterID3', location: { lat: 45.414213, lng: -75.691292 } },
  { key: 'shelterID4', location: { lat: 45.429051, lng: -75.683213 } },
  { key: 'shelterID5', location: { lat: 45.419278, lng: -75.698435 } },
  { key: 'shelterID6', location: { lat: 45.421932, lng: -75.690798 } },
  { key: 'shelterID7', location: { lat: 45.413896, lng: -75.690289 } },
  { key: 'shelterID8', location: { lat: 45.421532, lng: -75.700152 } },
  { key: 'shelterID9', location: { lat: 45.416947, lng: -75.693188 } },
  { key: 'shelterID10', location: { lat: 45.421079, lng: -75.689988 } },
  { key: 'shelterID11', location: { lat: 45.415152, lng: -75.689988 } },
  { key: 'shelterID12', location: { lat: 45.419992, lng: -75.692132 } },
  { key: 'shelterID13', location: { lat: 45.427648, lng: -75.698113 } },
  { key: 'shelterID14', location: { lat: 45.408759, lng: -75.708283 } },
  { key: 'shelterID15', location: { lat: 45.402571, lng: -75.715343 } },
];

const PoiMarkers = ({ pois }) => {
  const map = useMap();

  const handleClick = useCallback((ev) => {
    if (!map) return;
    if (!ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
  }, [map]);

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
  const [locations, setLocations] = useState(initialLocations);

  const handleMapClick = useCallback((ev) => {
    if (!ev.latLng) return;
    const newLocation = {
      key: `location-${locations.length + 1}`,
      location: { lat: ev.latLng.lat(), lng: ev.latLng.lng() }
    };
    setLocations([...locations, newLocation]);
  }, [locations]);

  return (
    <div className="all-shelters-container">
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          className="map-container"
          defaultZoom={13}
          defaultCenter={{ lat: 45.4215, lng: -75.6910 }}
          mapID='e187bd2cd82b5d4f'
          onClick={handleMapClick}
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>
    </div>
  );
};

export default AllShelters;



