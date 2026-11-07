
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Product.css';

const ProductManager = () => {
    const API_URL = window.BASE_URL + '/api/admin';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', description: '', categoryId: '' });

    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deletingImageId, setDeletingImageId] = useState(null);

    const apiKey = localStorage.getItem('adminKey');
    const navigate = useNavigate();

    // API helper
    const apiRequest = async (endpoint, options = {}) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                'X-API-KEY': apiKey
            }
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || `Request failed: ${res.status}`);
        }

        if (res.status === 204) return null;

        const contentType = res.headers.get('content-type');

        return contentType?.includes('application/json')
            ? await res.json()
            : null;
    };

    // Load initial data
    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';

        if (!allowed || !apiKey) {
            navigate('/adminpanel', { replace: true });
            return;
        }

        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productData, categoryData] = await Promise.all([
                apiRequest('/product/list'),
                apiRequest('/category/list', { headers: {} })
            ]);

            setProducts(productData || []);
            setCategories(categoryData || []);

        } catch (err) {
            console.error('Loading error:', err);
            setMessage(err.message);
        }
    };

    // Form change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Image selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);

        const validFiles = files.filter(file =>
            file.type.startsWith('image/') &&
            file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== files.length) {
            setMessage('Only images up to 5 MB are allowed.');
        } else {
            setMessage('');
        }

        setImages(validFiles);

        setPreviewImages(prev => {
            prev
                .filter(img => img.isNew)
                .forEach(img => URL.revokeObjectURL(img.url));

            return validFiles.map((file, index) => ({
                id: `new-${index}`,
                url: URL.createObjectURL(file),
                isNew: true
            }));
        });
    };

    // Reset form
    const resetForm = () => {
        previewImages
            .filter(img => img.isNew)
            .forEach(img => URL.revokeObjectURL(img.url));

         setForm({ name: '', price: '', description: '', categoryId: '' });
        setImages([]);
        setPreviewImages([]);
        setEditingProduct(null);
        setMessage('');

        const input = document.getElementById('product-images');
        if (input) input.value = '';
    };

    // Add / Update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.categoryId || !form.price) {
            setMessage('Please fill in all required fields.');
            return;
        }

        if (!editingProduct && images.length === 0) {
            setMessage('Please add at least one image.');
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            formData.append(
                key.charAt(0).toUpperCase() + key.slice(1),
                value
            );
        });

        images.forEach(file => {
            formData.append('Images', file);
        });

        const endpoint = editingProduct
            ? `/product/update/${editingProduct.id}`
            : '/product/add';

        setLoading(true);
        setMessage('');

        try {
            await apiRequest(endpoint, {
                method: editingProduct ? 'PUT' : 'POST',
                body: formData
            });

            setMessage(
                editingProduct
                    ? 'Product updated successfully.'
                    : 'Product added successfully.'
            );

            resetForm();
            await fetchProducts();

        } catch (err) {
            console.error('Submit error:', err);
            setMessage(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products
    const fetchProducts = async () => {
        const data = await apiRequest('/product/list');
        setProducts(data || []);
    };

    // Edit
    const handleEdit = (product) => {
        previewImages
            .filter(img => img.isNew)
            .forEach(img => URL.revokeObjectURL(img.url));

        setEditingProduct(product);

        setForm({
            name: product.name || '',
            price: product.price ?? '',
            description: product.description || '',
            categoryId: String(product.categoryId || '')
        });

        setImages([]);

        setPreviewImages(
            (product.images || []).map(img => ({
                id: img.id,
                url: img.imageUrl,
                isNew: false
            }))
        );

        setMessage('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Delete individual image
    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Delete this image?')) return;

        setDeletingImageId(imageId);

        try {
            await apiRequest(`/product/delete/image/${imageId}`, {
                method: 'DELETE'
            });

            setPreviewImages(prev =>
                prev.filter(img => img.id !== imageId)
            );

            setEditingProduct(prev => prev ? ({
                ...prev,
                images: prev.images.filter(img => img.id !== imageId)
            }) : null);

            setMessage('Image deleted successfully.');

        } catch (err) {
            setMessage(err.message || 'Image delete failed.');
        } finally {
            setDeletingImageId(null);
        }
    };

    // Delete product
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;

        setDeletingId(id);

        try {
            await apiRequest(`/product/delete/${id}`, {
                method: 'DELETE'
            });

            setProducts(prev => prev.filter(p => p.id !== id));

            if (editingProduct?.id === id) {
                resetForm();
            }

            setMessage('Product deleted successfully.');

        } catch (err) {
            setMessage(err.message || 'Product delete failed.');
        } finally {
            setDeletingId(null);
        }
    };

    // Cleanup temporary preview URLs
    useEffect(() => {
        return () => {
            previewImages
                .filter(img => img.isNew)
                .forEach(img => URL.revokeObjectURL(img.url));
        };
    }, [previewImages]);

    return (
        <div className="product-manager">

            <h2>
                {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>

            <form onSubmit={handleSubmit} className="product-form">

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                />

                <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                />

                <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                />

                <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Category</option>

                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <input
                    id="product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    required={!editingProduct}
                />

                <div className="preview-images">

                    {previewImages.map((img, index) => (
                        <div key={img.id} className="image-preview-item">

                            <img
                                src={img.url}
                                alt={`Product ${index + 1}`}
                            />

                            {!img.isNew && (
                                <button
                                    type="button"
                                    className="close-button"
                                    disabled={deletingImageId === img.id}
                                    onClick={() => handleDeleteImage(img.id)}
                                >
                                    {deletingImageId === img.id ? '...' : '×'}
                                </button>
                            )}

                        </div>
                    ))}

                </div>

                <button type="submit" disabled={loading}>
                    {loading
                        ? 'Please wait...'
                        : editingProduct ? 'Update' : 'Add'}
                </button>

                {editingProduct && (
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}

            </form>

            {message && (
                <p className="message">{message}</p>
            )}

            <h3>Product List ({products.length})</h3>

            <ul className="product-list">

                {products.map(product => (
                    <li key={product.id}>

                        <img
                            src={product.images?.[0]?.imageUrl || ''}
                            alt={product.name}
                        />

                        <strong>{product.name}</strong>

                        <span>${product.price}</span>

                        <div className="buttons">

                            <button
                                onClick={() => handleEdit(product)}
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                            >
                                {deletingId === product.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </button>

                        </div>

                    </li>
                ))}

            </ul>

        </div>
    );
};

export default ProductManager;
