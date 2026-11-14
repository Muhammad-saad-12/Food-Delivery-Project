import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Flame, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';

export interface MenuItemOption {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  dietaryTags?: string[];
  spiceLevels?: string[];
  sizes?: Array<{ id: string; name: string; priceDelta: number }>;
  addOns?: Array<{ id: string; name: string; price: number }>;
  calories?: number;
  preparationTimeMin?: number;
  deliveryFee?: number;
}

interface FoodCustomizationModalProps {
  item: MenuItemOption | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodCustomizationModal: React.FC<FoodCustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();

  const [selectedSize, setSelectedSize] = useState<{ id: string; name: string; priceDelta: number } | null>(null);
  const [selectedSpice, setSelectedSpice] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Initialize defaults whenever item changes
  useEffect(() => {
    if (item) {
      if (item.sizes && item.sizes.length > 0) {
        setSelectedSize(item.sizes[0]);
      } else {
        setSelectedSize(null);
      }

      if (item.spiceLevels && item.spiceLevels.length > 0) {
        setSelectedSpice(item.spiceLevels[0]);
      } else {
        setSelectedSpice('');
      }

      setSelectedAddOns([]);
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  // Calculate unit price dynamically
  const sizeDelta = selectedSize?.priceDelta || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.price + sizeDelta + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (addOn: { id: string; name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        menuItemId: item._id,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName || 'Gourmet Kitchen',
        name: item.name,
        basePrice: item.price,
        image: item.image,
        size: selectedSize,
        spiceLevel: selectedSpice,
        selectedAddOns,
        specialInstructions,
        quantity,
        deliveryFee: item.deliveryFee,
      })
    );
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl z-50 overflow-hidden">
          {/* Header Image & Close */}
          <div className="relative h-48 w-full bg-slate-950 shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>

            {item.popular && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Chef Favorite
              </span>
            )}
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            <div>
              <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                {item.name}
              </Dialog.Title>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                {item.description}
              </p>

              {item.dietaryTags && item.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.calories && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      {item.calories} kcal
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 1. Size / Variant Selection */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-sm font-semibold text-slate-200 block">
                  Select Size / Portion <span className="text-xs text-rose-400 font-normal">*Required</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.sizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm text-left transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{size.name}</span>
                        <span className="text-xs text-slate-400">
                          {size.priceDelta > 0 ? `+$${size.priceDelta.toFixed(2)}` : 'Standard'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Spice Level Selection */}
            {item.spiceLevels && item.spiceLevels.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Spice Level
                  </label>
                  <span className="text-xs text-slate-400">Tailored to your taste</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {item.spiceLevels.map((level) => {
                    const isSelected = selectedSpice === level;
                    const isHot = /hot|fire|extreme|chili/i.test(level);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedSpice(level)}
                        className={`p-2.5 rounded-xl border text-xs text-center font-medium transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {isHot && '🌶️ '}
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Add-ons Selection */}
            {item.addOns && item.addOns.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200 block">
                    Optional Add-ons & Extra Toppings
                  </label>
                  <span className="text-xs text-slate-400">Select any</span>
                </div>
                <div className="space-y-2">
                  {item.addOns.map((addOn) => {
                    const isChecked = selectedAddOns.some((a) => a.id === addOn.id);
                    return (
                      <div
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition ${
                          isChecked
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white'
                            : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-700 bg-slate-800'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm">{addOn.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">
                          +${addOn.price.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Special Instructions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-sm font-semibold text-slate-200 block">
                Special Kitchen Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Allergies, dress on the side, extra crispy crust, cutlery requests..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>

          {/* Modal Footer with Quantity and Add Button */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-semibold text-white min-w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 text-slate-400 hover:text-white transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 font-bold py-3 px-5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-between"
            >
              <span>Add to Order</span>
              <span>${totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
