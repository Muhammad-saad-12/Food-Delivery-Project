import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  Sparkles,
  MapPin,
  Search,
  Plus,
  Flame,
  Utensils,
  MessageSquarePlus,
} from 'lucide-react';
import api from '../../services/api';
import { RestaurantItem } from './CustomerDiscovery';
import { MenuItemOption } from '../../components/customer/FoodCustomizationModal';
import { ReviewModal } from '../../components/customer/ReviewModal';
import { formatPKR } from '../../utils/currency';

interface RestaurantDetailProps {
  restaurant: RestaurantItem;
  onBack: () => void;
  onSelectItemForCustomization: (item: MenuItemOption) => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurant,
  onBack,
  onSelectItemForCustomization,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetDish, setReviewTargetDish] = useState<{
    dishName?: string;
    menuItemId?: string;
  }>({});

  useEffect(() => {
    fetchRestaurantMenu();
    fetchRestaurantReviews();
  }, [restaurant._id]);

  const fetchRestaurantMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/restaurants/${restaurant._id}`);
      const items: MenuItemOption[] = (res.data.menuItems || []).map((m: any) => ({
        ...m,
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
      }));
      setMenuItems(items);

      const cats = Array.from(new Set(items.map((i) => i.category)));
      setCategories(['All', ...cats]);
    } catch (err) {
      console.error('Failed to fetch restaurant menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantReviews = async () => {
    try {
      const res = await api.get('/reviews', {
        params: { restaurantId: restaurant._id },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleOpenReview = (dishName?: string, menuItemId?: string) => {
    setReviewTargetDish({ dishName, menuItemId });
    setIsReviewModalOpen(true);
  };

  // Filter items by category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !menuSearch.trim() ||
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoriesToDisplay =
    selectedCategory === 'All'
      ? categories.filter((c) => c !== 'All')
      : [selectedCategory];

  return (
    <div className="space-y-8 pb-20">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all restaurants
      </button>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={restaurant.bannerImage || restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Restaurant Profile Content */}
        <div className="p-6 sm:p-8 -mt-20 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider">
                  Open Now
                </span>
                {restaurant.priceRange && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300">
                    {restaurant.priceRange}
                  </span>
                )}
                {restaurant.cuisine.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {restaurant.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {/* Quick Metrics & Leave Review Action */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md self-start sm:self-auto shrink-0 shadow-lg">
              <div className="text-center px-2">
                <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {restaurant.reviewCount} reviews
                </span>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div className="text-center px-2">
                <div className="flex items-center gap-1 text-sm font-bold text-white">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{restaurant.deliveryTimeMin} min</span>
                </div>
                <span className="text-[10px] text-slate-400">Delivery Time</span>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div className="text-center px-2">
                <div className="flex items-center gap-1 text-sm font-bold text-white">
                  <Bike className="w-4 h-4 text-emerald-400" />
                  <span>{formatPKR(restaurant.deliveryFee)}</span>
                </div>
                <span className="text-[10px] text-slate-400">Delivery Fee</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReview()}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/20 transition"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            </div>
          </div>

          {/* Dietary & Address badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-300">Specialties:</span>
              {restaurant.dietaryTags.map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {restaurant.address?.street}, {restaurant.address?.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category & Search Navigation Bar */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Menu Search Input */}
        <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Detailed Menu Section Grouped by Category */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="space-y-3">
              <div className="h-6 w-40 bg-slate-800 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-36 bg-slate-900/60 rounded-2xl animate-pulse" />
                <div className="h-36 bg-slate-900/60 rounded-2xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <Utensils className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            No dishes found matching your selection
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try switching category tabs or clearing your search term.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {categoriesToDisplay.map((cat) => {
            const itemsInCat = filteredItems.filter((i) => i.category === cat);
            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {cat}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {itemsInCat.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemsInCat.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 flex gap-4 transition shadow-md hover:shadow-lg flex-col sm:flex-row justify-between"
                    >
                      {/* Left: Dish Information */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">
                              {item.name}
                            </h3>
                            {item.popular && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Sparkles className="w-3 h-3" /> Popular
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Badges: Spice, Dietary, Calories */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.spiceLevels && item.spiceLevels.length > 1 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                              <Flame className="w-3 h-3" /> Spice Customization
                            </span>
                          )}
                          {item.dietaryTags?.map((d) => (
                            <span
                              key={d}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            >
                              {d}
                            </span>
                          ))}
                          {item.sizes && item.sizes.length > 1 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {item.sizes.length} sizes
                            </span>
                          )}
                        </div>

                        {/* Price and Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-base font-extrabold text-white font-mono">
                            {formatPKR(item.price)}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Dish Review Shortcut */}
                            <button
                              type="button"
                              onClick={() => handleOpenReview(item.name, item._id)}
                              className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                              title="Rate this dish"
                            >
                              <Star className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onSelectItemForCustomization(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-semibold text-xs border border-emerald-500/20 hover:border-emerald-500 transition shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Customize & Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Dish Image Thumbnail */}
                      <div className="relative w-full sm:w-28 sm:h-28 h-40 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Reviews & Dish Ratings Section */}
      {reviews.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Verified Customer Reviews
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {reviews.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenReview()}
              className="text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              + Add Your Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {rev.customerName}
                    </h4>
                    {rev.dishName && (
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        Reviewed: {rev.dishName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        restaurantId={restaurant._id}
        restaurantName={restaurant.name}
        dishName={reviewTargetDish.dishName}
        menuItemId={reviewTargetDish.menuItemId}
        onReviewSubmitted={() => fetchRestaurantReviews()}
      />
    </div>
  );
};
