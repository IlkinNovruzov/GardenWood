import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const allowed = localStorage.getItem('adminAccess') === 'true';
        if (!allowed) {
            navigate('/adminpanel'); 
        }
    }, []);
    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Admin Panel</h1>
            <div className="dashboard-cards">
                <div className="card">
                    <h2>Toplam Ürün</h2>
                    <p>128</p>
                </div>
                <div className="card">
                    <h2>Yeni Siparişler</h2>
                    <p>23</p>
                </div>
                <div className="card">
                    <h2>Stokta Azalanlar</h2>
                    <p>5</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
