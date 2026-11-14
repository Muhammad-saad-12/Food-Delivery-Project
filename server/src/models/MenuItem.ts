import { Schema, model, Document, Types } from 'mongoose';

export interface IMenuItemSize {
  id: string;
  name: string;
  priceDelta: number;
}

export interface IMenuItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  popular: boolean;
  dietaryTags: string[];
  spiceLevels: string[];
  sizes: IMenuItemSize[];
  addOns: IMenuItemAddOn[];
  calories?: number;
  preparationTimeMin?: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },
    dietaryTags: [{ type: String, trim: true }],
    spiceLevels: {
      type: [String],
      default: ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'],
    },
    sizes: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        priceDelta: { type: Number, required: true, default: 0 },
      },
    ],
    addOns: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    calories: { type: Number },
    preparationTimeMin: { type: Number, default: 15 },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ name: 'text', description: 'text', dietaryTags: 'text' });

export const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);
