const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  categories: [String],
  currentLetter: String,
  usedLetters: [String],
  round: { type: Number, default: 0 },
  status: { type: String, enum: ['waiting', 'playing', 'scoring'], default: 'waiting' },
  roundData: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      answers: mongoose.Schema.Types.Mixed
    }
  ],
  chatMessages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Disable versioning on this model
gameSchema.set('versionKey', false);

module.exports = mongoose.model('Game', gameSchema);