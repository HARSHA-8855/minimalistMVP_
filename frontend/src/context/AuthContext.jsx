import { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6500/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user: JSON.parse(user) },
      });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token: data.data.token, user: data.data.user },
        });
        toast.success('Login successful!');
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.message });
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error' });
      toast.error('Network error. Please try again.');
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token: data.data.token, user: data.data.user },
        });
        toast.success('Registration successful!');
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.message });
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error' });
      toast.error('Network error. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestCart'); // Clear guest cart on logout
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

