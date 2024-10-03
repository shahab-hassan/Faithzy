import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { hostNameBack } from './constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [isLogin, setIsLogin] = useState(null);
    const [isAdminLogin, setIsAdminLogin] = useState(null);
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();

    const [isTabletPro, setIsTabletPro] = React.useState(window.innerWidth <= 1090);
    const [isTablet, setIsTablet] = React.useState(window.innerWidth <= 900);
    const [isMobilePro, setIsMobilePro] = React.useState(window.innerWidth <= 650);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 500);
    const [isMobileMini, setIsMobileMini] = React.useState(window.innerWidth <= 400);

    React.useEffect(() => {

        const handleResize = () => {
            setIsTablet(window.innerWidth <= 900);
            setIsTabletPro(window.innerWidth <= 1090);
            setIsMobilePro(window.innerWidth <= 650);
            setIsMobile(window.innerWidth <= 500);
            setIsMobileMini(window.innerWidth <= 400);
        };
        

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(`${hostNameBack}/api/v1/auth/checkLogin`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.isLogin) {
                    setIsLogin(true);
                    setUser(response.data.user);
                } else {
                    setIsLogin(false);
                    setUser(null);
                }
            } catch (error) {
                setIsLogin(false);
                setUser(null);
            }
        }
        else {
            setIsLogin(false);
            setUser(null);
        }
    };

    const fetchAdminData = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const response = await axios.get(`${hostNameBack}/api/v1/admins/admin/checkAdminLogin`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.isLogin) {
                    setIsAdminLogin(true);
                    setAdmin(response.data.admin);
                } else {
                    setIsAdminLogin(false);
                    setAdmin(null);
                }
            } catch (error) {
                setIsAdminLogin(false);
                setAdmin(null);
            }
        }
        else {
            setIsAdminLogin(false);
            setAdmin(null);
        }
    };

    useEffect(() => {

        if (localStorage.getItem('loggedOut')) {
            enqueueSnackbar("Logged out Successfully!", { variant: "success" });
            localStorage.removeItem('loggedOut');
        }

        fetchUserData();
        fetchAdminData();

    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLogin(true);
        fetchUserData();
        localStorage.removeItem('adminToken');
        setIsAdminLogin(false)
        setAdmin(null)
    };

    const adminLogin = (token) => {
        localStorage.setItem('adminToken', token);
        setIsAdminLogin(true);
        fetchAdminData();
        localStorage.removeItem('token');
        setIsLogin(false);
        setUser(null);
    };

    const logout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('token');
            setIsLogin(false);
            setUser(null);
            localStorage.setItem("loggedOut", 'true');
            navigate("/");
            window.location.reload();
        }
    };


    return (
        <AuthContext.Provider value={{ isLogin, user, login, logout, fetchUserData, fetchAdminData, adminLogin, isAdminLogin, admin, isTablet, isTabletPro, isMobile, isMobilePro, isMobileMini }}>
            {children}
        </AuthContext.Provider>
    );
};
