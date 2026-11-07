
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Category.css';


const CategoryManager = () => {
    const API_URL = window.BASE_URL + '/api/admin/category';
    const [categories, setCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);

    const [form, setForm] = useState({ name: '' });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const apiKey = localStorage.getItem('adminKey');
    const navigate = useNavigate();

    // Check admin access and load categories
    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';

        if (!allowed) {
            navigate('/adminpanel');
            return;
        }

        fetchCategories();
    }, []);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/list`);

            if (!res.ok)
                throw new Error('Failed to fetch categories');

            const data = await res.json();
            setCategories(data);

        } catch (err) {
            console.error('API error:', err);
            setMessage('Failed to load categories');
        }
    };

    // Handle name change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage('Please select a valid image.');
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('Image size must be less than 5 MB.');
            e.target.value = '';
            return;
        }

        setImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setMessage('');
    };

    // Reset form
    const resetForm = () => {
        if (previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }

        setForm({ name: '' });
        setImage(null);
        setPreviewImage('');
        setEditingCategory(null);
        setMessage('');

        const fileInput = document.getElementById('category-image');
        if (fileInput) fileInput.value = '';
    };

    // Add / Update category
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingCategory && !image) {
            setMessage('Please select a category image.');
            return;
        }

        if (!apiKey) {
            setMessage('Admin API key not found.');
            return;
        }

        const formData = new FormData();

        formData.append('Name', form.name.trim());

        if (image) {
            formData.append('Image', image);
        }

        const url = editingCategory
            ? `${API_URL}/update/${editingCategory.id}`
            : `${API_URL}/add`;

        const method = editingCategory ? 'PUT' : 'POST';

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'X-API-KEY': apiKey
                },
                body: formData
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Operation failed');
            }

            setMessage(
                editingCategory
                    ? 'Category updated successfully.'
                    : 'Category added successfully.'
            );

            resetForm();
            await fetchCategories();

        } catch (err) {
            console.error(err);
            setMessage(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Edit category
    const handleEdit = (category) => {
        if (previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }

        setEditingCategory(category);

        setForm({
            name: category.name || ''
        });

        setImage(null);
        setPreviewImage(category.imageUrl || '');
        setMessage('');

        const fileInput = document.getElementById('category-image');
        if (fileInput) fileInput.value = '';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Delete category
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this category?'
        );

        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API_URL}/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-API-KEY': apiKey
                }
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Delete failed');
            }

            setCategories(prev =>
                prev.filter(category => category.id !== id)
            );

            if (editingCategory?.id === id) {
                resetForm();
            }

            setMessage('Category deleted successfully.');

        } catch (err) {
            console.error(err);
            setMessage(err.message || 'Category delete failed.');
        }
    };

    // Clean up preview URL
    useEffect(() => {
        return () => {
            if (previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    return (
        <div className="category-manager">

            <h2>
                {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="category-form">

                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Category Name"
                    required
                />

                <div className="category-upload">

                    <label htmlFor="category-image">
                        {editingCategory
                            ? 'Change Category Image'
                            : 'Select Category Image'}
                    </label>

                    <input
                        id="category-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        required={!editingCategory}
                    />

                    {previewImage && (
                        <div className="category-preview">
                            <img
                                src={previewImage}
                                alt="Category preview"
                            />
                        </div>
                    )}

                </div>

                <div className="category-form-buttons">

                    <button type="submit" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : editingCategory
                                ? 'Update Category'
                                : 'Add Category'}
                    </button>

                    {editingCategory && (
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={resetForm}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>

            {message && (
                <p className="category-message">{message}</p>
            )}

            <h3>Category List ({categories.length})</h3>

            <div className="category-list">

                {categories.map(category => (
                    <div className="category-item" key={category.id}>

                        <div className="category-image-wrapper">
                            <img
                                src={category.imageUrl || ''}
                                alt={category.name}
                            />
                        </div>

                        <div className="category-info">

                            <strong>{category.name}</strong>

                            <div className="category-meta">
                                <span className="product-count">
                                    <i className="category-dot"></i>
                                    {category.productCount ?? 0} Products
                                </span>

                                <span className="category-status">
                                    Active
                                </span>
                            </div>

                        </div>

                        <div className="category-buttons">

                            <button onClick={() => handleEdit(category)}>
                                Edit
                            </button>

                            <button
                                className="delete-button"
                                onClick={() => handleDelete(category.id)}
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                ))}
                {categories.length === 0 && (
                    <p>No categories found.</p>
                )}

            </div>

        </div>
    );
};

export default CategoryManager;
