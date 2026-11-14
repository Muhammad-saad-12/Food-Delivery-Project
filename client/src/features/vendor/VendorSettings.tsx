import React, { useState } from 'react';
import {
  Store,
  Clock,
  MapPin,
  Save,
  CheckCircle2,
  Power,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { RestaurantItem } from '../customer/CustomerDiscovery';

const AVAILABLE_CUISINES = [
  'Pakistani Desi',
  'Shinwari BBQ & Karahi',
  'Fast Food & Burgers',
  'Wood-Fired Pizza',
  'Handcrafted Pasta',
  'Japanese & Sushi',
  'Chinese & Pan-Asian',
  'Biryani & Pulao',
  'Continental',
  'Healthy & Organic',
  'Cafe & Beverages',
  'Artisanal Desserts',
];

const DEFAULT_HOURS = [
  { day: 'Monday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Tuesday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Wednesday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Thursday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Friday', open: '13:00', close: '00:00', isClosed: false },
  { day: 'Saturday', open: '11:00', close: '00:00', isClosed: false },
  { day: 'Sunday', open: '11:00', close: '23:00', isClosed: false },
];

interface VendorSettingsProps {
  restaurant: RestaurantItem;
  onRestaurantUpdated: (updated: RestaurantItem) => void;
}

export const VendorSettings: React.FC<VendorSettingsProps> = ({
  restaurant,
  onRestaurantUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'location'>('profile');

  // Profile State
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [image, setImage] = useState(restaurant.image);
  const [bannerImage, setBannerImage] = useState(restaurant.bannerImage);
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$'>(
    restaurant.priceRange || '$$'
  );
  const [cuisines, setCuisines] = useState<string[]>(restaurant.cuisine || ['Pakistani Desi']);
  const [vendorPhone, setVendorPhone] = useState('0300-8594210');
  const [vendorEmail, setVendorEmail] = useState('management@restaurant.local');
  const [isOpen, setIsOpen] = useState(restaurant.isOpen !== false);

  // Delivery & Location State
  const [street, setStreet] = useState(restaurant.address?.street || '42 Gourmet Avenue, Sector F-7');
  const [city, setCity] = useState(restaurant.address?.city || 'Islamabad');
  const [areaOrLandmark, setAreaOrLandmark] = useState('F-7 Markaz (Jinnah Super)');
  const [deliveryFee, setDeliveryFee] = useState<number>(restaurant.deliveryFee || 180);
  const [deliveryTimeMin, setDeliveryTimeMin] = useState<number>(
    restaurant.deliveryTimeMin || 25
  );
  const [minOrder, setMinOrder] = useState<number>(restaurant.minOrder || 600);

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState(DEFAULT_HOURS);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleCuisine = (c: string) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleUpdateSchedule = (
    index: number,
    field: 'open' | 'close' | 'isClosed',
    value: any
  ) => {
    setOperatingHours((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleApplyAllHours = () => {
    const monday = operatingHours[0];
    setOperatingHours(
      DEFAULT_HOURS.map((h) => ({
        ...h,
        open: monday.open,
        close: monday.close,
        isClosed: monday.isClosed,
      }))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        name,
        description,
        image,
        bannerImage,
        priceRange,
        cuisine: cuisines,
        isOpen,
        vendorPhone,
        vendorEmail,
        deliveryFee: Number(deliveryFee),
        deliveryTimeMin: Number(deliveryTimeMin),
        minOrder: Number(minOrder),
        address: {
          street,
          city,
          areaOrLandmark,
          state: 'Federal Capital',
          zip: '44000',
        },
        operatingHours,
      };

      const res = await api.put(`/restaurants/${restaurant._id}`, payload);
      onRestaurantUpdated(res.data.restaurant);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update vendor settings:', err);
      alert('Error updating restaurant profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Restaurant Profile & Onboarding
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Merchant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your kitchen profile, branding, operating schedules, and Pakistani delivery zones
          </p>
        </div>

        {/* Master Kitchen Online/Offline Toggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              isOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/15'
                : 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/15'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Kitchen Accepting Orders' : 'Kitchen Closed'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Restaurant profile and schedules saved successfully! Changes are live across the customer portal.</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'profile', label: 'Brand & Cuisines', icon: Store },
          { id: 'hours', label: 'Operating Schedules', icon: Clock },
          { id: 'location', label: 'Location & Delivery Zones', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & BRANDING */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Restaurant Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">About / Brand Story</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Logo / Thumbnail Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Cover Banner Image URL</label>
              <input
                type="text"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Official Merchant Contact Phone</label>
              <input
                type="text"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Merchant Contact Email</label>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Pricing Tier</label>
              <div className="flex gap-2">
                {(['$', '$$', '$$$', '$$$$'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPriceRange(tier)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${
                      priceRange === tier
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cuisine Multi-select */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
              Cuisines & Culinary Specialties *
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CUISINES.map((c) => {
                const isSelected = cuisines.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleToggleCuisine(c)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATING SCHEDULES */}
      {activeTab === 'hours' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Opening & Closing Hours</h3>
              <p className="text-xs text-slate-400">
                Customers can only place orders when your kitchen schedule is marked active.
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyAllHours}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
            >
              Apply Monday Schedule to All Days
            </button>
          </div>

          <div className="space-y-3">
            {operatingHours.map((schedule, idx) => (
              <div
                key={schedule.day}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  schedule.isClosed
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-60'
                    : 'border-slate-800 bg-slate-950/80'
                }`}
              >
                <div className="w-28 font-bold text-xs text-white">
                  {schedule.day}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Open:</span>
                    <input
                      type="time"
                      value={schedule.open}
                      disabled={schedule.isClosed}
                      onChange={(e) => handleUpdateSchedule(idx, 'open', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <span className="text-slate-600">—</span>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Close:</span>
                    <input
                      type="time"
                      value={schedule.close}
                      disabled={schedule.isClosed}
                      onChange={(e) => handleUpdateSchedule(idx, 'close', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateSchedule(idx, 'isClosed', !schedule.isClosed)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                    schedule.isClosed
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {schedule.isClosed ? 'Closed Today' : 'Open for Orders'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOCATION & DELIVERY SETTINGS */}
      {activeTab === 'location' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Physical Restaurant Location & Pakistani Delivery Coverage
            </h3>
            <p className="text-xs text-slate-400">
              Set your kitchen address and delivery pricing configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Shop 4, Plaza 12, Main Boulevard"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Peshawar">Peshawar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Area / Landmark</label>
              <input
                type="text"
                value={areaOrLandmark}
                onChange={(e) => setAreaOrLandmark(e.target.value)}
                placeholder="Sector F-7 Markaz / Gulberg III"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Delivery Fee (PKR / Rs.)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Estimated Delivery Time (Mins)</label>
              <input
                type="number"
                min="5"
                value={deliveryTimeMin}
                onChange={(e) => setDeliveryTimeMin(parseInt(e.target.value) || 25)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Minimum Order Amount (PKR / Rs.)</label>
              <input
                type="number"
                step="50"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
