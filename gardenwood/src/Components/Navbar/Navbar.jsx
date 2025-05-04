import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [showInput, setShowInput] = useState(false);
    return (
        <div className='navbar'>
            <img src='/images/logo.png' onClick={() => navigate('/')} />
            {/* <div onClick={() => navigate('/')}>Garden Wood</div> */}
            <div className="right-container">
                <div className="search-container">
                    {showInput && (<input type="text" placeholder="Search..." className="search-input" />)}
                    <FaSearch className="search-icon" onClick={() => setShowInput(!showInput)} />
                </div>
                <FaHeart className="heart-icon" onClick={() => navigate('/')} />
            </div>
        </div>
    );
}

export default Navbar;
