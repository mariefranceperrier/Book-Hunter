import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import Search from './Components/Search/Search';
import SearchResults from './Components/SearchResults/SearchResults';
import AllShelters from './Components/AllShelters/AllShelters';
import AddShelter from './Components/AddShelter/AddShelter';
import AddBook from './Components/AddBook/AddBook';
import Book from './Components/Book/Book';
import ErrorPage from './ErrorPage/ErrorPage';
import ShelterBookList from './Components/ShelterBookList/ShelterBookList';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Search />,
      },
      {
        path: '/searchresults',
        element: <SearchResults />,
      },
      {
        path: '/allshelters',
        element: <AllShelters />,
      },
      {
        path: '/addshelter',
        element: <AddShelter />,
      },
      {
        path: '/addbook',
        element: <AddBook />,
      },
      {
        path: '/books/:bookId',
        element: <Book />,
      },
      {
        path: 'shelter/:id',
        element: <ShelterBookList />,
      }
    ],
  },
  
]);



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

