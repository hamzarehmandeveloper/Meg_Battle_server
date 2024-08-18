import mongoose from 'mongoose';

const userCardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tab: { type: String, required: true },
  name: { type: String, required: true },
  cardId: { type: Number, required: true },
  level: { type: Number, required: true, default: 1 },
  cost: { type: Number, required: true },
  profitPerHour: { type: Number, required: true },
  activatedAt: { type: Date, default: Date.now },
});

const UserCard = mongoose.model('UserCards', userCardSchema, 'UserCards');
export default UserCard;
