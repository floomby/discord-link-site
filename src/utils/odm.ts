import mongoose, { SchemaType } from "mongoose";

interface ILinkUser {
  address: string;
  csrfToken: string;
  discordId: string;
}

const LinkUserSchema = new mongoose.Schema<ILinkUser>({
  address: { type: String, required: true, unique: true },
  csrfToken: { type: String, required: true, unique: true },
  discordId: { type: String },
});

export default (mongoose.models.LinkUser as mongoose.Model<ILinkUser>) ||
  mongoose.model<ILinkUser>("LinkUser", LinkUserSchema);
