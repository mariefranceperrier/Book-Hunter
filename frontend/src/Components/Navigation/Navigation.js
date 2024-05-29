import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <main className="nav-bar">
      <h1>BOOK HUNTER</h1>
      <ul>
        <li><Link to="/allshelters">Locate A Shelter</Link></li>
        <li><Link to="/allshelters">Add A Shelter</Link></li>
        <li><Link to="/addbook">Add a Book</Link></li>
      </ul>
    </main>
  );
}

export default Navigation;