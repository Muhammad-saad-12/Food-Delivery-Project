import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleCart } from '../../store/slices/cartSlice';
import { logout, setCredentials } from '../../store/slices/authSlice';
import { UtensilsCrossed, ShoppingBag, User, Package, Sparkles, ChefHat, Bike } from 'lucide-react';

interface CustomerNavbarProps {
  onGoHome?: () => void;
  onGoOrders?: () => void;
  onSwitchToVendor?: () => void;
  onSwitchToRider?: () => void;
  activeView?: 'discovery' | 'orders';
  activeRestaurantName?: string | null;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  onGoHome,
  onGoOrders,
  onSwitchToVendor,
  onSwitchToRider,
  activeView = 'discovery',
  activeRestaurantName,
}) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const auth = useSelector((state: RootState) => state.auth);

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleAuth = () => {
    if (auth.isAuthenticated) {
      dispatch(logout());
    } else {
      dispatch(
        setCredentials({
          user: {
            id: 'cust-101',
            name: 'Saad Khan',
            email: 'saad@example.pk',
            role: 'waiter', // demo customer user
          },
          token: 'demo-jwt-customer-token',
        })
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                GourmetOS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pakistan
              </span>
            </div>
            {activeRestaurantName && (
              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                Dining at: <span className="text-slate-200">{activeRestaurantName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          <button
            onClick={onGoHome}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeView === 'discovery'
                ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Discover Restaurants
          </button>

          <button
            onClick={onGoOrders}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeView === 'orders'
                ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Orders & Tax Invoices</span>
          </button>

          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            JazzCash • EasyPaisa • COD
          </span>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Orders button */}
          <button
            type="button"
            onClick={onGoOrders}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            title="My Orders"
          >
            <Package className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Switch to Vendor Ops Portal */}
          {onSwitchToVendor && (
            <button
              type="button"
              onClick={onSwitchToVendor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs transition"
              title="Open Merchant Kitchen & Menu Manager"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vendor Ops</span>
            </button>
          )}

          {/* Switch to Rider Fleet Portal */}
          {onSwitchToRider && (
            <button
              type="button"
              onClick={onSwitchToRider}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold text-xs transition"
              title="Open Rider Fleet Dispatch & GPS Portal"
            >
              <Bike className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rider Fleet</span>
            </button>
          )}

          {/* User Profile toggle */}
          <button
            type="button"
            onClick={handleToggleAuth}
            className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{auth.isAuthenticated ? auth.user?.name : 'Guest Sign In'}</span>
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => dispatch(toggleCart(true))}
            className="relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-950 text-white font-mono text-[11px]">
                {cartItemCount}
              </span>
            )}
            {cart.subtotal > 0 && (
              <span className="font-mono ml-1 hidden sm:inline">
                • ${cart.subtotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
