import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Star, Flame, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const REVIEW_TAGS = [
  'Authentic Flavor',
  'Super Spicy',
  'Generous Portions',
  'Hot & Fresh',
  'Crispy & Tender',
  'Chef Recommended',
  'Great Packaging',
];

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  dishName?: string;
  menuItemId?: string;
  onReviewSubmitted?: (review: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  dishName,
  menuItemId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [spiceRating, setSpiceRating] = useState<number>(4);
  const [customerName, setCustomerName] = useState('Saad Khan');
  const [customerEmail, setCustomerEmail] = useState('saad@example.pk');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Authentic Flavor']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please provide your name');
      return;
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setErrorMsg('Please write a brief comment (at least 3 characters)');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        restaurantId,
        menuItemId: menuItemId || undefined,
        dishName: dishName || undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'guest@example.pk',
        rating,
        spiceRating,
        comment: comment.trim(),
        tags: selectedTags,
      };

      const res = await api.post('/reviews', payload);
      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted(res.data.review);

      setTimeout(() => {
        setSubmitted(false);
        setComment('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.errors?.[0]?.msg || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-white tracking-tight">
                  {dishName ? `Review: ${dishName}` : `Rate ${restaurantName}`}
                </Dialog.Title>
                <p className="text-xs text-slate-400">
                  {restaurantName} • Verified Dining Experience
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Review Published!</h3>
              <p className="text-xs text-slate-400">
                Thank you for your valuable culinary feedback.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* 5-Star Rating Selector */}
              <div className="space-y-1.5 text-center py-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">
                  Overall Star Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            active
                              ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400">
                  {rating === 5 && 'Outstanding • 5.0 Stars'}
                  {rating === 4 && 'Very Good • 4.0 Stars'}
                  {rating === 3 && 'Average • 3.0 Stars'}
                  {rating <= 2 && 'Needs Improvement'}
                </span>
              </div>

              {/* Spice Accuracy Rating */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Spice Level Accuracy:
                  </span>
                  <span className="font-mono text-orange-400 text-[11px]">
                    {spiceRating}/5 Chilies
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((chili) => (
                    <button
                      key={chili}
                      type="button"
                      onClick={() => setSpiceRating(chili)}
                      className={`flex-1 py-1 rounded-lg border text-xs font-bold transition ${
                        spiceRating >= chili
                          ? 'border-orange-500/80 bg-orange-500/10 text-orange-400'
                          : 'border-slate-800 bg-slate-950 text-slate-600'
                      }`}
                    >
                      🌶️ {chili}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Highlights & Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Written Comment */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Your Review</label>
                  <span className="text-slate-500 font-mono text-[11px]">{comment.length}/1000</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about flavor balance, portion size, temperature upon delivery..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
              >
                {submitting ? 'Submitting Review...' : 'Publish Review & Rating'}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
