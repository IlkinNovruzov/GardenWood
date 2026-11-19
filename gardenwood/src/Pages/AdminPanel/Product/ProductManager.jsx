import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Product.css';

// Backend hazır olana qədər true saxla.
// Backend inteqrasiyasına keçəndə false edəcəyik.
const USE_DEMO_DATA = false;

const STORAGE_KEYS = {
    products: 'gardenwood_demo_products',
    categories: 'gardenwood_demo_categories'
};

const demoCategories = [
    { id: 1, name: 'Garden Sofa Sets' },
    { id: 2, name: 'Garden Chairs' },
    { id: 3, name: 'Garden Tables' },
    { id: 4, name: 'Sun Loungers' }
];

const demoProducts = [
    {
        id: 101,
        name: 'Premium Garden Sofa Set',
        price: 1890,
        description: 'Modern outdoor sofa set with comfortable cushions.',
        categoryId: 1,
        images: [
            {
                id: 1001,
                imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700'
            }
        ],
        isActive: true,
        isFeatured: true,
        createdAt: '2026-11-12'
    },
    {
        id: 102,
        name: 'Wooden Garden Chair',
        price: 390,
        description: 'Elegant wooden chair for outdoor spaces.',
        categoryId: 2,
        images: [
            {
                id: 1002,
                imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700'
            }
        ],
        isActive: true,
        isFeatured: false,
        createdAt: '2026-11-10'
    },
    {
        id: 103,
        name: 'Modern Dining Table',
        price: 790,
        description: 'Minimal design dining table for garden use.',
        categoryId: 3,
        images: [
            {
                id: 1003,
                imageUrl: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=700'
            }
        ],
        isActive: false,
        isFeatured: false,
        createdAt: '2026-11-08'
    },
    {
        id: 104,
        name: 'Outdoor Sun Lounger',
        price: 650,
        description: 'Comfortable lounger for terraces and gardens.',
        categoryId: 4,
        images: [
            {
                id: 1004,
                imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700'
            }
        ],
        isActive: true,
        isFeatured: true,
        createdAt: '2026-11-05'
    }
];

const emptyForm = {
    name: '',
    price: '',
    description: '',
    categoryId: ''
};

const readDemoData = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('az-AZ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(Number(price) || 0) + ' ₼';
};

const ProductManager = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [products, setProducts] = useState(() =>
        USE_DEMO_DATA
            ? readDemoData(STORAGE_KEYS.products, demoProducts)
            : []
    );

    const [categories, setCategories] = useState(() =>
        USE_DEMO_DATA
            ? readDemoData(STORAGE_KEYS.categories, demoCategories)
            : []
    );

    const [form, setForm] = useState(emptyForm);
    const [editingProduct, setEditingProduct] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deletingImageId, setDeletingImageId] = useState(null);

    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('success');

    const apiKey = localStorage.getItem('adminKey');

    // API URL-ni sorğu anında oxuyuruq.
    const apiRequest = useCallback(async (endpoint, options = {}) => {
        const baseUrl = window.BASE_URL;

        if (!baseUrl) {
            throw new Error('API URL tapılmadı. BASE_URL konfiqurasiyasını yoxla.');
        }

        const response = await fetch(`${baseUrl}/api/admin${endpoint}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(apiKey ? { 'X-API-KEY': apiKey } : {})
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Sorğu uğursuz oldu: ${response.status}`);
        }

        if (response.status === 204) return null;

        const contentType = response.headers.get('content-type');

        return contentType?.includes('application/json')
            ? response.json()
            : null;
    }, [apiKey]);

    const showMessage = (text, type = 'success') => {
        setMessage(text);
        setMessageType(type);
    };

    // Demo məlumatlarını yadda saxla.
    useEffect(() => {
        if (!USE_DEMO_DATA) return;

        localStorage.setItem(
            STORAGE_KEYS.products,
            JSON.stringify(products)
        );
    }, [products]);

    useEffect(() => {
        if (!USE_DEMO_DATA) return;

        localStorage.setItem(
            STORAGE_KEYS.categories,
            JSON.stringify(categories)
        );
    }, [categories]);

    // Admin icazəsini yoxla və məlumatları yüklə.
    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';

        if (!allowed || !apiKey) {
            navigate('/adminpanel', { replace: true });
            return;
        }

        if (!USE_DEMO_DATA) {
            loadData();
        }
    }, []);

    const loadData = async () => {
        setLoading(true);

        try {
            const [productData, categoryData] = await Promise.all([
                apiRequest('/product/list'),
                apiRequest('/category/list')
            ]);

            setProducts(Array.isArray(productData) ? productData : []);
            setCategories(Array.isArray(categoryData) ? categoryData : []);
        } catch (error) {
            console.error('Product manager load error:', error);
            showMessage(
                'Məhsulları yükləmək mümkün olmadı: ' + error.message,
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // Kateqoriya adını ID əsasında tap.
    const getCategoryName = (categoryId) => {
        return categories.find(
            category => String(category.id) === String(categoryId)
        )?.name || 'Kateqoriyasız';
    };

    // Məhsul siyahısının filtrlənməsi və sıralanması.
    const filteredProducts = useMemo(() => {
        let result = [...products];

        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (normalizedSearch) {
            result = result.filter(product =>
                product.name?.toLowerCase().includes(normalizedSearch) ||
                product.description?.toLowerCase().includes(normalizedSearch) ||
                String(product.id).includes(normalizedSearch)
            );
        }

        if (categoryFilter !== 'all') {
            result = result.filter(
                product => String(product.categoryId) === categoryFilter
            );
        }

        if (statusFilter === 'active') {
            result = result.filter(product => product.isActive !== false);
        } else if (statusFilter === 'inactive') {
            result = result.filter(product => product.isActive === false);
        } else if (statusFilter === 'featured') {
            result = result.filter(product => product.isFeatured === true);
        }

        switch (sortBy) {
            case 'oldest':
                result.reverse();
                break;
            case 'price-low':
                result.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'price-high':
                result.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case 'name':
                result.sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '')
                );
                break;
            case 'newest':
            default:
                result.sort((a, b) => Number(b.id) - Number(a.id));
                break;
        }

        return result;
    }, [
        products,
        searchTerm,
        categoryFilter,
        statusFilter,
        sortBy
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / pageSize)
    );

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, statusFilter, sortBy, pageSize]);

    const activeCount = products.filter(
        product => product.isActive !== false
    ).length;

    const featuredCount = products.filter(
        product => product.isFeatured
    ).length;

    const totalValue = products.reduce(
        (sum, product) => sum + (Number(product.price) || 0),
        0
    );

    // Form dəyişiklikləri.
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // Şəkil seçimi.
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);

        const validFiles = files.filter(file =>
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
            file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== files.length) {
            showMessage(
                'Yalnız JPG, PNG və WEBP formatında, maksimum 5 MB şəkillər qəbul olunur.',
                'error'
            );
        }

        const newPreviews = validFiles.map((file, index) => ({
            id: `new-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            isNew: true,
            file
        }));

        setSelectedFiles(previous => [...previous, ...validFiles]);
        setPreviewImages(previous => [...previous, ...newPreviews]);

        event.target.value = '';
    };

    const removePreview = (image) => {
        if (image.isNew) {
            URL.revokeObjectURL(image.url);

            setSelectedFiles(previous =>
                previous.filter(file => file !== image.file)
            );
        }

        setPreviewImages(previous =>
            previous.filter(item => item.id !== image.id)
        );
    };

    // Formu təmizlə.
    const resetForm = () => {
        previewImages
            .filter(image => image.isNew)
            .forEach(image => URL.revokeObjectURL(image.url));

        setForm(emptyForm);
        setEditingProduct(null);
        setSelectedFiles([]);
        setPreviewImages([]);
        setShowForm(false);
        setMessage(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Yeni məhsul formunu aç.
    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Məhsul əlavə et / redaktə et.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            showMessage('Məhsulun adını daxil et.', 'error');
            return;
        }

        if (!form.categoryId) {
            showMessage('Kateqoriya seçilməlidir.', 'error');
            return;
        }

        if (form.price === '' || Number(form.price) < 0) {
            showMessage('Düzgün qiymət daxil et.', 'error');
            return;
        }

        if (!editingProduct && selectedFiles.length === 0) {
            showMessage('Ən azı bir məhsul şəkli əlavə et.', 'error');
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            if (USE_DEMO_DATA) {
                const existingImages = previewImages
                    .filter(image => !image.isNew)
                    .map(image => ({
                        id: image.id,
                        imageUrl: image.url
                    }));

                const newImages = previewImages
                    .filter(image => image.isNew)
                    .map((image, index) => ({
                        id: Date.now() + index,
                        imageUrl: image.url
                    }));

                const productData = {
                    id: editingProduct?.id || Date.now(),
                    name: form.name.trim(),
                    price: Number(form.price),
                    description: form.description.trim(),
                    categoryId: Number(form.categoryId),
                    images: [...existingImages, ...newImages],
                    isActive: editingProduct?.isActive ?? true,
                    isFeatured: editingProduct?.isFeatured ?? false,
                    createdAt: editingProduct?.createdAt || new Date().toISOString()
                };

                if (editingProduct) {
                    setProducts(previous =>
                        previous.map(product =>
                            product.id === editingProduct.id
                                ? productData
                                : product
                        )
                    );
                } else {
                    setProducts(previous => [productData, ...previous]);
                }
            } else {
                const formData = new FormData();

                Object.entries(form).forEach(([key, value]) => {
                    const backendKey =
                        key.charAt(0).toUpperCase() + key.slice(1);

                    formData.append(backendKey, value);
                });

                selectedFiles.forEach(file => {
                    formData.append('Images', file);
                });

                const endpoint = editingProduct
                    ? `/product/update/${editingProduct.id}`
                    : '/product/add';

                await apiRequest(endpoint, {
                    method: editingProduct ? 'PUT' : 'POST',
                    body: formData
                });

                await loadData();
            }

            showMessage(
                editingProduct
                    ? 'Məhsul uğurla yeniləndi.'
                    : 'Yeni məhsul əlavə edildi.'
            );

            resetForm();
        } catch (error) {
            console.error('Product save error:', error);
            showMessage(error.message || 'Əməliyyat zamanı xəta baş verdi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Redaktə.
    const handleEdit = (product) => {
        previewImages
            .filter(image => image.isNew)
            .forEach(image => URL.revokeObjectURL(image.url));

        setEditingProduct(product);

        setForm({
            name: product.name || '',
            price: product.price ?? '',
            description: product.description || '',
            categoryId: String(product.categoryId || '')
        });

        setSelectedFiles([]);

        setPreviewImages(
            (product.images || []).map(image => ({
                id: image.id,
                url: image.imageUrl,
                isNew: false
            }))
        );

        setMessage(null);
        setShowForm(true);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Məhsul şəklini sil.
    const handleDeleteImage = async (image) => {
        if (!window.confirm('Bu şəkli silmək istədiyinə əminsən?')) return;

        if (image.isNew) {
            removePreview(image);
            return;
        }

        if (USE_DEMO_DATA) {
            setPreviewImages(previous =>
                previous.filter(item => item.id !== image.id)
            );

            setProducts(previous =>
                previous.map(product =>
                    product.id === editingProduct.id
                        ? {
                            ...product,
                            images: product.images.filter(
                                item => item.id !== image.id
                            )
                        }
                        : product
                )
            );

            return;
        }

        setDeletingImageId(image.id);

        try {
            await apiRequest(`/product/delete/image/${image.id}`, {
                method: 'DELETE'
            });

            setPreviewImages(previous =>
                previous.filter(item => item.id !== image.id)
            );

            setEditingProduct(previous => ({
                ...previous,
                images: previous.images.filter(
                    item => item.id !== image.id
                )
            }));

            showMessage('Şəkil silindi.');
        } catch (error) {
            showMessage(error.message || 'Şəkli silmək mümkün olmadı.', 'error');
        } finally {
            setDeletingImageId(null);
        }
    };

    // Məhsulu sil.
    const handleDelete = async (product) => {
        if (!window.confirm(
            `"${product.name}" məhsulunu silmək istədiyinə əminsən?`
        )) return;

        setDeletingId(product.id);

        try {
            if (USE_DEMO_DATA) {
                setProducts(previous =>
                    previous.filter(item => item.id !== product.id)
                );
            } else {
                await apiRequest(`/product/delete/${product.id}`, {
                    method: 'DELETE'
                });

                setProducts(previous =>
                    previous.filter(item => item.id !== product.id)
                );
            }

            if (editingProduct?.id === product.id) {
                resetForm();
            }

            showMessage('Məhsul silindi.');
        } catch (error) {
            showMessage(error.message || 'Məhsulu silmək mümkün olmadı.', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    // Demo rejimində aktiv / passiv status.
    const toggleDemoStatus = (product) => {
        if (!USE_DEMO_DATA) {
            showMessage(
                'Məhsul statusu üçün backend endpoint-i əlavə edilməlidir.',
                'error'
            );
            return;
        }

        setProducts(previous =>
            previous.map(item =>
                item.id === product.id
                    ? { ...item, isActive: item.isActive === false }
                    : item
            )
        );
    };

    // Demo rejimində seçilən məhsul.
    const toggleDemoFeatured = (product) => {
        if (!USE_DEMO_DATA) {
            showMessage(
                'Featured statusu üçün backend endpoint-i əlavə edilməlidir.',
                'error'
            );
            return;
        }

        setProducts(previous =>
            previous.map(item =>
                item.id === product.id
                    ? { ...item, isFeatured: !item.isFeatured }
                    : item
            )
        );
    };

    // Müvəqqəti şəkilləri təmizlə.
    useEffect(() => {
        return () => {
            previewImages
                .filter(image => image.isNew)
                .forEach(image => URL.revokeObjectURL(image.url));
        };
    }, [previewImages]);

    return (
        <div className="product-manager">

            {/* PAGE HEADER */}
            <div className="pm-page-header">
                <div>
                    <div className="pm-breadcrumb">
                        Admin Panel <span>/</span> Products
                    </div>

                    <h1>Products</h1>

                    <p>
                        Garden Wood məhsullarını idarə et, yenilə və təşkil et.
                    </p>
                </div>

                <div className="pm-header-actions">
                    {USE_DEMO_DATA && (
                        <span className="pm-demo-label">
                            Demo data
                        </span>
                    )}

                    <button
                        type="button"
                        className="pm-primary-btn"
                        onClick={openCreateForm}
                    >
                        <span>＋</span> Add Product
                    </button>
                </div>
            </div>

            {/* NOTIFICATION */}
            {message && (
                <div className={`pm-message ${messageType}`}>
                    <span>{message}</span>

                    <button
                        type="button"
                        onClick={() => setMessage(null)}
                        aria-label="Close message"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* STATISTICS */}
            <div className="pm-stats-grid">

                <div className="pm-stat-card">
                    <div className="pm-stat-icon purple">▦</div>
                    <div>
                        <span>Total Products</span>
                        <strong>{products.length}</strong>
                        <small>All products</small>
                    </div>
                </div>

                <div className="pm-stat-card">
                    <div className="pm-stat-icon green">✓</div>
                    <div>
                        <span>Active Products</span>
                        <strong>{activeCount}</strong>
                        <small>Currently active</small>
                    </div>
                </div>

                <div className="pm-stat-card">
                    <div className="pm-stat-icon orange">★</div>
                    <div>
                        <span>Featured Products</span>
                        <strong>{featuredCount}</strong>
                        <small>Highlighted products</small>
                    </div>
                </div>

                <div className="pm-stat-card">
                    <div className="pm-stat-icon blue">₼</div>
                    <div>
                        <span>Total Listed Value</span>
                        <strong>{formatPrice(totalValue)}</strong>
                        <small>Sum of listed prices</small>
                    </div>
                </div>

            </div>

            {/* ADD / EDIT FORM */}
            {showForm && (
                <section className="pm-form-card">

                    <div className="pm-section-heading">
                        <div>
                            <span className="pm-section-eyebrow">
                                PRODUCT MANAGEMENT
                            </span>

                            <h2>
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>

                            <p>
                                Məhsul məlumatlarını və şəkillərini daxil et.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="pm-close-form"
                            onClick={resetForm}
                            disabled={loading}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="pm-form-grid">

                            <div className="pm-field">
                                <label htmlFor="product-name">
                                    Product Name <span>*</span>
                                </label>

                                <input
                                    id="product-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="pm-field">
                                <label htmlFor="product-price">
                                    Price (AZN) <span>*</span>
                                </label>

                                <div className="pm-price-input">
                                    <input
                                        id="product-price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                    />
                                    <span>AZN</span>
                                </div>
                            </div>

                            <div className="pm-field">
                                <label htmlFor="product-category">
                                    Category <span>*</span>
                                </label>

                                <select
                                    id="product-category"
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select category</option>

                                    {categories.map(category => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pm-field pm-full-width">
                                <label htmlFor="product-description">
                                    Description
                                </label>

                                <textarea
                                    id="product-description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Write a short product description..."
                                    rows={4}
                                />
                            </div>

                            <div className="pm-field pm-full-width">
                                <label>
                                    Product Images
                                    {!editingProduct && <span> *</span>}
                                </label>

                                <label
                                    htmlFor="product-images"
                                    className="pm-upload-area"
                                >
                                    <span className="pm-upload-icon">↑</span>
                                    <strong>Click to upload images</strong>
                                    <small>
                                        JPG, PNG or WEBP · Maximum 5 MB per image
                                    </small>
                                </label>

                                <input
                                    ref={fileInputRef}
                                    id="product-images"
                                    className="pm-hidden-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleFileChange}
                                />

                                {previewImages.length > 0 && (
                                    <div className="pm-image-previews">
                                        {previewImages.map((image, index) => (
                                            <div
                                                className="pm-preview-item"
                                                key={image.id}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Product preview ${index + 1}`}
                                                />

                                                {index === 0 && (
                                                    <span className="pm-main-image-label">
                                                        Main
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(image)}
                                                    disabled={deletingImageId === image.id}
                                                    aria-label="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="pm-form-footer">
                            <button
                                type="button"
                                className="pm-secondary-btn"
                                onClick={resetForm}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="pm-primary-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Saving...'
                                    : editingProduct
                                        ? 'Save Changes'
                                        : 'Add Product'}
                            </button>
                        </div>

                    </form>
                </section>
            )}

            {/* PRODUCT LIST */}
            <section className="pm-list-card">

                <div className="pm-list-header">
                    <div>
                        <h2>All Products</h2>
                        <p>
                            {filteredProducts.length} product(s) found
                        </p>
                    </div>

                    <button
                        type="button"
                        className="pm-refresh-btn"
                        onClick={USE_DEMO_DATA ? () => {
                            setProducts(readDemoData(
                                STORAGE_KEYS.products,
                                demoProducts
                            ));
                            showMessage('Demo məlumatları yeniləndi.');
                        } : loadData}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* FILTERS */}
                <div className="pm-toolbar">

                    <div className="pm-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={event => setSearchTerm(event.target.value)}
                            placeholder="Search products..."
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={event => setCategoryFilter(event.target.value)}
                        aria-label="Filter by category"
                    >
                        <option value="all">All Categories</option>

                        {categories.map(category => (
                            <option
                                key={category.id}
                                value={String(category.id)}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={event => setStatusFilter(event.target.value)}
                        aria-label="Filter by status"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="featured">Featured</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={event => setSortBy(event.target.value)}
                        aria-label="Sort products"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A-Z</option>
                    </select>

                </div>

                {/* TABLE */}
                <div className="pm-table-wrapper">

                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="pm-empty-state">
                                        Loading products...
                                    </td>
                                </tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="pm-empty-state">
                                        <div className="pm-empty-icon">▦</div>
                                        <strong>No products found</strong>
                                        <span>
                                            Axtarış və filtrləri dəyişdir və ya yeni məhsul əlavə et.
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map(product => {
                                    const imageUrl =
                                        product.images?.[0]?.imageUrl || '';

                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="pm-product-cell">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="pm-no-image">
                                                            No image
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{product.name}</strong>
                                                        <small>
                                                            ID: {product.id}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="pm-category-text">
                                                    {getCategoryName(product.categoryId)}
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="pm-price">
                                                    {formatPrice(product.price)}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className={`pm-status ${
                                                    product.isActive === false
                                                        ? 'inactive'
                                                        : 'active'
                                                }`}>
                                                    {product.isActive === false
                                                        ? 'Inactive'
                                                        : 'Active'}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className={`pm-featured-btn ${
                                                        product.isFeatured ? 'selected' : ''
                                                    }`}
                                                    onClick={() => toggleDemoFeatured(product)}
                                                    title={
                                                        USE_DEMO_DATA
                                                            ? 'Toggle featured'
                                                            : 'Demo mode only'
                                                    }
                                                >
                                                    {product.isFeatured ? '★ Featured' : '☆ No'}
                                                </button>
                                            </td>

                                            <td>
                                                <div className="pm-row-actions">
                                                    <button
                                                        type="button"
                                                        className="pm-edit-btn"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="pm-status-btn"
                                                        onClick={() => toggleDemoStatus(product)}
                                                        title="Change status"
                                                    >
                                                        {product.isActive === false
                                                            ? 'Activate'
                                                            : 'Deactivate'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="pm-delete-btn"
                                                        onClick={() => handleDelete(product)}
                                                        disabled={deletingId === product.id}
                                                    >
                                                        {deletingId === product.id
                                                            ? '...'
                                                            : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>

                {/* PAGINATION */}
                <div className="pm-pagination">

                    <div className="pm-page-size">
                        <span>Rows per page</span>

                        <select
                            value={pageSize}
                            onChange={event => setPageSize(Number(event.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <div className="pm-page-controls">
                        <span>
                            {filteredProducts.length === 0
                                ? '0'
                                : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                                    currentPage * pageSize,
                                    filteredProducts.length
                                )}`
                            } of {filteredProducts.length}
                        </span>

                        <button
                            type="button"
                            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            ‹
                        </button>

                        <span className="pm-current-page">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => setCurrentPage(page =>
                                Math.min(totalPages, page + 1)
                            )}
                            disabled={currentPage === totalPages}
                        >
                            ›
                        </button>
                    </div>

                </div>

            </section>

            <div className="pm-bottom-note">
                {USE_DEMO_DATA
                    ? 'Demo mode aktivdir. Dəyişikliklər bu brauzerin localStorage yaddaşında saxlanılır.'
                    : 'Məhsul məlumatları serverdən yüklənir.'}
            </div>

        </div>
    );
};

export default ProductManager;