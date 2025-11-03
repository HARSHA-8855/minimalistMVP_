import { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6500/api';
const API_URL = `${BASE_URL}/cart`;

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CART':
      return { ...state, items: action.payload, loading: false };
    
    case 'ADD_TO_CART':
      return { ...state, items: action.payload };
    
    case 'UPDATE_CART':
      return { ...state, items: action.payload };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: true,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, token } = useAuth();

  // Load cart from backend if authenticated, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isAuthenticated && token) {
        try {
          const response = await fetch(API_URL, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            dispatch({ type: 'SET_CART', payload: data.data || [] });
          } else {
            // Fallback to localStorage if API fails
            const guestCart = localStorage.getItem('guestCart');
            const items = guestCart ? JSON.parse(guestCart) : [];
            dispatch({ type: 'SET_CART', payload: items });
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          const guestCart = localStorage.getItem('guestCart');
          const items = guestCart ? JSON.parse(guestCart) : [];
          dispatch({ type: 'SET_CART', payload: items });
        }
      } else {
        // Load guest cart from localStorage
        const guestCart = localStorage.getItem('guestCart');
        const items = guestCart ? JSON.parse(guestCart) : [];
        dispatch({ type: 'SET_CART', payload: items });
      }
    };

    loadCart();
  }, [isAuthenticated, token]);

  // Sync guest cart to backend when user logs in
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isAuthenticated && token) {
        const guestCart = localStorage.getItem('guestCart');
        
        if (guestCart) {
          try {
            const guestItems = JSON.parse(guestCart);
            
            if (guestItems.length > 0) {
              const response = await fetch(`${API_URL}/sync`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ guestCartItems: guestItems }),
              });

              if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'SET_CART', payload: data.data || [] });
                localStorage.removeItem('guestCart'); // Clear guest cart
                toast.success('Cart synced successfully!');
              }
            }
          } catch (error) {
            console.error('Error syncing cart:', error);
          }
        } else {
          // Load user's cart from backend
          try {
            const response = await fetch(API_URL, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              dispatch({ type: 'SET_CART', payload: data.data || [] });
            }
          } catch (error) {
            console.error('Error loading user cart:', error);
          }
        }
      }
    };

    if (isAuthenticated) {
      syncGuestCart();
    }
  }, [isAuthenticated, token]);

  // Save to localStorage if guest, sync to backend if authenticated
  const saveCart = async (items) => {
    if (isAuthenticated && token) {
      // Cart is managed by backend, no need to save to localStorage
      // The backend sync happens in the reducer after API calls
    } else {
      // Save guest cart to localStorage
      localStorage.setItem('guestCart', JSON.stringify(items));
    }
  };

  const addToCart = async (product) => {
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    };

    if (isAuthenticated && token) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(cartItem),
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({ type: 'ADD_TO_CART', payload: data.data || [] });
          toast.success('Added to cart');
        } else {
          throw new Error('Failed to add to cart');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      }
    } else {
      // Guest cart - add to local state and localStorage
      const existingItem = state.items.find(
        (item) => item.productId === cartItem.productId
      );
      
      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map((item) =>
          item.productId === cartItem.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        toast.success('Quantity updated');
      } else {
        updatedItems = [...state.items, cartItem];
        toast.success('Added to cart');
      }
      
      dispatch({ type: 'ADD_TO_CART', payload: updatedItems });
      saveCart(updatedItems);
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_URL}/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({ type: 'UPDATE_CART', payload: data.data || [] });
          toast.success('Removed from cart');
        } else {
          throw new Error('Failed to remove from cart');
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove from cart');
      }
    } else {
      const updatedItems = state.items.filter(
        (item) => item.productId !== productId
      );
      dispatch({ type: 'UPDATE_CART', payload: updatedItems });
      saveCart(updatedItems);
      toast.success('Removed from cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_URL}/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({ type: 'UPDATE_CART', payload: data.data || [] });
        } else {
          throw new Error('Failed to update cart');
        }
      } catch (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update quantity');
      }
    } else {
      const updatedItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      dispatch({ type: 'UPDATE_CART', payload: updatedItems });
      saveCart(updatedItems);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch(API_URL, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          dispatch({ type: 'CLEAR_CART' });
          toast.success('Cart cleared');
        } else {
          throw new Error('Failed to clear cart');
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('guestCart');
      toast.success('Cart cleared');
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    loading: state.loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
