import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Plus,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { MenuItemOption } from '../../components/customer/FoodCustomizationModal';
import { formatPKR } from '../../utils/currency';

const COMMON_CATEGORIES = [
  'All',
  'Traditional Karahi & Handi',
  'Wood-Fired Pizza',
  'Handcrafted Pasta',
  'Gourmet Burgers',
  'Signature Ramen',
  'Specialty Sushi',
  'Street Tacos & Cantina',
  'Nourish Bowls & Salads',
  'Antipasti & Starters',
  'Artisanal Desserts & Sweets',
  'Beverages & Elixirs',
];

const DIETARY_OPTIONS = [
  'Halal',
  'Vegetarian',
  '100% Vegan',
  'Gluten-Free',
  'High Protein',
  'Dairy-Free',
  'Chef Special',
  'Organic',
];

interface MenuManagementProps {
  restaurantId: string;
  restaurantName: string;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  restaurantId,
  restaurantName,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemOption | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chef Specials');
  const [price, setPrice] = useState<number>(650);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [popular, setPopular] = useState(false);
  const [dietaryTags, setDietaryTags] = useState<string[]>(['Halal']);
  const [spiceLevels, setSpiceLevels] = useState<string[]>(['None', 'Mild', 'Medium', 'Hot']);
  const [sizes, setSizes] = useState<Array<{ id: string; name: string; priceDelta: number }>>([
    { id: 'size-reg', name: 'Regular Portion', priceDelta: 0 },
  ]);
  const [addOns, setAddOns] = useState<Array<{ id: string; name: string; price: number }>>([]);

  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu', {
        params: { restaurantId },
      });
      setMenuItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Chef Specials');
    setPrice(650);
    setDescription('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setIsAvailable(true);
    setPopular(false);
    setDietaryTags(['Halal']);
    setSpiceLevels(['None', 'Mild', 'Medium', 'Hot']);
    setSizes([{ id: 'size-reg', name: 'Regular Portion', priceDelta: 0 }]);
    setAddOns([]);
    setAiSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItemOption) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setDescription(item.description);
    setImage(item.image);
    setIsAvailable(item.isAvailable !== undefined ? item.isAvailable : true);
    setPopular(item.popular || false);
    setDietaryTags(item.dietaryTags || []);
    setSpiceLevels(item.spiceLevels || ['None', 'Mild', 'Medium', 'Hot']);
    setSizes(item.sizes || [{ id: 'size-reg', name: 'Regular Portion', priceDelta: 0 }]);
    setAddOns(item.addOns || []);
    setAiSuccessMsg('');
    setIsModalOpen(true);
  };

  // AI Menu Item Description & Tag Generator
  const handleGenerateWithAI = async () => {
    if (!name.trim()) {
      alert('Please enter a dish name first (e.g. "Mutton Shinwari Karahi", "Truffle Burrata Pizza")');
      return;
    }

    try {
      setIsGeneratingAI(true);
      setAiSuccessMsg('');

      const res = await api.post('/ai/generate-menu-item', {
        name: name.trim(),
        category,
        keywords: description,
      });

      const generated = res.data.item;
      if (generated) {
        if (generated.description) setDescription(generated.description);
        if (generated.category) setCategory(generated.category);
        if (generated.dietaryTags?.length) setDietaryTags(generated.dietaryTags);
        if (generated.spiceLevels?.length) setSpiceLevels(generated.spiceLevels);
        if (generated.suggestedPrice && (!price || price === 650)) {
          setPrice(generated.suggestedPrice);
        }
        if (generated.sizes?.length) setSizes(generated.sizes);
        if (generated.addOns?.length) setAddOns(generated.addOns);

        setAiSuccessMsg(
          `✨ AI generated description, category, tags, sizes and add-ons (${res.data.source})!`
        );
      }
    } catch (err) {
      console.error('AI Generator Error:', err);
      alert('Failed to generate AI description. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleToggleDietaryTag = (tag: string) => {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddSize = () => {
    const id = `size-${Date.now()}`;
    setSizes((prev) => [...prev, { id, name: 'Large Portion', priceDelta: 300 }]);
  };

  const handleRemoveSize = (id: string) => {
    setSizes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddAddOn = () => {
    const id = `addon-${Date.now()}`;
    setAddOns((prev) => [...prev, { id, name: 'Extra Sauce / Raita', price: 100 }]);
  };

  const handleRemoveAddOn = (id: string) => {
    setAddOns((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    try {
      const payload = {
        restaurantId,
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        description: description.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable,
        popular,
        dietaryTags,
        spiceLevels,
        sizes,
        addOns,
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, payload);
      } else {
        await api.post('/menu', payload);
      }

      setIsModalOpen(false);
      fetchMenuItems();
    } catch (err) {
      console.error('Failed to save menu item:', err);
      alert('Error saving menu item. Please verify all fields.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/menu/${id}`);
      setMenuItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Menu Catalog & AI Authoring
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {restaurantName} • Manage dishes, portion variants, add-ons, and AI copywriting
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {COMMON_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-3">
          <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Menu Items Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have dishes matching this search. Use the "Add New Dish" button above to craft your first plate using the AI Assistant!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
            >
              {/* Item Image & Badges */}
              <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {item.popular && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3" /> Chef Pick
                  </span>
                )}

                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs font-mono font-extrabold text-white">
                  {formatPKR(item.price)}
                </span>

                <span className="absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300">
                  {item.category}
                </span>
              </div>

              {/* Item Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryTags?.slice(0, 3).map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        {d}
                      </span>
                    ))}
                    {item.sizes && item.sizes.length > 1 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {item.sizes.length} Sizes
                      </span>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {item.addOns.length} Add-ons
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isAvailable !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {item.isAvailable !== false ? 'Available' : 'Sold Out'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 transition"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={deletingId === item._id}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MENU ITEM MODAL WITH AI GENERATOR */}
      <Dialog.Root open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl z-50 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-white tracking-tight">
                    {editingItem ? `Edit Dish: ${editingItem.name}` : 'Add New Gourmet Dish'}
                  </Dialog.Title>
                  <p className="text-xs text-slate-400">
                    Use our AI generator to author rich descriptions, tags, and variants instantly
                  </p>
                </div>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* AI Auto-Generation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Menu Copywriter & Strategist
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Type a dish name (e.g. "Mutton Shinwari Karahi", "Truffle Burger") and click generate.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 shrink-0 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAI ? 'AI Authoring...' : 'Generate with AI'}</span>
                </button>
              </div>

              {aiSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              {/* Main Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Dish Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mutton Shinwari Karahi / Truffle Burrata Margherita"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category *</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Traditional Karahi, Wood-Fired Pizza"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Base Price (Rs.) *</label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-300">Dish Description</label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {description.length} characters
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe culinary textures, authentic ingredients, slow-cooking or grilling notes..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Dietary Tags Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">
                  Dietary Tags & Badges
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((tag) => {
                    const isSelected = dietaryTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleDietaryTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-xl border transition ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portion Sizes / Variants Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Portion Sizes / Variants
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    + Add Size Option
                  </button>
                </div>

                <div className="space-y-2">
                  {sizes.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800"
                    >
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSizes((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder="e.g. Regular Portion / 14-inch"
                        className="flex-1 bg-transparent text-xs text-white px-2 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 font-mono">+Rs.</span>
                      <input
                        type="number"
                        step="10"
                        value={s.priceDelta}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSizes((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, priceDelta: val } : item
                            )
                          );
                        }}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none"
                      />
                      {sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(s.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Optional Add-ons & Extra Toppings
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAddOn}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    + Add Topping
                  </button>
                </div>

                <div className="space-y-2">
                  {addOns.map((a, idx) => (
                    <div
                      key={a.id || idx}
                      className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800"
                    >
                      <input
                        type="text"
                        value={a.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddOns((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder="e.g. Extra Truffle Shavings / Roghni Naan"
                        className="flex-1 bg-transparent text-xs text-white px-2 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 font-mono">+Rs.</span>
                      <input
                        type="number"
                        step="10"
                        value={a.price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAddOns((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                          );
                        }}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAddOn(a.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Active & In Stock (Orderable)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                  />
                  <span>Mark as Chef Special / Popular</span>
                </label>
              </div>

              {/* Footer Save */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
