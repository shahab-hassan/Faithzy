import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [isLogin, setIsLogin] = useState(false);
    const [isAdminLogin, setIsAdminLogin] = useState(null);
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();
    
    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get("http://localhost:5000/api/v1/auth/checkLogin", {
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
    };

    const fetchAdminData = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const response = await axios.get("http://localhost:5000/api/v1/admins/admin/checkAdminLogin", {
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
        else{
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
    };

    const adminLogin = (token) => {
        localStorage.setItem('adminToken', token);
        setIsAdminLogin(true);
        fetchAdminData();
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
        <AuthContext.Provider value={{ isLogin, user, login, logout, fetchUserData, fetchAdminData, adminLogin, isAdminLogin, admin }}>
            {children}
        </AuthContext.Provider>
    );
};
