import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [showInput, setShowInput] = useState(false);
    const [query, setQuery] = useState("");

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const res = await fetch(`${window.BASE_URL}/api/product/search?query=${query}`);
            const data = await res.json();
            navigate('/searchlist', { state: { results: data } });
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    return (
        <div className='navbar'>
            <img src='/images/logo.svg' onClick={() => navigate('/')} />
            <div className="right-container">
                <div className="search-container">
                    {showInput && (
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                    )}
                    <FaSearch
                        className="search-icon"
                        onClick={() => {
                            if (showInput && query.trim()) {
                                handleSearch();
                            }
                            setShowInput(!showInput);
                        }}
                    /> </div>
            </div>
        </div>
    );
}

export default Navbar;
