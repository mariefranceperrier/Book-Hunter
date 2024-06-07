import React, { createContext, useContext, useState } from 'react';

const MapCenterContext = createContext();

export const useMapCenter = () => {
  return useContext(MapCenterContext);
};

export const MapCenterProvider = ({ children }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 45.4215, lng: -75.6910 });

  return (
    <MapCenterContext.Provider value={{ mapCenter, setMapCenter }}>
      {children}
    </MapCenterContext.Provider>
  );
};