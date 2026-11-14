import { Schema, model, Document, Types } from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  image?: string;
  size?: {
    id: string;
    name: string;
    priceDelta: number;
  } | null;
  spiceLevel?: string | null;
  selectedAddOns?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  restaurantId: Types.ObjectId | string;
  restaurantName: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: {
    street: string;
    city: string;
    areaOrLandmark: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    specialNotes?: string;
  };
  payment: {
    method: 'cod' | 'jazzcash' | 'easypaisa';
    status: 'pending' | 'completed' | 'paid';
    accountNumber?: string;
    transactionRef?: string;
    paidAt?: Date;
  };
  pricing: {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    tip: number;
    total: number;
  };
  status:
    | 'placed'
    | 'confirmed'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  items: IOrderItem[];
  timeline: Array<{
    status: string;
    timestamp: Date;
    note: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    restaurantId: { type: Schema.Types.Mixed, required: true, index: true },
    restaurantName: { type: String, required: true },
    customerId: { type: String },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true, default: 'Islamabad' },
      areaOrLandmark: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      specialNotes: { type: String },
    },
    payment: {
      method: {
        type: String,
        enum: ['cod', 'jazzcash', 'easypaisa'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'paid'],
        default: 'pending',
      },
      accountNumber: { type: String },
      transactionRef: { type: String },
      paidAt: { type: Date },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      tip: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: [
        'placed',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'placed',
      index: true,
    },
    items: [
      {
        menuItemId: { type: String, required: true },
        name: { type: String, required: true },
        basePrice: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        itemTotal: { type: Number, required: true },
        image: { type: String },
        size: {
          id: { type: String },
          name: { type: String },
          priceDelta: { type: Number },
        },
        spiceLevel: { type: String },
        selectedAddOns: [
          {
            id: { type: String },
            name: { type: String },
            price: { type: Number },
          },
        ],
        specialInstructions: { type: String },
      },
    ],
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = model<IOrder>('Order', orderSchema);
