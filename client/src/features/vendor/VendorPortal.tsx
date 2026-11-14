import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Bell,
  UtensilsCrossed,
  Settings,
  ArrowRightLeft,
  Store,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { LiveOrders } from './LiveOrders';
import { MenuManagement } from './MenuManagement';
import { VendorSettings } from './VendorSettings';
import { RestaurantItem } from '../customer/CustomerDiscovery';

interface VendorPortalProps {
  onSwitchToCustomer: () => void;
  onSwitchToRider?: () => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({
  onSwitchToCustomer,
  onSwitchToRider,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorRestaurants();
  }, []);

  const fetchVendorRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurants');
      const list = res.data.restaurants || [];
      setRestaurants(list);
      if (list.length > 0) {
        setSelectedRestaurant(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch vendor restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = (id: string) => {
    const found = restaurants.find((r) => r._id === id);
    if (found) setSelectedRestaurant(found);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Vendor Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Vendor Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  GourmetOS
                </span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vendor Ops
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Merchant Operations & Kitchen Pipeline
              </p>
            </div>
          </div>

          {/* Restaurant Selector & View Switcher */}
          <div className="flex items-center gap-3">
            {/* Restaurant Switcher */}
            {restaurants.length > 0 && selectedRestaurant && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <select
                  value={selectedRestaurant._id}
                  onChange={(e) => handleRestaurantChange(e.target.value)}
                  className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id} className="bg-slate-900 text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Switch to Rider Fleet */}
            {onSwitchToRider && (
              <button
                type="button"
                onClick={onSwitchToRider}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 transition shadow-sm"
                title="Switch to rider fleet delivery view"
              >
                <span>Rider Fleet</span>
              </button>
            )}

            {/* Switch to Customer Portal Mode */}
            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white transition shadow-sm"
              title="Switch to customer diner view"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Diner Customer View</span>
              <span className="sm:hidden">Customer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Vendor Sub-Navigation Pills */}
      <div className="bg-slate-900/60 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[
              { id: 'orders', label: 'Live Orders & Kitchen Stream', icon: Bell },
              { id: 'menu', label: 'Menu Catalog & AI Authoring', icon: UtensilsCrossed },
              { id: 'settings', label: 'Profile & Operating Schedules', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === 'orders' ? 'Orders' : tab.id === 'menu' ? 'Menu' : 'Settings'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Menu Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading || !selectedRestaurant ? (
          <div className="py-20 text-center space-y-3">
            <ChefHat className="w-10 h-10 text-slate-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              Loading merchant environment...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <LiveOrders
                restaurantId={selectedRestaurant._id}
                restaurantName={selectedRestaurant.name}
              />
            )}

            {activeTab === 'menu' && (
              <MenuManagement
                restaurantId={selectedRestaurant._id}
                restaurantName={selectedRestaurant.name}
              />
            )}

            {activeTab === 'settings' && (
              <VendorSettings
                restaurant={selectedRestaurant}
                onRestaurantUpdated={(updated) => {
                  setSelectedRestaurant(updated);
                  setRestaurants((prev) =>
                    prev.map((r) => (r._id === updated._id ? updated : r))
                  );
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default VendorPortal;
