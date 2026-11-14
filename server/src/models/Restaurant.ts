import { Schema, model, Document, Types } from 'mongoose';

export interface IOperatingHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

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
    areaOrLandmark?: string;
    state?: string;
    zip?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  operatingHours?: IOperatingHour[];
  isOpen: boolean;
  vendorPhone?: string;
  vendorEmail?: string;
  dietaryTags: string[];
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const defaultOperatingHours: IOperatingHour[] = [
  { day: 'Monday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Tuesday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Wednesday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Thursday', open: '11:00', close: '23:00', isClosed: false },
  { day: 'Friday', open: '13:00', close: '00:00', isClosed: false },
  { day: 'Saturday', open: '11:00', close: '00:00', isClosed: false },
  { day: 'Sunday', open: '11:00', close: '23:00', isClosed: false },
];

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
      city: { type: String, default: 'Islamabad' },
      areaOrLandmark: { type: String, default: 'F-7 Markaz' },
      state: { type: String, default: 'Federal Capital' },
      zip: { type: String, default: '44000' },
    },
    coordinates: {
      lat: { type: Number, default: 33.7214 },
      lng: { type: Number, default: 73.0560 },
    },
    operatingHours: {
      type: [
        {
          day: { type: String, required: true },
          open: { type: String, required: true },
          close: { type: String, required: true },
          isClosed: { type: Boolean, default: false },
        },
      ],
      default: defaultOperatingHours,
    },
    isOpen: { type: Boolean, default: true },
    vendorPhone: { type: String, default: '0300-1234567' },
    vendorEmail: { type: String, default: 'vendor@restaurant.local' },
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
