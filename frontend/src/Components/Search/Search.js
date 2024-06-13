import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import Modal from '../Modal/Modal';

const Search = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const searchBooks = async (title, author, genre, city) => {
    try {
      const response = await axios.post('/api/search', { title, author, genre, city });
      console.log("Search results:", response.data); // Log the result object
      if (response.data.found) { 
        navigate("/searchresults", { state: { 
          title,
          author,
          genre,
          city,
          results: response.data.results 
        } });
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

  const handleBookmarkClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <main className="search">
      <h1>CATCH ME IF YOU CAN</h1>
      <h3>Hunt a book by typing at least one detail below: </h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" />
        <input type="text" name="author" placeholder="Author" />
        <input type="text" name="genre" placeholder="Genre" />
        <input type="text" name="city" placeholder="City" />
        <button className="search-button" type="submit">Search</button>
      </form>
      <button className="bookmark" onClick={handleBookmarkClick}>OUR MISSION</button>
      <Modal className='modal' show={showModal} handleClose={handleCloseModal}>
        <h1>OUR MISSION</h1>
        <p>Book Hunter is a community-driven platform dedicated to connecting book lovers and promoting literacy.</p>
        <p> Our mission is to facilitate book discovery, foster a culture of sharing, and support local book shelters by enabling easy book donations.</p>
        <p>We aim to expand access to books for all through our user-friendly search and donation services.</p>
        <img src="/TakeLeaveBook.jpeg" alt="Take a Book Leave a Book"/>
      </Modal>
    </main>
  );
};

export default Search;