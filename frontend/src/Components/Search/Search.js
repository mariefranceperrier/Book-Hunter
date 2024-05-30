import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const author = e.target.author.value;
    const genre = e.target.genre.value;
    const city = e.target.city.value;
    console.log(title, author, genre, city);
  
    // need to update server-side to include an endpoint '/search' for searching the database.
    axios
      .post('http://localhost:3000/search', { title, author, genre, city })
      .then((res) => {
        console.log(res)
        if (res.data.found) { 
          navigate("/searchresults", { state: { results: res.data.results } });
        } else {
          alert("No results found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  
  }


  return (
    <main className="search">
      <h1>CATCH ME IF YOU CAN</h1>
      <h2>Hunt a book by typing at least one detail below: </h2>
      <form onSubmit={handleSubmit}>
        <input  type="text" name="title"  placeholder="Title" />
        <input  type="text" name="author" placeholder="Author" />
        <input  type="text" name="genre"  placeholder="Genre" />
        <input  type="text" name="city"   placeholder="City" />
        <button type="submit">Search</button>
      </form>
    </main>
  );
}

export default Search;