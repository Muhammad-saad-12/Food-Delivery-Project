import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleCart } from '../../store/slices/cartSlice';
import { logout, setCredentials } from '../../store/slices/authSlice';
import { formatPKR } from '../../utils/currency';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  Package,
  Sparkles,
  ChefHat,
  Bike,
  ShieldCheck,
  LifeBuoy,
  Menu,
  X,
} from 'lucide-react';

interface CustomerNavbarProps {
  onGoHome?: () => void;
  onGoOrders?: () => void;
  onSwitchToVendor?: () => void;
  onSwitchToRider?: () => void;
  onSwitchToAdmin?: () => void;
  onOpenSupport?: () => void;
  activeView?: 'discovery' | 'orders';
  activeRestaurantName?: string | null;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  onGoHome,
  onGoOrders,
  onSwitchToVendor,
  onSwitchToRider,
  onSwitchToAdmin,
  onOpenSupport,
  activeView = 'discovery',
  activeRestaurantName,
}) => {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

        {/* Center Navigation Links (Desktop) */}
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Vendor Ops Portal (Desktop) */}
          {onSwitchToVendor && (
            <button
              type="button"
              onClick={onSwitchToVendor}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs transition"
              title="Open Merchant Kitchen & Menu Manager"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Vendor Ops</span>
            </button>
          )}

          {/* Switch to Rider Fleet Portal (Desktop) */}
          {onSwitchToRider && (
            <button
              type="button"
              onClick={onSwitchToRider}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold text-xs transition"
              title="Open Rider Fleet Dispatch & GPS Portal"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Rider Fleet</span>
            </button>
          )}

          {/* Switch to Executive Admin Portal (Desktop) */}
          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs transition"
              title="Open Admin Governance & Analytics Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* Support Ticket Modal Trigger (Desktop) */}
          {onOpenSupport && (
            <button
              type="button"
              onClick={onOpenSupport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs transition"
              title="Help Desk & Support Inquiries"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support</span>
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
            className="relative flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 px-3 py-2 rounded-xl font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-white font-mono text-[11px]">
                {cartItemCount}
              </span>
            )}
            {cart.subtotal > 0 && (
              <span className="font-mono text-[11px] hidden sm:inline">
                • {formatPKR(cart.subtotal)}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onGoHome?.();
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left font-medium transition ${
                activeView === 'discovery'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              🍽️ Discover Restaurants
            </button>

            <button
              onClick={() => {
                onGoOrders?.();
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left font-medium transition ${
                activeView === 'orders'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              📦 Orders & Invoices
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Platform Portals & Controls
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {onSwitchToVendor && (
                <button
                  onClick={() => {
                    onSwitchToVendor();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold text-left"
                >
                  <ChefHat className="w-4 h-4 shrink-0" />
                  <span>Vendor Ops</span>
                </button>
              )}

              {onSwitchToRider && (
                <button
                  onClick={() => {
                    onSwitchToRider();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300 font-bold text-left"
                >
                  <Bike className="w-4 h-4 shrink-0" />
                  <span>Rider Fleet</span>
                </button>
              )}

              {onSwitchToAdmin && (
                <button
                  onClick={() => {
                    onSwitchToAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold text-left"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Admin Console</span>
                </button>
              )}

              {onOpenSupport && (
                <button
                  onClick={() => {
                    onOpenSupport();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold text-left"
                >
                  <LifeBuoy className="w-4 h-4 shrink-0" />
                  <span>Support Center</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              JazzCash • EasyPaisa • COD
            </span>
            <button
              onClick={handleToggleAuth}
              className="text-xs text-slate-300 font-medium hover:text-white"
            >
              {auth.isAuthenticated ? `Signed in as ${auth.user?.name}` : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
