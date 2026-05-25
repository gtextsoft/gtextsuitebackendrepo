import mongoose, { Document } from "mongoose";

export interface BookmarkDocument extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new mongoose.Schema<BookmarkDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

const Bookmark = mongoose.model<BookmarkDocument>("Bookmark", bookmarkSchema);
export default Bookmark;
