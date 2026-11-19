
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiUploadCloud,
    FiImage,
    FiRefreshCw,
    FiChevronDown
} from 'react-icons/fi';
import './Carousel.css';

const CarouselManager = () => {
    const navigate = useNavigate();

    const [carousels, setCarousels] = useState([]);
    const [editingCarousel, setEditingCarousel] = useState(null);

    const [form, setForm] = useState({
        name: ''
    });

    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    const [imageError, setImageError] = useState(false);

    const API_URL = () => `${window.BASE_URL}/api/admin/carousel`;

    const showMessage = (text, type = 'success') => {
        setMessage(text);
        setMessageType(type);
    };

    const getApiKey = () => localStorage.getItem('adminKey');

    // API response helper
    const readResponse = async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                errorText || `Request failed (${response.status})`
            );
        }

        if (response.status === 204) return null;

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            return response.json();
        }

        return null;
    };

    // Load carousels
    const fetchCarousels = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL()}/list`);
            const data = await readResponse(response);

            if (!Array.isArray(data)) {
                throw new Error('Invalid carousel data received from server.');
            }

            setCarousels(data);
            setMessage('');
        } catch (error) {
            console.error('Carousel loading error:', error);
            showMessage(
                error.message || 'Could not load carousels.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Admin access
    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';

        if (!allowed) {
            navigate('/adminpanel', { replace: true });
            return;
        }

        fetchCarousels();
    }, [navigate, fetchCarousels]);

    // Clean up temporary image preview
    useEffect(() => {
        return () => {
            if (previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Image selection
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showMessage('Please select a valid image.', 'error');
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage('Image size must be less than 5 MB.', 'error');
            e.target.value = '';
            return;
        }

        setImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setImageError(false);
        setMessage('');
    };

    const resetForm = () => {
        setForm({ name: '' });
        setImage(null);
        setPreviewImage('');
        setEditingCarousel(null);
        setImageError(false);
        setShowForm(false);

        const fileInput = document.getElementById('carousel-image');
        if (fileInput) fileInput.value = '';
    };

    const openAddForm = () => {
        resetForm();
        setShowForm(true);

        setTimeout(() => {
            document.getElementById('carousel-form')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    // Add / Update carousel
    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = form.name.trim();

        if (!name) {
            showMessage('Carousel name is required.', 'error');
            return;
        }

        if (!editingCarousel && !image) {
            showMessage('Please select a carousel image.', 'error');
            return;
        }

        const apiKey = getApiKey();

        if (!apiKey) {
            showMessage('Admin API key not found. Please log in again.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('Name', name);

        if (image) {
            formData.append('Image', image);
        }

        const url = editingCarousel
            ? `${API_URL()}/update/${editingCarousel.id}`
            : `${API_URL()}/add`;

        setSaving(true);
        setMessage('');

        try {
            const response = await fetch(url, {
                method: editingCarousel ? 'PUT' : 'POST',
                headers: {
                    'X-API-KEY': apiKey
                },
                body: formData
            });

            await readResponse(response);

            const wasEditing = Boolean(editingCarousel);

            resetForm();
            await fetchCarousels();

            showMessage(
                wasEditing
                    ? 'Carousel updated successfully.'
                    : 'Carousel added successfully.'
            );
        } catch (error) {
            console.error('Carousel save error:', error);
            showMessage(
                error.message || 'Could not save carousel.',
                'error'
            );
        } finally {
            setSaving(false);
        }
    };

    // Edit carousel
    const handleEdit = (carousel) => {
        setEditingCarousel(carousel);

        setForm({
            name: carousel.name || ''
        });

        setImage(null);
        setPreviewImage(carousel.imageUrl || '');
        setImageError(false);
        setShowForm(true);
        setMessage('');

        const fileInput = document.getElementById('carousel-image');
        if (fileInput) fileInput.value = '';

        document.getElementById('carousel-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Delete carousel
    const handleDelete = async (carousel) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${carousel.name}"?`
        );

        if (!confirmed) return;

        const apiKey = getApiKey();

        if (!apiKey) {
            showMessage('Admin API key not found. Please log in again.', 'error');
            return;
        }

        setDeletingId(carousel.id);
        setMessage('');

        try {
            const response = await fetch(
                `${API_URL()}/delete/${carousel.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-API-KEY': apiKey
                    }
                }
            );

            await readResponse(response);

            setCarousels(prev =>
                prev.filter(item => item.id !== carousel.id)
            );

            if (editingCarousel?.id === carousel.id) {
                resetForm();
            }

            showMessage('Carousel deleted successfully.');
        } catch (error) {
            console.error('Carousel delete error:', error);
            showMessage(
                error.message || 'Could not delete carousel.',
                'error'
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Search and sorting
    const filteredCarousels = useMemo(() => {
        let result = [...carousels];

        if (search.trim()) {
            const query = search.trim().toLowerCase();

            result = result.filter(carousel =>
                carousel.name?.toLowerCase().includes(query) ||
                String(carousel.id).includes(query)
            );
        }

        if (sortBy === 'name-asc') {
            result.sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
            );
        } else if (sortBy === 'name-desc') {
            result.sort((a, b) =>
                (b.name || '').localeCompare(a.name || '')
            );
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => a.id - b.id);
        } else {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [carousels, search, sortBy]);

    return (
        <div className="carousel-manager">

            {/* HEADER */}
            <div className="carousel-header">
                <div>
                    <span className="carousel-eyebrow">
                        WEBSITE CONTENT
                    </span>

                    <h1>Carousel Manager</h1>

                    <p>
                        Manage the images displayed in your website carousel.
                    </p>
                </div>

                <button
                    className="carousel-add-btn"
                    onClick={openAddForm}
                >
                    <FiPlus />
                    Add Carousel
                </button>
            </div>

            {/* SUMMARY */}
            <div className="carousel-summary">

                <div className="carousel-summary-card">
                    <div className="carousel-summary-icon">
                        <FiImage />
                    </div>

                    <div>
                        <span>Total Carousel Images</span>
                        <strong>{carousels.length}</strong>
                    </div>
                </div>

                <div className="carousel-summary-card">
                    <div className="carousel-summary-icon">
                        <FiSearch />
                    </div>

                    <div>
                        <span>Search Results</span>
                        <strong>{filteredCarousels.length}</strong>
                    </div>
                </div>

            </div>

            {/* FORM */}
            {showForm && (
                <section
                    className="carousel-form-card"
                    id="carousel-form"
                >
                    <div className="carousel-form-heading">
                        <div>
                            <h2>
                                {editingCarousel
                                    ? 'Edit Carousel'
                                    : 'Add New Carousel'}
                            </h2>

                            <p>
                                Add an image and a name for your website carousel.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="carousel-close-btn"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            <FiX />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="carousel-form"
                    >
                        <div className="carousel-field">
                            <label htmlFor="carousel-name">
                                Carousel Name <span>*</span>
                            </label>

                            <input
                                id="carousel-name"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Example: Garden Collection"
                                maxLength={100}
                                required
                            />

                            <small>
                                {form.name.length}/100 characters
                            </small>
                        </div>

                        <div className="carousel-field carousel-image-field">
                            <label>
                                Carousel Image
                                {!editingCarousel && <span> *</span>}
                            </label>

                            <label
                                htmlFor="carousel-image"
                                className="carousel-dropzone"
                            >
                                {previewImage && !imageError ? (
                                    <img
                                        src={previewImage}
                                        alt="Carousel preview"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="carousel-upload-placeholder">
                                        <FiUploadCloud />
                                        <strong>Click to upload an image</strong>
                                        <span>
                                            JPG, PNG or WEBP · Maximum 5 MB
                                        </span>
                                    </div>
                                )}
                            </label>

                            <input
                                id="carousel-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                hidden
                                required={!editingCarousel}
                            />

                            {previewImage && (
                                <button
                                    type="button"
                                    className="carousel-remove-image"
                                    onClick={() => {
                                        setImage(null);
                                        setPreviewImage('');
                                        setImageError(false);

                                        const input = document.getElementById('carousel-image');
                                        if (input) input.value = '';
                                    }}
                                >
                                    <FiX />
                                    Remove image
                                </button>
                            )}
                        </div>

                        <div className="carousel-form-actions">
                            <button
                                type="button"
                                className="carousel-cancel-btn"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="carousel-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Please wait...'
                                    : editingCarousel
                                        ? 'Save Changes'
                                        : 'Add Carousel'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* MESSAGE */}
            {message && (
                <div className={`carousel-alert ${messageType}`}>
                    <span>{message}</span>

                    <button onClick={() => setMessage('')}>
                        <FiX />
                    </button>
                </div>
            )}

            {/* TOOLBAR */}
            <div className="carousel-toolbar">
                <div className="carousel-toolbar-title">
                    <h2>Carousel Images</h2>
                    <span>{filteredCarousels.length} items</span>
                </div>

                <div className="carousel-toolbar-controls">
                    <div className="carousel-search">
                        <FiSearch />

                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search carousel..."
                        />

                        {search && (
                            <button onClick={() => setSearch('')}>
                                <FiX />
                            </button>
                        )}
                    </div>

                    <div className="carousel-sort">
                        <FiChevronDown />

                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                        </select>
                    </div>

                    <button
                        className="carousel-refresh-btn"
                        onClick={fetchCarousels}
                        disabled={loading}
                        title="Refresh"
                    >
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {/* LIST */}
            {loading ? (
                <div className="carousel-empty-state">
                    <FiRefreshCw className="spinning" />
                    <h3>Loading carousel images...</h3>
                    <p>Please wait while the server responds.</p>
                </div>
            ) : filteredCarousels.length > 0 ? (

                <div className="carousel-grid">
                    {filteredCarousels.map(carousel => (
                        <article
                            className="carousel-card"
                            key={carousel.id}
                        >
                            <div className="carousel-card-image">
                                {carousel.imageUrl ? (
                                    <img
                                        src={carousel.imageUrl}
                                        alt={carousel.name || 'Carousel image'}
                                        onError={e => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="carousel-no-image">
                                        <FiImage />
                                        <span>No image</span>
                                    </div>
                                )}

                                <span className="carousel-card-id">
                                    ID: {carousel.id}
                                </span>
                            </div>

                            <div className="carousel-card-content">
                                <div className="carousel-card-title">
                                    <h3>{carousel.name || 'Untitled carousel'}</h3>
                                    <span>Carousel image</span>
                                </div>

                                <div className="carousel-card-actions">
                                    <button
                                        className="carousel-edit-btn"
                                        onClick={() => handleEdit(carousel)}
                                    >
                                        <FiEdit2 />
                                        Edit
                                    </button>

                                    <button
                                        className="carousel-delete-btn"
                                        onClick={() => handleDelete(carousel)}
                                        disabled={deletingId === carousel.id}
                                    >
                                        <FiTrash2 />
                                        {deletingId === carousel.id
                                            ? 'Deleting...'
                                            : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

            ) : (
                <div className="carousel-empty-state">
                    <FiImage />

                    <h3>
                        {search
                            ? 'No matching carousel images'
                            : 'No carousel images found'}
                    </h3>

                    <p>
                        {search
                            ? 'Try another search term.'
                            : 'There are currently no carousel images returned by the server.'}
                    </p>

                    {search ? (
                        <button onClick={() => setSearch('')}>
                            Clear Search
                        </button>
                    ) : (
                        <button onClick={openAddForm}>
                            <FiPlus />
                            Add First Carousel
                        </button>
                    )}
                </div>
            )}

        </div>
    );
};

export default CarouselManager;
