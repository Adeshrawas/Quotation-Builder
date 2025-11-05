import mongoose from "mongoose";

const rateSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  rate: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // associate rate to user
});

export default mongoose.model("Rate", rateSchema);
