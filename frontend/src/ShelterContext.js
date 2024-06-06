// ShelterContext.js
import React, { createContext, useContext, useCallback, useState } from 'react';

const ShelterContext = createContext();

export const ShelterProvider = ({ children }) => {
  const [shelters, setShelters] = useState([]);

  const fetchShelters = useCallback(async () => {
    // Fetch shelters from the API
    // Update the state with the fetched shelters
    try {
      const response = await fetch('/api/shelters');
      const data = await response.json();
      setShelters(data);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  }, []);

  const handleShelterAdded = useCallback(() => {
    fetchShelters();
  }, [fetchShelters]);

  return (
    <ShelterContext.Provider value={{ shelters, handleShelterAdded, fetchShelters }}>
      {children}
    </ShelterContext.Provider>
  );
};

export const useShelters = () => useContext(ShelterContext);
