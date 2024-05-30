import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <main className="nav-bar">
      <h1>📚 BOOK HUNTER 📚</h1>
      <section className="nav-links">
        <div className="nav-item"><Link to="/allshelters">Locate a Shelter</Link></div>
        <div className="nav-item"><Link to="/addshelter">Add a Shelter</Link></div>
        <div className="nav-item"><Link to="/addbook">Add a Book</Link></div>
      </section>
    </main>
  );
}

export default Navigation;