import React, { useCallback, useState, useEffect } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, Marker, useMap } from '@vis.gl/react-google-maps';
import './AllShelters.css';


type Poi ={ key: string, location: google.maps.LatLngLiteral }

const initialLocations: Poi[] = [
  {key: 'shelterID1', location: { lat: 45.417618, lng: -75.690423  }},
  {key: 'shelterID12', location: { lat: 45.419681, lng:-75.707810 }},
  {key: 'shelterID13', location: { lat: 45.414213, lng: -75.691292 }},
  {key: 'shelterID4', location: { lat: 45.429051, lng: -75.683213 }},
  {key: 'shelterID5', location: { lat: 45.419278, lng: -75.698435 }},
  {key: 'shelterID6', location: { lat: 45.421932, lng: -75.690798 }},
  {key: 'shelterID7', location: { lat: 45.413896, lng: -75.690289 }},
  {key: 'shelterID8', location: { lat: 45.421532, lng: -75.700152 }},
  {key: 'shelterID9', location: { lat: 45.416947, lng: -75.693188 }},
  {key: 'shelterID10', location: { lat: 45.421079, lng: -75.689988 }},
  {key: 'shelterID11', location: { lat: 45.415152, lng: -75.689988 }},
  {key: 'shelterID12', location: { lat: 45.419992, lng: -75.692132 }},
  {key: 'shelterID13', location: { lat: 45.427648, lng: -75.698113 }},
  {key: 'shelterID14', location: { lat: 45.408759, lng: -75.708283 }},
  {key: 'shelterID15', location: { lat: 45.402571, lng: -75.715343 }},
];


const PoiMarkers = (props: {pois: Poi[]}) => {
  const map = useMap();
  const handleClick = useCallback((ev: google.maps.MapMouseEvent) => {
    if(!map) return;
    if(!ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
  }, [map]);
  
  
  return (
    <>
      {props.pois.map( (poi: Poi) => (
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

const AllShelters = () => {
    const [locations, setLocations] = useState(initialLocations);

    const handleMapClick = useCallback((ev: google.maps.MapMouseEvent) => {
        if (!ev.latLng) return;
        const newLocation: Poi = {
            key: `location-${locations.length}`,
            location: { lat: ev.latLng.lat(), lng: ev.latLng.lng() }
        };
        setLocations([...locations, newLocation]);
    }, [locations]);

    return (
        <div className="all-shelters-container">
            <APIProvider apiKey={'AIzaSyCXU0u5SLoKyUUBnrkFb5Dzg-ie1VjfR_I'} onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    className="map-container"
                    defaultZoom={13}
                    defaultCenter={ { lat: 45.4215, lng: -75.6910 } }
                    mapID='e187bd2cd82b5d4f'
                    onCameraChanged={ (ev: MapCameraChangedEvent) =>
                        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
                    }
                    onClick={handleMapClick}
                >
                    <PoiMarkers pois={locations} />
                </Map>
            </APIProvider>
        </div>
    );
}

export default AllShelters;