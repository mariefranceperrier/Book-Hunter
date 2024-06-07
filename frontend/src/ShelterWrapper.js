import React from 'react';
import { MapCenterProvider } from './MapCenterContext';
import { Outlet } from 'react-router-dom';

const ShelterWrapper = () => {
  return (
    <MapCenterProvider>
      <Outlet />
    </MapCenterProvider>
  );
};

export default ShelterWrapper;

