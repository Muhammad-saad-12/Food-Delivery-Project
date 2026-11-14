import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  removeFromCart,
  updateQuantity,
  setTip,
  clearCart,
  toggleCart,
} from '../../store/slices/cartSlice';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatPKR } from '../../utils/currency';

interface CartDrawerProps {
  onProceedToCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
}) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  const isOpen = cart.isOpen;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
    dispatch(toggleCart(false));
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(toggleCart(false))}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Cart</h2>
                <p className="text-xs text-slate-400">
                  {cart.restaurantName ? `${cart.restaurantName} • ` : ''}
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.items.length > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(clearCart())}
                  className="text-xs text-slate-400 hover:text-rose-400 transition px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => dispatch(toggleCart(false))}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">
                  Your cart is currently empty
                </h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Explore gourmet dishes, customize spice levels and toppings, and add your favorite plates!
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(toggleCart(false))}
                  className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                >
                  Start Browsing Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Free Delivery Tracker */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {cart.subtotal >= 2000 ? (
                      <span className="text-emerald-400 font-medium">
                        🎉 Unlocked Free Delivery!
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        Add {formatPKR(2000 - cart.subtotal)} more for{' '}
                        <strong className="text-emerald-400">Free Delivery</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">Goal Rs. 2,000</span>
                </div>

                {/* Items List */}
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3 hover:border-slate-700 transition"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-sm font-bold text-emerald-400 shrink-0 font-mono">
                          {formatPKR(item.itemTotal)}
                        </span>
                      </div>

                      {/* Customization Details */}
                      <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                        {item.size && (
                          <p>
                            Portion: <span className="text-slate-200">{item.size.name}</span>
                          </p>
                        )}
                        {item.spiceLevel && (
                          <p>
                            Spice: <span className="text-orange-400">{item.spiceLevel}</span>
                          </p>
                        )}
                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <p className="truncate">
                            Add-ons:{' '}
                            <span className="text-slate-300">
                              {item.selectedAddOns.map((a) => a.name).join(', ')}
                            </span>
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="italic text-slate-500 truncate">
                            Note: "{item.specialInstructions}"
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                })
                              )
                            }
                            className="p-1 text-slate-400 hover:text-white transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-white min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            className="p-1 text-slate-400 hover:text-white transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer Breakdown */}
          {cart.items.length > 0 && (
            <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4 shrink-0">
              {/* Tip Selection */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  Rider Appreciation Tip (PKR)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 300].map((amount) => {
                    const isSelected = cart.tip === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => dispatch(setTip(amount))}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Rs. {amount}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-mono font-semibold">{formatPKR(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Sales Tax (8% PRA/GST)</span>
                  <span className="text-slate-200 font-mono">{formatPKR(cart.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-200 font-mono">
                    {cart.deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      formatPKR(cart.deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rider Tip</span>
                  <span className="text-slate-200 font-mono">{formatPKR(cart.tip)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-emerald-400 font-mono font-black text-base">{formatPKR(cart.total)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Proceed to Delivery & Payment</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span>{formatPKR(cart.total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
