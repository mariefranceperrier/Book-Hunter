import React, { useCallback } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, Marker, useMap } from '@vis.gl/react-google-maps';
import './AllShelters.css';


type Poi ={ key: string, location: google.maps.LatLngLiteral }
const locations: Poi[] = [
  {key: 'operaHouse', location: { lat: -33.8567844, lng: 151.213108  }},
  {key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 }},
  {key: 'manlyBeach', location: { lat: -33.8209738, lng: 151.2563253 }},
  {key: 'hyderPark', location: { lat: -33.8690081, lng: 151.2052393 }},
  {key: 'theRocks', location: { lat: -33.8587568, lng: 151.2058246 }},
  {key: 'circularQuay', location: { lat: -33.858761, lng: 151.2055688 }},
  {key: 'harbourBridge', location: { lat: -33.852228, lng: 151.2038374 }},
  {key: 'kingsCross', location: { lat: -33.8737375, lng: 151.222569 }},
  {key: 'botanicGardens', location: { lat: -33.864167, lng: 151.216387 }},
  {key: 'museumOfSydney', location: { lat: -33.8636005, lng: 151.2092542 }},
  {key: 'maritimeMuseum', location: { lat: -33.869395, lng: 151.198648 }},
  {key: 'kingStreetWharf', location: { lat: -33.8665445, lng: 151.1989808 }},
  {key: 'aquarium', location: { lat: -33.869627, lng: 151.202146 }},
  {key: 'darlingHarbour', location: { lat: -33.87488, lng: 151.1987113 }},
  {key: 'barangaroo', location: { lat: - 33.8605523, lng: 151.1972205 }},
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
    return (
        <div className="all-shelters-container">
            <APIProvider apiKey={'AIzaSyCXU0u5SLoKyUUBnrkFb5Dzg-ie1VjfR_I'} onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    className="map-container"
                    defaultZoom={13}
                    defaultCenter={ { lat: -33.860664, lng: 151.208138 } }
                    mapID='e187bd2cd82b5d4f'
                    onCameraChanged={ (ev: MapCameraChangedEvent) =>
                        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
                }>
                    <PoiMarkers pois={locations} />
                </Map>
            </APIProvider>
        </div>
    );
}

export default AllShelters;