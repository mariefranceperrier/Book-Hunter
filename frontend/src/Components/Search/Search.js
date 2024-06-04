import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();

  const searchBooks = async (title, author, genre, city) => {
    try {
      const response = await axios.post('/api/search', { title, author, genre, city });
      console.log("Search results:", response.data); // Log the result object
      if (response.data.found) { 
        navigate("/searchresults", { state: { results: response.data.results } });
      } else {
        alert("No results found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const author = e.target.author.value;
    const genre = e.target.genre.value;
    const city = e.target.city.value;
    searchBooks(title, author, genre, city);
  };

  return (
    <main className="search">
      <h1>CATCH ME IF YOU CAN</h1>
      <h2>Hunt a book by typing at least one detail below: </h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" />
        <input type="text" name="author" placeholder="Author" />
        <input type="text" name="genre" placeholder="Genre" />
        <input type="text" name="city" placeholder="City" />
        <button type="submit">Search</button>
      </form>
    </main>
  );
};

export default Search;