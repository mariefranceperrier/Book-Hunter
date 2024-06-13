import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';
// import logo from '../Navigation/assets/bookhunter.png';
import logo from '../Navigation/assets/bookhunter2.png';

const Navigation = () => {
  return (
    <nav className="nav-bar">
      <Link to="/" className="header-link">
        <img src={logo} alt="Book Hunter Logo" className="logo" />
      </Link>
      <section className="nav-links">
        <div className="nav-item"><Link to="/allshelters">Locate a Shelter</Link></div>
        <div className="nav-item"><Link to="/addshelter">Add a Shelter</Link></div>
        <div className="nav-item"><Link to="/addbook">Add a Book</Link></div>
      </section>
    </nav>
  );
}

export default Navigation;
