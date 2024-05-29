import React from 'react';
import { useLocation } from 'react-router-dom';

//if we were simply displaying the results, we could use the following code:
//this info will probably serve as inspiration for the Google API pins

const SearchResults = () => {
  const location = useLocation();
  const { results } = location.state;

  return (
    <main className="search-results">
      <h1>Search Results</h1>
      {results.map((result, index) => (
        <div key={index} className="result">
          <h2>Book</h2>
          <p>Title: {result.title}</p>
          <p>Author: {result.author}</p>
          <p>Genre: {result.genre}</p>
          <h3>Shelter</h3>
          <p>City: {result.city}</p>
        </div>
      ))}
    </main>
  );
}

export default SearchResults;