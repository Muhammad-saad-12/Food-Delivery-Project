import { Schema, model, Document } from 'mongoose';

export type SupportStatus = 'pending' | 'reviewed' | 'resolved';
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportUserType = 'customer' | 'vendor' | 'rider' | 'guest';
export type SupportCategory =
  | 'order_issue'
  | 'payment_refund'
  | 'delivery_delay'
  | 'food_quality'
  | 'app_bug'
  | 'restaurant_inquiry'
  | 'general';

export interface ISupportTicket extends Document {
  ticketId: string;
  name: string;
  email: string;
  phone?: string;
  userType: SupportUserType;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  orderNumber?: string;
  restaurantName?: string;
  subject: string;
  message: string;
  adminNotes?: string;
  resolution?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    userType: {
      type: String,
      enum: ['customer', 'vendor', 'rider', 'guest'],
      default: 'customer',
    },
    category: {
      type: String,
      enum: [
        'order_issue',
        'payment_refund',
        'delivery_delay',
        'food_quality',
        'app_bug',
        'restaurant_inquiry',
        'general',
      ],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolution: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });

export const SupportTicket = model<ISupportTicket>('SupportTicket', supportTicketSchema);
