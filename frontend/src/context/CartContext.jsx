// Shopping cart context for managing cart state
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Cart state
const initialState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  isLoading: false,
  error: null,
};

// Cart actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        itemCount: action.payload.item_count || 0,
        subtotal: action.payload.subtotal || 0,
        isLoading: false,
        error: null,
      };
    
    case CART_ACTIONS.ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload],
        itemCount: state.itemCount + action.payload.quantity,
        subtotal: state.subtotal + (action.payload.price * action.payload.quantity),
        isLoading: false,
      };
    
    case CART_ACTIONS.UPDATE_ITEM:
      const updatedItems = state.items.map(item => 
        item.id === action.payload.id ? action.payload : item
      );
      const newSubtotal = updatedItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );
      const newItemCount = updatedItems.reduce((total, item) => 
        total + item.quantity, 0
      );
      
      return {
        ...state,
        items: updatedItems,
        itemCount: newItemCount,
        subtotal: newSubtotal,
        isLoading: false,
      };
    
    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const newSubtotalAfterRemove = filteredItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );
      const newItemCountAfterRemove = filteredItems.reduce((total, item) => 
        total + item.quantity, 0
      );
      
      return {
        ...state,
        items: filteredItems,
        itemCount: newItemCountAfterRemove,
        subtotal: newSubtotalAfterRemove,
        isLoading: false,
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        itemCount: 0,
        subtotal: 0,
        isLoading: false,
      };
    
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Create cart context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user]);

  // Load cart from API
  const loadCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const cartData = await cartAPI.getCart();
      dispatch({ type: CART_ACTIONS.SET_CART, payload: cartData });
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Don't show error for empty cart
      if (error.response?.status !== 404) {
        dispatch({ 
          type: CART_ACTIONS.SET_ERROR, 
          payload: 'Failed to load cart'
        });
      } else {
        dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      }
    }
  };

  // Add item to cart
  const addToCart = async (productId, variantId = null, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      const response = await cartAPI.addToCart(productId, variantId, quantity);
      
      // Reload cart to get updated data
      await loadCart();
      
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to add item to cart';
      
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to update cart' };
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      await cartAPI.updateCartItem(cartItemId, quantity);
      
      // Reload cart to get updated data
      await loadCart();
      
      return { success: true, message: 'Cart updated' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update cart item';
      
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to remove items' };
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      await cartAPI.removeFromCart(cartItemId);
      
      // Update local state immediately for better UX
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: cartItemId });
      
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to remove item from cart';
      
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to clear cart' };
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      await cartAPI.clearCart();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to clear cart';
      
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Get cart item by product and variant
  const getCartItem = (productId, variantId = null) => {
    return state.items.find(item => 
      item.product.id === productId && 
      (item.variant?.id === variantId || (!item.variant && !variantId))
    );
  };

  // Check if product is in cart
  const isInCart = (productId, variantId = null) => {
    return !!getCartItem(productId, variantId);
  };

  // Get quantity of specific item in cart
  const getItemQuantity = (productId, variantId = null) => {
    const item = getCartItem(productId, variantId);
    return item ? item.quantity : 0;
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    items: state.items,
    itemCount: state.itemCount,
    subtotal: state.subtotal,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    
    // Helpers
    getCartItem,
    isInCart,
    getItemQuantity,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;