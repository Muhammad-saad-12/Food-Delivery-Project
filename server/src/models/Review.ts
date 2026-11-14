import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  restaurantId: Types.ObjectId | string;
  menuItemId?: string;
  dishName?: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1 to 5
  spiceRating?: number; // 1 to 5 (spice accuracy)
  comment: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    restaurantId: { type: Schema.Types.Mixed, required: true, index: true },
    menuItemId: { type: String, index: true },
    dishName: { type: String },
    orderId: { type: String },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    spiceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Written review comment is required'],
      trim: true,
      minlength: [3, 'Comment must be at least 3 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ restaurantId: 1, menuItemId: 1 });

export const Review = model<IReview>('Review', reviewSchema);
