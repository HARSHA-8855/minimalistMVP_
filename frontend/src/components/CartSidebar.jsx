import { useState } from 'react';
import { X, Minus, Plus, Tag, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [combineMCash, setCombineMCash] = useState(false);

  // Calculate cart totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = items.reduce((sum, item) => {
    const originalPrice = item.mrp || item.price;
    return sum + (originalPrice * item.quantity);
  }, 0);
  const savings = originalTotal - subtotal;

  // Calculate progress for free gifts
  const freeMoisturizerThreshold = 599;
  const freeSunscreenThreshold = 799;
  const progress = Math.min((subtotal / freeSunscreenThreshold) * 100, 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-black">
              Your Cart ({getCartCount()} {getCartCount() === 1 ? 'item' : 'items'})
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>
          {/* MCash Banner */}
          <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-xs text-green-800">
            Earn 10% MCash with each order (1 MCash = ₹1)
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Promotional Section */}
          {subtotal < freeSunscreenThreshold && (
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <p className="text-sm font-medium text-black mb-3">
                Add more items to get a free mini moisturizer
              </p>
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <div className="flex flex-col items-center">
                    <Gift className="w-4 h-4 text-gray-600 mb-1" />
                    <span className="text-gray-600">₹599</span>
                    <span className="text-gray-500">Free Moisturizer</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Gift className="w-4 h-4 text-gray-600 mb-1" />
                    <span className="text-gray-600">₹799</span>
                    <span className="text-gray-500">Free Sunscreen</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="text-black hover:underline font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              items.map((item, index) => {
                const originalPrice = item.mrp || item.price;
                const discountedPrice = item.price;
                const isFree = discountedPrice === 0 || (originalPrice > discountedPrice && discountedPrice === 0);

                return (
                  <div key={`${item.productId || item._id || item.name}-${index}`} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded overflow-hidden bg-gray-50 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-black mb-1 line-clamp-2">
                        {item.name}
                      </h3>

                      {/* Size Dropdown (if applicable) */}
                      {item.size && (
                        <select className="text-xs border border-gray-300 rounded px-2 py-1 mb-2 text-black bg-white">
                          <option value={item.size}>{item.size}</option>
                        </select>
                      )}

                      {/* Price */}
                      <div className="mb-2">
                        {isFree ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs line-through text-gray-500">
                              ₹{originalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-semibold text-orange-600">FREE</span>
                          </div>
                        ) : originalPrice > discountedPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs line-through text-gray-500">
                              ₹{originalPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-semibold text-black">
                              ₹{discountedPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-black">
                            ₹{discountedPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.productId, item.quantity - 1);
                            } else {
                              removeFromCart(item.productId);
                            }
                          }}
                          className="w-7 h-7 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 text-black" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon Section */}
          {items.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
                <Tag className="w-4 h-4 text-gray-600" />
              </div>
              <Link
                to="#"
                className="text-xs text-black hover:underline font-medium inline-block"
              >
                View Coupons &gt;
              </Link>
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white">
            {/* Savings Banner */}
            {savings > 0 && (
              <div className="bg-green-50 border-b border-gray-200 px-4 py-2">
                <p className="text-sm font-medium text-green-700">
                  ₹{savings.toFixed(2)} Saved so far!
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Estimated Total</span>
                <div className="flex items-center gap-2">
                  {originalTotal > subtotal && (
                    <span className="text-sm line-through text-gray-500">
                      ₹{originalTotal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-base font-semibold text-black">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full bg-black hover:bg-gray-800 text-white text-center py-3 font-semibold transition-colors text-sm"
              >
                Checkout
              </Link>

              {/* MCash Checkbox */}
              {isAuthenticated && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={combineMCash}
                    onChange={(e) => setCombineMCash(e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-xs text-gray-600">Combine MCash in Next Step</span>
                </label>
              )}

              {/* Payment Icons */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Pay with:</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700">P</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700">G</span>
                  </div>
                </div>
              </div>

              {/* Powered by */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">Powered by GoKwik</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

