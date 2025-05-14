import React, { useEffect, useState } from 'react';
import './Product.css';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', description: '', categoryId: '' });
    const [message, setMessage] = useState('');
    const apiKey = localStorage.getItem('adminKey');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        const res = await fetch('https://localhost:7253/api/admin/product/list', {
            headers: { 'X-API-KEY': apiKey }
        });
        const data = await res.json();
        setProducts(data);
    };

    const fetchCategories = async () => {
        const res = await fetch('https://localhost:7253/api/admin/category/list', {
            headers: { 'X-API-KEY': apiKey }
        });
         const data = await res.json();
        setCategories(data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingProduct
            ? `https://localhost:7253/api/admin/product/update/${editingProduct.id}`
            : 'https://localhost:7253/api/admin/product/add';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error('Operation failed');

            setMessage(editingProduct ? 'Product updated' : 'Product added');
            setForm({ name: '', price: '', description: '', categoryId: '' });
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            setMessage('An error occurred');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            price: product.price,
            description: product.description || '',
            categoryId: product.categoryId
        });
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm('Are you sure you want to delete this product?');
        if (!confirm) return;

        try {
            const res = await fetch(`https://localhost:7253/api/admin/product/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-API-KEY': apiKey
                }
            });

            if (!res.ok) throw new Error('Delete failed');
            setMessage('Product deleted');
            fetchProducts();
        } catch (err) {
            setMessage('An error occurred while deleting');
        }
    };

    return (
        <div className="product-manager">
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="product-form">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" required />
                <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <button type="submit">{editingProduct ? 'Update' : 'Add'}</button>
            </form>

            {message && <p className="message">{message}</p>}

            <h3>Product List</h3>
            <ul className="product-list">
                {products.map(p => (
                    <li key={p.id}>
                        <strong>{p.name}</strong>  ${p.price}  
                        <div className='buttons'>
                            <button onClick={() => handleEdit(p)}>Edit</button>
                            <button onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductManager;
