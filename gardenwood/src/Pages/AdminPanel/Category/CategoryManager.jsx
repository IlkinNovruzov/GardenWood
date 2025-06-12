import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Category.css';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const apiKey = localStorage.getItem('adminKey');

    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';
        if (!allowed) {
            navigate('/adminpanel'); 
        }
        fetchCategories();
    }, []);
    
    const fetchCategories = async () => {
        try {
            const res = await fetch('http://gardenwoodasp-001-site1.ltempurl.com/api/admin/category/list', {
                headers: { 'X-API-KEY': apiKey }
            });
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            setMessage("Failed to fetch categories.");
        }
    };


    const handleAdd = async () => {
        if (!name) return;
        try {
            const res = await fetch('https://gardenwoodasp-001-site1.ltempurl.com/api/admin/category/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey
                },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            setMessage(data.message);
            setName('');
            fetchCategories();
        } catch {
            setMessage("Failed to add category.");
        }
    };

    const handleEdit = async () => {
        if (!name) return;
        try {
            const res = await fetch(`http://gardenwoodasp-001-site1.ltempurl.com/api/admin/category/update/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey
                },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            setMessage(data.message);
            setEditingId(null);
            setName('');
            fetchCategories();
        } catch {
            setMessage("Failed to update category.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await fetch(`http://gardenwoodasp-001-site1.ltempurl.com/api/admin/category/delete/${id}`, {
                method: 'DELETE',
                headers: { 'X-API-KEY': apiKey }
            });
            const data = await res.json();
            setMessage(data.message);
            fetchCategories();
        } catch {
            setMessage("Failed to delete category.");
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setName(cat.name);
    };

    return (
        <div className="category-container">
            <h2>Category Manager</h2>
            <div className="category-form">
                <input
                    type="text"
                    placeholder="Category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button onClick={editingId ? handleEdit : handleAdd}>
                    {editingId ? "Update" : "Add"}
                </button>
            </div>
            {message && <p className="category-message">{message}</p>}
            <ul className="category-list">
                {categories.map((cat) => (
                    <li key={cat.id}>
                        {cat.name}
                        <div>
                            <button onClick={() => startEdit(cat)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(cat.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryManager;
