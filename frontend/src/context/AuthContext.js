import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, authEndpoints } from '../services/api';

// Initial state
const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    UPDATE_USER: 'UPDATE_USER',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_LOADING: 'SET_LOADING'
};

// Reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.REGISTER_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.REGISTER_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: null
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: action.payload
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    // Set auth header
                    authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Get current user
                    const response = await authAPI.get('/me');
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            user: response.data.data.user,
                            token
                        }
                    });
                } catch (error) {
                    // Token is invalid, remove it
                    localStorage.removeItem('token');
                    delete authAPI.defaults.headers.common['Authorization'];
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authEndpoints.login({ email, password });
            const { user, token } = response.data.data;

            // Store token in localStorage
            localStorage.setItem('token', token);

            // Set auth header
            authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user, token }
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            });
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        dispatch({ type: AUTH_ACTIONS.REGISTER_START });

        try {
            const response = await authEndpoints.register(userData);
            const { user, token } = response.data.data;

            // Store token in localStorage
            localStorage.setItem('token', token);

            // Set auth header
            authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch({
                type: AUTH_ACTIONS.REGISTER_SUCCESS,
                payload: { user, token }
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: errorMessage
            });
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        delete authAPI.defaults.headers.common['Authorization'];
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    // Update user function
    const updateUser = (userData) => {
        dispatch({
            type: AUTH_ACTIONS.UPDATE_USER,
            payload: userData
        });
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return state.user?.role === role;
    };

    // Check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        return roles.includes(state.user?.role);
    };

    // Check if user is verified
    const isVerified = () => {
        return state.user?.isVerified === true;
    };

    // Check if user is blocked
    const isBlocked = () => {
        return state.user?.isBlocked === true;
    };

    const value = {
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        hasRole,
        hasAnyRole,
        isVerified,
        isBlocked
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
