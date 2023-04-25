import mongoose, { ObjectId, Schema, SchemaType } from "mongoose";

interface IDiscordLink {
  address: string;
  discordId: string;
  userId: ObjectId;
}

const DiscordLinkSchema = new mongoose.Schema<IDiscordLink>({
  address: { type: String, required: true, unique: true },
  discordId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, unique: true },
});

const DiscordLink =
  (mongoose.models.DiscordLink as mongoose.Model<IDiscordLink>) ||
  mongoose.model<IDiscordLink>("DiscordLink", DiscordLinkSchema);

interface ITwitterLink {
  address: string;
  twitterId: string;
  userId: ObjectId;
}

const TwitterLinkSchema = new mongoose.Schema<ITwitterLink>({
  address: { type: String, required: true, unique: true },
  twitterId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, unique: true },
});

const TwitterLink =
  (mongoose.models.TwitterLink as mongoose.Model<ITwitterLink>) ||
  mongoose.model<ITwitterLink>("TwitterLink", TwitterLinkSchema);

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

export { DiscordLink, TwitterLink, Linkable };
