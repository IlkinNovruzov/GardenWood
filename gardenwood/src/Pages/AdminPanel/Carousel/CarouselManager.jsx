
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carousel.css';


const CarouselManager = () => {
    const API_URL = window.BASE_URL + '/api/admin/carousel';
    const [carousels, setCarousels] = useState([]);
    const [editingCarousel, setEditingCarousel] = useState(null);

    const [form, setForm] = useState({ name: '' });
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const apiKey = localStorage.getItem('adminKey');
    const navigate = useNavigate();

    // Check admin access and load carousels
    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';

        if (!allowed) {
            navigate('/adminpanel');
            return;
        }

        fetchCarousels();
    }, []);

    // Fetch carousels
    const fetchCarousels = async () => {
        try {
            const res = await fetch(`${API_URL}/list`);

            if (!res.ok)
                throw new Error('Failed to fetch carousels');

            const data = await res.json();
            setCarousels(data);

        } catch (err) {
            console.error('API error:', err);
            setMessage('Failed to load carousels');
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
        setEditingCarousel(null);
        setMessage('');

        const fileInput = document.getElementById('carousel-image');
        if (fileInput) fileInput.value = '';
    };

    // Add / Update carousel
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingCarousel && !image) {
            setMessage('Please select a carousel image.');
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

        const url = editingCarousel
            ? `${API_URL}/update/${editingCarousel.id}`
            : `${API_URL}/add`;

        const method = editingCarousel ? 'PUT' : 'POST';

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
                editingCarousel
                    ? 'Carousel updated successfully.'
                    : 'Carousel added successfully.'
            );

            resetForm();
            await fetchCarousels();

        } catch (err) {
            console.error(err);
            setMessage(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Edit carousel
    const handleEdit = (carousel) => {
        if (previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }

        setEditingCarousel(carousel);

        setForm({
            name: carousel.name || ''
        });

        setImage(null);
        setPreviewImage(carousel.imageUrl || '');
        setMessage('');

        const fileInput = document.getElementById('carousel-image');
        if (fileInput) fileInput.value = '';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Delete rousel
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this carousel?'
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

            setCarousels(prev =>
                prev.filter(carousel => carousel.id !== id)
            );

            if (editingrousel?.id === id) {
                resetForm();
            }

            setMessage('Carousel deleted successfully.');

        } catch (err) {
            console.error(err);
            setMessage(err.message || 'Carousel delete failed.');
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
        <div className="carousel-manager">

            <h2>
                {editingCarousel ? 'Edit Carousel' : 'Add Carousel'}
            </h2>

            <form onSubmit={handleSubmit} className="carousel-form">

                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Carousel Name"
                    required
                />

                <div className="carousel-upload">

                    <label htmlFor="carousel-image">
                        {editingCarousel
                            ? 'Change Carousel Image'
                            : 'Select Carousel Image'}
                    </label>

                    <input
                        id="carousel-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        required={!editingCarousel}
                    />

                    {previewImage && (
                        <div className="carousel-preview">
                            <img
                                src={previewImage}
                                alt="Carousel preview"
                            />
                        </div>
                    )}

                </div>

                <div className="carousel-form-buttons">

                    <button type="submit" disabled={loading}>
                        {loading
                            ? 'Please wait...'
                            : editingCarousel
                                ? 'Update Carousel'
                                : 'Add Carousel'}
                    </button>

                    {editingCarousel && (
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
                <p className="carousel-message">{message}</p>
            )}

            <h3>Carousel List ({carousels.length})</h3>

            <div className="carousel-list">

                {carousels.map(carousel => (
                    <div className="carousel-item" key={carousel.id}>

                        <div className="carousel-image-wrapper">
                            <img
                                src={carousel.imageUrl || ''}
                                alt={carousel.name}
                            />
                        </div>

                        <div className="carousel-info">

                            <strong>{carousel.name}</strong>

                            <div className="carousel-meta">
                                <span className="carousel-status">
                                    Active
                                </span>
                            </div>

                        </div>

                        <div className="carousel-buttons">

                            <button onClick={() => handleEdit(carousel)}>
                                Edit
                            </button>

                            <button
                                className="delete-button"
                                onClick={() => handleDelete(carousel.id)}
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                ))}
                {carousels.length === 0 && (
                    <p>No Carousels found.</p>
                )}

            </div>

        </div>
    );
};

export default CarouselManager;
