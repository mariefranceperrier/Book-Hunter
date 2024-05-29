import React from "react";
import { useLocation, useParams } from "react-router-dom";

const Book = () => {
  const location = useLocation();
  const { results } = location.state;
  const { bookId } = useParams();

  const book = results.find((book) => book.id === Number(bookId));

  return (
    <main className="found-book">
      <button>Gotcha!</button>
      {results.map((result, index) => (
        <div key={index} className="result">
          <h2>Book</h2>
          <p>Title: {result.title}</p>
          <p>Author: {result.author}</p>
          <p>Genre: {result.genre}</p>
        </div>
      ))}
    </main>
  );
}

export default Book;