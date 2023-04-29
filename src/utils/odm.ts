import mongoose, { type ObjectId, Schema } from "mongoose";

interface IProviderLink {
  discordId: string;
  provider: string;
  providerId: string;
  userId: ObjectId;
  linkedAt: Date;
  revokedAt?: Date;
}

const ProviderLinkSchema = new mongoose.Schema<IProviderLink>({
  discordId: { type: String, required: true },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId },
  linkedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date },
});

const ProviderLink =
  (mongoose.models.ProviderLink as mongoose.Model<IProviderLink>) ||
  mongoose.model<IProviderLink>("ProviderLink", ProviderLinkSchema);

export interface ILinkable {
  discordId: string;
  csrfToken: string;
  createdAt: Date;
}

const LinkableSchema = new mongoose.Schema<ILinkable>({
  discordId: { type: String, required: true, unique: true },
  csrfToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: "5h" },
});

const Linkable =
  (mongoose.models.Linkable as mongoose.Model<ILinkable>) ||
  mongoose.model<ILinkable>("Linkable", LinkableSchema);

export { ProviderLink, Linkable };
