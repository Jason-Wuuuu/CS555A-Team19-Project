import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUpPage from './components/SignUpPage';
import EventDetail from './components/EventDetail';
import EventOfDate from './components/EventOfDate';
import Header from './components/Header';
import Home from './components/Home';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import { useState } from "react";
import { Navigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      setUser(user);
    } else {
      setUser(null);
    }
  });
  return (
    <Router>   
     <div className="App">
      <Header/>
      <div className='App-body'>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route
              path="/login"
              element={user ? <Navigate to={"/"} /> : <Login />}
            />
          <Route path='/events/:id' element={<EventDetail />} />
          <Route path='/events/date' element={<EventOfDate />} />
          <Route
              path="/register"
              element={user ? <Navigate to={"/"} /> : <SignUpPage />}
            />
        </Routes>
       </div>
       <footer className='App-footer'></footer>
      </div>
    </Router>
  );
}

export default App;
