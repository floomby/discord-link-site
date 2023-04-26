import mongoose, { ObjectId, Schema, SchemaType } from "mongoose";

interface IProviderLink {
  address: string;
  provider: string;
  providerId: string;
  userId: ObjectId;
  linkedAt: Date;
}

const ProviderLinkSchema = new mongoose.Schema<IProviderLink>({
  address: { type: String, required: true },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  linkedAt: { type: Date, default: Date.now },
});

const ProviderLink =
  (mongoose.models.DiscordLink as mongoose.Model<IProviderLink>) ||
  mongoose.model<IProviderLink>("ProviderLink", ProviderLinkSchema);

interface ILinkable {
  address: string;
  csrfToken: string;
  createdAt: Date;
}

const LinkableSchema = new mongoose.Schema<ILinkable>({
  address: { type: String, required: true, unique: true },
  csrfToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: "5h" },
});

const Linkable =
  (mongoose.models.Linkable as mongoose.Model<ILinkable>) ||
  mongoose.model<ILinkable>("Linkable", LinkableSchema);

export { ProviderLink, Linkable };
