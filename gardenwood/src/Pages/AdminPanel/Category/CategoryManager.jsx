
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiUploadCloud,
    FiGrid,
    FiPackage,
    FiCheckCircle,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';
import './Category.css';

// Backend hazır olana qədər demo rejimi aktivdir.
const USE_DEMO_DATA = false;

const STORAGE_KEY = 'gardenwood_demo_categories';
const PRODUCTS_KEY = 'gardenwood_demo_products';

const initialCategories = [
    {
        id: 1,
        name: 'Garden Furniture Sets',
        imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900',
        isActive: true,
        createdAt: '2026-10-15T10:00:00.000Z'
    },
    {
        id: 2,
        name: 'Garden Sofas',
        imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900',
        isActive: true,
        createdAt: '2026-10-18T10:00:00.000Z'
    },
    {
        id: 3,
        name: 'Garden Chairs',
        imageUrl: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=900',
        isActive: true,
        createdAt: '2026-10-20T10:00:00.000Z'
    },
    {
        id: 4,
        name: 'Garden Tables',
        imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900',
        isActive: false,
        createdAt: '2026-10-22T10:00:00.000Z'
    },
    {
        id: 5,
        name: 'Sun Loungers',
        imageUrl: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=900',
        isActive: true,
        createdAt: '2026-10-25T10:00:00.000Z'
    },
    {
        id: 6,
        name: 'Garden Benches',
        imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900',
        isActive: true,
        createdAt: '2026-10-28T10:00:00.000Z'
    }
];

const readStorage = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const saveStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Image could not be read.'));

        reader.readAsDataURL(file);
    });
};

const CategoryManager = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [editingCategory, setEditingCategory] = useState(null);

    const [form, setForm] = useState({
        name: '',
        description: ''
    });

    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const [showForm, setShowForm] = useState(false);

    // Admin access
    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';

        if (!allowed) {
            navigate('/adminpanel', { replace: true });
            return;
        }

        if (USE_DEMO_DATA) {
            let storedCategories = readStorage(STORAGE_KEY, null);

            if (!storedCategories) {
                storedCategories = initialCategories;
                saveStorage(STORAGE_KEY, storedCategories);
            }

            setCategories(storedCategories);
            setProducts(readStorage(PRODUCTS_KEY, []));
        } else {
            loadCategories();
        }
    }, []);

    // Demo data persistence
    useEffect(() => {
        if (USE_DEMO_DATA && categories.length >= 0) {
            saveStorage(STORAGE_KEY, categories);
        }
    }, [categories]);

    // API integration will be activated after backend is ready.
    const loadCategories = async () => {
        try {
            setLoading(true);

            const baseUrl = window.BASE_URL;
            const apiKey = localStorage.getItem('adminKey');

            const response = await fetch(
                `${baseUrl}/api/admin/category/list`,
                {
                    headers: {
                        'X-API-KEY': apiKey
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Categories could not be loaded.');
            }

            const data = await response.json();
            setCategories(data || []);
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage(text);
        setMessageType(type);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Image upload
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showMessage('Please select a valid image.', 'error');
            e.target.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showMessage('Image size must be less than 2 MB in demo mode.', 'error');
            e.target.value = '';
            return;
        }

        try {
            setImage(file);
            setImageError(false);

            const dataUrl = await readFileAsDataUrl(file);
            setPreviewImage(dataUrl);

            setMessage('');
        } catch {
            showMessage('Image could not be loaded.', 'error');
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: ''
        });

        setImage(null);
        setPreviewImage('');
        setEditingCategory(null);
        setImageError(false);
        setShowForm(false);

        const input = document.getElementById('category-image');
        if (input) input.value = '';
    };

    const openAddForm = () => {
        resetForm();
        setShowForm(true);

        setTimeout(() => {
            document.getElementById('category-form')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    // Add / Update
    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = form.name.trim();

        if (!name) {
            showMessage('Category name is required.', 'error');
            return;
        }

        if (!editingCategory && !previewImage) {
            showMessage('Please select a category image.', 'error');
            return;
        }

        const duplicate = categories.some(category =>
            category.name?.trim().toLowerCase() === name.toLowerCase() &&
            category.id !== editingCategory?.id
        );

        if (duplicate) {
            showMessage('A category with this name already exists.', 'error');
            return;
        }

        setLoading(true);

        try {
            if (USE_DEMO_DATA) {
                const categoryData = {
                    id: editingCategory?.id || Date.now(),
                    name,
                    description: form.description.trim(),
                    imageUrl: previewImage || editingCategory?.imageUrl || '',
                    isActive: editingCategory?.isActive ?? true,
                    createdAt: editingCategory?.createdAt || new Date().toISOString()
                };

                if (editingCategory) {
                    setCategories(prev =>
                        prev.map(category =>
                            category.id === editingCategory.id
                                ? categoryData
                                : category
                        )
                    );

                    showMessage('Category updated successfully.');
                } else {
                    setCategories(prev => [categoryData, ...prev]);
                    showMessage('Category added successfully.');
                }

                resetForm();
                return;
            }

            // Future backend integration
            const baseUrl = window.BASE_URL;
            const apiKey = localStorage.getItem('adminKey');

            const formData = new FormData();
            formData.append('Name', name);
            formData.append('Description', form.description.trim());

            if (image) {
                formData.append('Image', image);
            }

            const url = editingCategory
                ? `${baseUrl}/api/admin/category/update/${editingCategory.id}`
                : `${baseUrl}/api/admin/category/add`;

            const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: {
                    'X-API-KEY': apiKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Operation failed.');
            }

            await loadCategories();
            resetForm();

            showMessage(
                editingCategory
                    ? 'Category updated successfully.'
                    : 'Category added successfully.'
            );
        } catch (error) {
            showMessage(error.message || 'An error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Edit
    const handleEdit = (category) => {
        setEditingCategory(category);

        setForm({
            name: category.name || '',
            description: category.description || ''
        });

        setImage(null);
        setPreviewImage(category.imageUrl || '');
        setImageError(false);
        setShowForm(true);
        setMessage('');

        const input = document.getElementById('category-image');
        if (input) input.value = '';

        document.getElementById('category-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Delete
    const handleDelete = async (category) => {
        const relatedProducts = products.filter(product =>
            String(product.categoryId) === String(category.id)
        );

        const confirmation = window.confirm(
            relatedProducts.length > 0
                ? `"${category.name}" has ${relatedProducts.length} related demo product(s). Delete this category anyway?`
                : `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmation) return;

        try {
            if (USE_DEMO_DATA) {
                setCategories(prev =>
                    prev.filter(item => item.id !== category.id)
                );

                if (editingCategory?.id === category.id) {
                    resetForm();
                }

                showMessage('Category deleted successfully.');
                return;
            }

            const baseUrl = window.BASE_URL;
            const apiKey = localStorage.getItem('adminKey');

            const response = await fetch(
                `${baseUrl}/api/admin/category/delete/${category.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-API-KEY': apiKey
                    }
                }
            );

            if (!response.ok) {
                throw new Error(await response.text() || 'Delete failed.');
            }

            await loadCategories();
            showMessage('Category deleted successfully.');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Active / inactive
    const toggleStatus = (category) => {
        if (!USE_DEMO_DATA) {
            showMessage('Status management will be connected to the backend later.', 'error');
            return;
        }

        setCategories(prev =>
            prev.map(item =>
                item.id === category.id
                    ? { ...item, isActive: !item.isActive }
                    : item
            )
        );

        showMessage(
            category.isActive
                ? 'Category deactivated.'
                : 'Category activated.'
        );
    };

    // Product count per category
    const getProductCount = (category) => {
        return products.filter(product => {
            if (product.categoryId !== undefined && product.categoryId !== null) {
                return String(product.categoryId) === String(category.id);
            }

            return product.category?.toLowerCase() === category.name?.toLowerCase();
        }).length;
    };

    // Stats
    const stats = useMemo(() => ({
        total: categories.length,
        active: categories.filter(item => item.isActive !== false).length,
        inactive: categories.filter(item => item.isActive === false).length,
        products: products.length
    }), [categories, products]);

    // Search / filters / sorting
    const filteredCategories = useMemo(() => {
        let result = [...categories];

        if (search.trim()) {
            const query = search.toLowerCase();

            result = result.filter(category =>
                category.name?.toLowerCase().includes(query) ||
                category.description?.toLowerCase().includes(query) ||
                String(category.id).includes(query)
            );
        }

        if (statusFilter === 'active') {
            result = result.filter(category => category.isActive !== false);
        }

        if (statusFilter === 'inactive') {
            result = result.filter(category => category.isActive === false);
        }

        if (sortBy === 'name-asc') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name-desc') {
            result.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [categories, search, statusFilter, sortBy]);

    return (
        <div className="category-manager">

            {/* HEADER */}
            <div className="category-header">
                <div>
                    <span className="category-eyebrow">CATALOG MANAGEMENT</span>
                    <h1>Category Manager</h1>
                    <p>Organize and manage your Garden Wood product categories.</p>
                </div>

                <button className="category-add-btn" onClick={openAddForm}>
                    <FiPlus />
                    Add Category
                </button>
            </div>

            {/* STATS */}
            <div className="category-stats">

                <div className="category-stat-card">
                    <div className="category-stat-icon">
                        <FiGrid />
                    </div>
                    <div>
                        <span>Total Categories</span>
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon active">
                        <FiCheckCircle />
                    </div>
                    <div>
                        <span>Active Categories</span>
                        <strong>{stats.active}</strong>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon inactive">
                        <FiEyeOff />
                    </div>
                    <div>
                        <span>Inactive Categories</span>
                        <strong>{stats.inactive}</strong>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon products">
                        <FiPackage />
                    </div>
                    <div>
                        <span>Total Products</span>
                        <strong>{stats.products}</strong>
                    </div>
                </div>

            </div>

            {/* FORM */}
            {showForm && (
                <section className="category-form-card" id="category-form">

                    <div className="category-form-heading">
                        <div>
                            <h2>
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            <p>
                                {editingCategory
                                    ? 'Update the category information.'
                                    : 'Add a new category to your product catalog.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="category-close-btn"
                            onClick={resetForm}
                            disabled={loading}
                        >
                            <FiX />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="category-form">

                        <div className="category-form-fields">

                            <div className="category-field">
                                <label htmlFor="category-name">
                                    Category Name <span>*</span>
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Example: Garden Furniture Sets"
                                    maxLength={80}
                                    required
                                />

                                <small>{form.name.length}/80 characters</small>
                            </div>

                            <div className="category-field">
                                <label htmlFor="category-description">
                                    Description
                                </label>

                                <textarea
                                    id="category-description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Write a short category description..."
                                    rows={4}
                                    maxLength={300}
                                />

                                <small>{form.description.length}/300 characters</small>
                            </div>

                        </div>

                        <div className="category-field category-image-field">
                            <label>Category Image <span>*</span></label>

                            <label htmlFor="category-image" className="category-dropzone">
                                {previewImage && !imageError ? (
                                    <img
                                        src={previewImage}
                                        alt="Category preview"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="category-upload-placeholder">
                                        <FiUploadCloud />
                                        <strong>Click to upload an image</strong>
                                        <span>JPG, PNG or WEBP · Max 2 MB in demo mode</span>
                                    </div>
                                )}
                            </label>

                            <input
                                id="category-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                hidden
                            />

                            {previewImage && (
                                <button
                                    type="button"
                                    className="category-remove-image"
                                    onClick={() => {
                                        setImage(null);
                                        setPreviewImage('');
                                        setImageError(false);

                                        const input = document.getElementById('category-image');
                                        if (input) input.value = '';
                                    }}
                                >
                                    <FiX /> Remove image
                                </button>
                            )}
                        </div>

                        <div className="category-form-actions">
                            <button
                                type="button"
                                className="category-cancel-btn"
                                onClick={resetForm}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="category-save-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Please wait...'
                                    : editingCategory
                                        ? 'Save Changes'
                                        : 'Create Category'}
                            </button>
                        </div>

                    </form>
                </section>
            )}

            {/* MESSAGE */}
            {message && (
                <div className={`category-alert ${messageType}`}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')}>
                        <FiX />
                    </button>
                </div>
            )}

            {/* TOOLBAR */}
            <div className="category-toolbar">

                <div className="category-toolbar-title">
                    <h2>All Categories</h2>
                    <span>{filteredCategories.length} results</span>
                </div>

                <div className="category-toolbar-controls">

                    <div className="category-search">
                        <FiSearch />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search categories..."
                        />
                        {search && (
                            <button onClick={() => setSearch('')}>
                                <FiX />
                            </button>
                        )}
                    </div>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

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
            </div>

            {/* CATEGORY GRID */}
            {loading && categories.length === 0 ? (
                <div className="category-empty-state">
                    Loading categories...
                </div>
            ) : filteredCategories.length > 0 ? (

                <div className="category-grid">

                    {filteredCategories.map(category => (
                        <article className="category-card" key={category.id}>

                            <div className="category-card-image">
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    onError={e => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />

                                <span className={`category-status ${category.isActive === false ? 'inactive' : 'active'}`}>
                                    {category.isActive === false ? 'Inactive' : 'Active'}
                                </span>

                                <span className="category-id">
                                    ID: {category.id}
                                </span>
                            </div>

                            <div className="category-card-content">

                                <div className="category-card-title">
                                    <h3>{category.name}</h3>
                                    <p>
                                        {category.description || 'No description added.'}
                                    </p>
                                </div>

                                <div className="category-card-meta">
                                    <span>
                                        <FiPackage />
                                        {getProductCount(category)} Products
                                    </span>

                                    <span>
                                        {category.createdAt
                                            ? new Date(category.createdAt).toLocaleDateString()
                                            : 'Recently added'}
                                    </span>
                                </div>

                                <div className="category-card-actions">

                                    <button
                                        className="category-edit-btn"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <FiEdit2 /> Edit
                                    </button>

                                    <button
                                        className="category-toggle-btn"
                                        onClick={() => toggleStatus(category)}
                                        title={category.isActive === false ? 'Activate' : 'Deactivate'}
                                    >
                                        {category.isActive === false
                                            ? <><FiEye /> Activate</>
                                            : <><FiEyeOff /> Deactivate</>}
                                    </button>

                                    <button
                                        className="category-delete-btn"
                                        onClick={() => handleDelete(category)}
                                        title="Delete category"
                                    >
                                        <FiTrash2 />
                                    </button>

                                </div>

                            </div>

                        </article>
                    ))}

                </div>

            ) : (

                <div className="category-empty-state">
                    <FiGrid />
                    <h3>No categories found</h3>
                    <p>
                        {search || statusFilter !== 'all'
                            ? 'Try changing your search or filters.'
                            : 'Create your first category to get started.'}
                    </p>

                    {search || statusFilter !== 'all' ? (
                        <button
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('all');
                            }}
                        >
                            Clear Filters
                        </button>
                    ) : (
                        <button onClick={openAddForm}>
                            <FiPlus /> Add Category
                        </button>
                    )}
                </div>

            )}

        </div>
    );
};

export default CategoryManager;
