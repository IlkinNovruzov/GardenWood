import React, { useEffect, useState } from 'react';
import './Product.css';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', description: '', categoryId: '' });
    const [images, setImages] = useState([]);
    const [message, setMessage] = useState('');
    const apiKey = localStorage.getItem('adminKey');
    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('https://localhost:7253/api/admin/product/list', {
                headers: { 'X-API-KEY': apiKey }
            });
            if (!res.ok) {
                const text = await res.text(); // JSON olmayan hata mesajını yakala
                throw new Error(text);
            }
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("API error:", err.message);
        }
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
    const handleFileChange = (e) => {
        setImages(e.target.files);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("Name", form.name);
        formData.append("Price", form.price);
        formData.append("Description", form.description);
        formData.append("CategoryId", form.categoryId);

        for (let i = 0; i < images.length; i++) {
            formData.append("Images", images[i]);
        }

        const url = editingProduct
            ? `https://localhost:7253/api/admin/product/update/${editingProduct.id}`
            : 'https://localhost:7253/api/admin/product/add';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "X-API-KEY": apiKey,
                },
                body: formData
            });

            if (!res.ok) throw new Error('Operation failed');

            setMessage(editingProduct ? 'Product updated' : 'Product added');
            setForm({ name: '', price: '', description: '', categoryId: '' });
            setImages([]);
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
            categoryId: product.categoryId,
        });
        console.log( product.images)
        
        const imagesWithId = product.images.map(img => ({ id: img.id, url: img.imageUrl }));
        console.log(imagesWithId)
        setPreviewImages(imagesWithId);
         setImages([]);
    };
    const handleDeleteImage = async (imageId, index) => {
        const confirm = window.confirm('Are you sure you want to delete this image?');
        if (!confirm) return;
        try {
            const res = await fetch(`https://localhost:7253/api/admin/product/delete/image/${imageId}`, {
                method: 'DELETE',
                headers: { 'X-API-KEY': apiKey }
            });

            if (!res.ok) throw new Error('Delete failed');

            // Başarılı olursa preview listesinden kaldır
            setPreviewImages(prev => prev.filter((_, i) => i !== index));

            // Ayrıca ürünün images state'inden de kaldırmalısın (varsa)
            setEditingProduct(prev => ({
                ...prev,
                images: prev.images.filter(img => img.id !== imageId)
            }));

        } catch (err) {
            alert('Image delete failed');
        }
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
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    required={!editingProduct}
                />
                <div className="preview-images" style={{ marginTop: '10px' }}>
                    {previewImages.map((img, index) => (
                        <div key={index} style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
                            <img src={img.url} alt={`preview-${index}`} width={100} height={100} style={{ objectFit: 'cover', borderRadius: '5px' }} />
                            <div
                                onClick={() => handleDeleteImage(img.id, index)} className='close-button'>x</div>
                        </div>
                    ))}
                </div>
                <button type="submit">{editingProduct ? 'Update' : 'Add'}</button>
            </form>

            {message && <p className="message">{message}</p>}

            <h3>Product List</h3>
            <ul className="product-list">
                {products.map(p => (
                    <li key={p.id}>
                        <img src={p.images[0].imageUrl} />
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
