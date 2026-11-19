
import React, { useCallback, useEffect, useState } from "react";
import {
    NavLink,
    Link,
    useNavigate
} from "react-router-dom";

import {
    FiHome,
    FiPackage,
    FiGrid,
    FiImage,
    FiLogOut,
    FiRefreshCw,
    FiPlus,
    FiExternalLink,
    FiMenu,
    FiX,
    FiArrowUpRight,
    FiAlertCircle,
    FiCheckCircle
} from "react-icons/fi";

import "./Dashboard.css";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/adminpanel/dashboard",
        icon: FiHome
    },
    {
        label: "Products",
        path: "/adminpanel/products",
        icon: FiPackage
    },
    {
        label: "Categories",
        path: "/adminpanel/categories",
        icon: FiGrid
    },
    {
        label: "Carousel",
        path: "/adminpanel/carousels",
        icon: FiImage
    }
];

const getArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
};

const formatPrice = (price) => {
    const value = Number(price);

    if (!Number.isFinite(value)) return "—";

    return new Intl.NumberFormat("az-AZ", {
        style: "currency",
        currency: "AZN",
        maximumFractionDigits: 2
    }).format(value);
};

const Dashboard = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [carousels, setCarousels] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const loadDashboard = useCallback(async (signal) => {
        const allowed =
            localStorage.getItem("adminAccess") === "true";

        const apiKey = localStorage.getItem("adminKey");

        if (!allowed || !apiKey) {
            navigate("/adminpanel", { replace: true });
            return;
        }

        const baseUrl = (window.BASE_URL || "").replace(/\/+$/, "");

        if (!baseUrl) {
            setError("API ünvanı təyin edilməyib.");
            setLoading(false);
            return;
        }

        const apiRequest = async (endpoint) => {
            const response = await fetch(
                `${baseUrl}/api/admin${endpoint}`,
                {
                    method: "GET",
                    headers: {
                        "X-API-KEY": apiKey
                    },
                    signal
                }
            );

            if (!response.ok) {
                const responseText = await response.text();

                throw new Error(
                    `API xətası (${response.status}): ${
                        responseText.slice(0, 150) ||
                        endpoint
                    }`
                );
            }

            const contentType =
                response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {
                throw new Error(
                    `${endpoint} JSON məlumat qaytarmadı.`
                );
            }

            return response.json();
        };

        try {
            setError("");

            const [
                productData,
                categoryData,
                carouselData
            ] = await Promise.all([
                apiRequest("/product/list"),
                apiRequest("/category/list"),
                apiRequest("/carousel/list")
            ]);

            if (signal?.aborted) return;

            setProducts(getArray(productData));
            setCategories(getArray(categoryData));
            setCarousels(getArray(carouselData));

        } catch (err) {
            if (err.name === "AbortError") return;

            console.error("Dashboard loading error:", err);
            setError(
                err.message || "Dashboard məlumatları yüklənmədi."
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [navigate]);

    useEffect(() => {
        const controller = new AbortController();

        loadDashboard(controller.signal);

        return () => controller.abort();
    }, [loadDashboard]);

    const handleRefresh = () => {
        const controller = new AbortController();

        setRefreshing(true);
        loadDashboard(controller.signal);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminKey");
        localStorage.removeItem("adminAccess");

        navigate("/adminpanel", { replace: true });
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const currentDate = new Intl.DateTimeFormat("az-AZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());

    const stats = [
        {
            title: "Ümumi məhsullar",
            value: products.length,
            description: "Məhsul kataloqu",
            icon: FiPackage,
            color: "blue",
            path: "/adminpanel/products"
        },
        {
            title: "Kateqoriyalar",
            value: categories.length,
            description: "Məhsul kateqoriyaları",
            icon: FiGrid,
            color: "green",
            path: "/adminpanel/categories"
        },
        {
            title: "Carousel şəkilləri",
            value: carousels.length,
            description: "Ana səhifə vizualları",
            icon: FiImage,
            color: "orange",
            path: "/adminpanel/carousels"
        }
    ];

    return (
        <div className="admin-layout">

            {mobileMenuOpen && (
                <button
                    type="button"
                    className="admin-sidebar-overlay"
                    aria-label="Close menu"
                    onClick={closeMobileMenu}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`admin-sidebar ${
                    mobileMenuOpen ? "sidebar-open" : ""
                }`}
            >
                <div className="admin-sidebar-top">

                    <Link
                        to="/adminpanel/dashboard"
                        className="admin-brand"
                        onClick={closeMobileMenu}
                    >
                        <div className="admin-brand-icon">
                            GW
                        </div>

                        <div className="admin-brand-text">
                            <strong>GARDEN WOOD</strong>
                            <span>ADMIN PANEL</span>
                        </div>
                    </Link>

                    <button
                        type="button"
                        className="admin-mobile-close"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        <FiX />
                    </button>

                </div>

                <div className="admin-sidebar-label">
                    MENU
                </div>

                <nav className="admin-navigation">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `admin-nav-link ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <Icon />
                                <span>{item.label}</span>

                                {item.path ===
                                    "/adminpanel/dashboard" && (
                                    <span className="nav-active-dot" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-bottom">

                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="admin-nav-link"
                    >
                        <FiExternalLink />
                        <span>Sayta bax</span>
                    </a>

                    <button
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        <span>Çıxış</span>
                    </button>

                    <div className="admin-sidebar-version">
                        <span>Garden Wood</span>
                        <span>Management System</span>
                    </div>

                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">

                {/* HEADER */}
                <header className="admin-header">

                    <div className="admin-header-left">

                        <button
                            type="button"
                            className="admin-menu-toggle"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                            aria-label="Open menu"
                        >
                            <FiMenu />
                        </button>

                        <div>
                            <span className="admin-breadcrumb">
                                Garden Wood / Admin
                            </span>

                            <h1>Dashboard</h1>
                        </div>

                    </div>

                    <div className="admin-header-right">

                        <div className="admin-date">
                            {currentDate}
                        </div>

                        <div className="admin-user">
                            <div className="admin-user-avatar">
                                GW
                            </div>

                            <div className="admin-user-info">
                                <strong>Administrator</strong>
                                <span>Admin account</span>
                            </div>
                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}
                <div className="admin-content">

                    <section className="dashboard-welcome">

                        <div>
                            <span className="dashboard-eyebrow">
                                MANAGEMENT OVERVIEW
                            </span>

                            <h2>
                                Xoş gəlmisiniz!
                            </h2>

                            <p>
                                Garden Wood idarəetmə panelindən
                                saytınızın məzmununu rahatlıqla
                                idarə edə bilərsiniz.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="dashboard-refresh"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                        >
                            <FiRefreshCw
                                className={
                                    refreshing ? "refresh-spinning" : ""
                                }
                            />
                            <span>
                                {refreshing ? "Yenilənir..." : "Yenilə"}
                            </span>
                        </button>

                    </section>

                    {/* ERROR */}
                    {error && (
                        <div className="dashboard-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* STATISTICS */}
                    <section className="dashboard-section">

                        <div className="dashboard-section-heading">
                            <div>
                                <h3>Ümumi göstəricilər</h3>
                                <p>Saytın hazırkı məzmun statistikası</p>
                            </div>

                            <span className="dashboard-live-status">
                                <span />
                                Live data
                            </span>
                        </div>

                        <div className="dashboard-stats-grid">

                            {stats.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <Link
                                        to={stat.path}
                                        className="dashboard-stat-card"
                                        key={stat.title}
                                    >
                                        <div className="stat-card-top">
                                            <div
                                                className={`stat-icon ${stat.color}`}
                                            >
                                                <Icon />
                                            </div>

                                            <FiArrowUpRight className="stat-arrow" />
                                        </div>

                                        <div className="stat-value">
                                            {loading ? (
                                                <span className="stat-skeleton" />
                                            ) : (
                                                stat.value
                                            )}
                                        </div>

                                        <h4>{stat.title}</h4>

                                        <p>{stat.description}</p>
                                    </Link>
                                );
                            })}

                        </div>

                    </section>

                    {/* QUICK ACTIONS */}
                    <section className="dashboard-section">

                        <div className="dashboard-section-heading">
                            <div>
                                <h3>Sürətli əməliyyatlar</h3>
                                <p>Əsas idarəetmə funksiyalarına keçid</p>
                            </div>
                        </div>

                        <div className="dashboard-actions-grid">

                            <Link
                                to="/adminpanel/products"
                                className="dashboard-action-card"
                            >
                                <div className="action-icon product-action">
                                    <FiPlus />
                                </div>

                                <div>
                                    <strong>Məhsul əlavə et</strong>
                                    <span>Kataloqa yeni məhsul daxil et</span>
                                </div>

                                <FiArrowUpRight />
                            </Link>

                            <Link
                                to="/adminpanel/categories"
                                className="dashboard-action-card"
                            >
                                <div className="action-icon category-action">
                                    <FiGrid />
                                </div>

                                <div>
                                    <strong>Kateqoriyaları idarə et</strong>
                                    <span>Kateqoriya əlavə et və redaktə et</span>
                                </div>

                                <FiArrowUpRight />
                            </Link>

                            <Link
                                to="/adminpanel/carousels"
                                className="dashboard-action-card"
                            >
                                <div className="action-icon carousel-action">
                                    <FiImage />
                                </div>

                                <div>
                                    <strong>Carousel idarəetməsi</strong>
                                    <span>Ana səhifə şəkillərini yenilə</span>
                                </div>

                                <FiArrowUpRight />
                            </Link>

                        </div>

                    </section>

                    {/* RECENT PRODUCTS */}
                    <section className="dashboard-section">

                        <div className="dashboard-section-heading">
                            <div>
                                <h3>Məhsul kataloqu</h3>
                                <p>Mövcud məhsulların qısa görünüşü</p>
                            </div>

                            <Link
                                to="/adminpanel/products"
                                className="dashboard-view-all"
                            >
                                Hamısına bax
                                <FiArrowUpRight />
                            </Link>
                        </div>

                        <div className="dashboard-products-card">

                            {loading ? (
                                <div className="dashboard-table-loading">
                                    Məlumatlar yüklənir...
                                </div>
                            ) : products.length === 0 ? (
                                <div className="dashboard-empty">
                                    <FiPackage />
                                    <strong>Hələ məhsul yoxdur</strong>
                                    <span>
                                        İlk məhsulunuzu əlavə etməklə başlayın.
                                    </span>

                                    <Link to="/adminpanel/products">
                                        Məhsul əlavə et
                                    </Link>
                                </div>
                            ) : (
                                <div className="dashboard-table-wrapper">
                                    <table className="dashboard-products-table">

                                        <thead>
                                            <tr>
                                                <th>Məhsul</th>
                                                <th>Qiymət</th>
                                                <th>Kateqoriya</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {products.slice(0, 5).map((product) => {
                                                const category = categories.find(
                                                    item =>
                                                        String(item.id) ===
                                                        String(product.categoryId)
                                                );

                                                const image =
                                                    product.images?.[0]?.imageUrl;

                                                return (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <div className="dashboard-product-info">
                                                                {image ? (
                                                                    <img
                                                                        src={image}
                                                                        alt={product.name}
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <div className="dashboard-product-placeholder">
                                                                        <FiPackage />
                                                                    </div>
                                                                )}

                                                                <strong>
                                                                    {product.name}
                                                                </strong>
                                                            </div>
                                                        </td>

                                                        <td className="product-price">
                                                            {formatPrice(product.price)}
                                                        </td>

                                                        <td>
                                                            {category?.name || "—"}
                                                        </td>

                                                        <td>
                                                            <span className="product-status">
                                                                <FiCheckCircle />
                                                                Aktiv
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>

                                    </table>
                                </div>
                            )}

                        </div>

                    </section>

                    <footer className="admin-content-footer">
                        <span>
                            © {new Date().getFullYear()} Garden Wood
                        </span>

                        <span>
                            Admin Management System
                        </span>
                    </footer>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
