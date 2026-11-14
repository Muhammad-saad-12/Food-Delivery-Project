import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../../services/api';

export interface RestaurantItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrder: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  image: string;
  bannerImage: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    zip?: string;
  };
  dietaryTags: string[];
  featured: boolean;
  tags: string[];
}

interface CustomerDiscoveryProps {
  onSelectRestaurant: (restaurant: RestaurantItem) => void;
}

const CUISINES = ['All', 'Italian', 'Japanese', 'Mexican', 'Vegan', 'Healthy'];
const DIETARY_OPTIONS = [
  'All',
  'Vegetarian Friendly',
  '100% Vegan',
  'Gluten-Free Options',
  'Halal Options',
];

export const CustomerDiscovery: React.FC<CustomerDiscoveryProps> = ({
  onSelectRestaurant,
}) => {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm, selectedCuisine, selectedDietary, selectedPrice, sortBy]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        sort: sortBy,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (selectedDietary !== 'All') params.dietary = selectedDietary;
      if (selectedPrice !== 'All') params.priceRange = selectedPrice;

      const res = await api.get('/restaurants', { params });
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Search */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Curated Artisanal Dining
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Fresh, Chef-Crafted Meals Delivered to Your Door.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Discover local culinary gems, customize spice levels & ingredients, and ask our AI Concierge for personalized dietary recommendations.
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative flex items-center max-w-lg bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-xl px-4 py-3 focus-within:border-emerald-500 transition">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search restaurants, cuisines (Italian, Ramen, Tacos)..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-slate-400 hover:text-white px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Cuisine Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {CUISINES.map((cuisine) => {
          const isSelected = selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              type="button"
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            Filters:
          </div>

          {/* Dietary Selector */}
          <select
            value={selectedDietary}
            onChange={(e) => setSelectedDietary(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {DIETARY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                Diet: {d}
              </option>
            ))}
          </select>

          {/* Price Range Pills */}
          <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 p-0.5">
            {['All', '$', '$$', '$$$'].map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => setSelectedPrice(price)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition ${
                  selectedPrice === price
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="rating">Rating (Highest)</option>
            <option value="deliveryTime">Fastest Delivery</option>
            <option value="deliveryFee">Lowest Delivery Fee</option>
          </select>
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-3">
          <p className="text-base font-semibold text-slate-200">
            No restaurants matched your filters
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search term, dietary tags, or cuisine preferences.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCuisine('All');
              setSelectedDietary('All');
              setSelectedPrice('All');
            }}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              onClick={() => onSelectRestaurant(restaurant)}
              className="group bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-500/10 transition duration-200 cursor-pointer flex flex-col"
            >
              {/* Image banner */}
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-amber-400 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({restaurant.reviewCount})
                  </span>
                </div>

                {/* Delivery Time Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{restaurant.deliveryTimeMin} mins</span>
                </div>

                {restaurant.featured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    <Sparkles className="w-3 h-3" /> Featured
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {restaurant.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {restaurant.priceRange}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>

                {/* Tags & Fees */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex flex-wrap gap-1">
                    {restaurant.cuisine.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                    {restaurant.dietaryTags.slice(0, 1).map((d) => (
                      <span
                        key={d}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Bike className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {restaurant.deliveryFee === 0 ? 'Free Delivery' : `$${restaurant.deliveryFee.toFixed(2)} Fee`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Min: ${restaurant.minOrder.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
