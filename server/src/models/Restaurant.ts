import { Schema, model, Document, Types } from 'mongoose';

export interface IRestaurant extends Document {
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
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  isOpen: boolean;
  dietaryTags: string[];
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    cuisine: [{ type: String, trim: true }],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    deliveryTimeMin: { type: Number, default: 30 },
    deliveryFee: { type: Number, default: 2.99 },
    minOrder: { type: Number, default: 15.0 },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    image: { type: String, required: true },
    bannerImage: { type: String, required: true },
    address: {
      street: { type: String, default: '123 Gourmet Ave' },
      city: { type: String, default: 'Metro City' },
      state: { type: String, default: 'CA' },
      zip: { type: String, default: '90210' },
    },
    isOpen: { type: Boolean, default: true },
    dietaryTags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

restaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text', tags: 'text' });

export const Restaurant = model<IRestaurant>('Restaurant', restaurantSchema);
