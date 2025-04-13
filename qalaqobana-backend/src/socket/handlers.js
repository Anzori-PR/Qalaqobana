const mongoose = require('mongoose');
const { getRandomLetter } = require("../utils/alphabet");
const { calculateScores } = require("../utils/scoring");
const { generateRoomCode } = require("../utils/roomCode");
const Game = require("../models/Game");
const User = require("../models/User");
const playerDrafts = {}; // { [roomCode]: { [userId]: draftAnswers } }
const totalScores = {};

module.exports = function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Add user authentication data to socket
    socket.on('authenticate', ({ userId, username }) => {
      socket.userId = userId;
      socket.username = username;
    });

    // Room Creation
    socket.on("createRoom", async ({ userId, categories }, callback) => {
      const roomCode = generateRoomCode();
      const room = await Game.create({
        roomCode,
        creatorId: userId,
        players: [new mongoose.Types.ObjectId(userId)],
        categories,
        roundData: [],
        chatMessages: [] // Add chat history storage
      });

      socket.join(roomCode);
      io.to(roomCode).emit("roomUpdate", room);
      callback({ success: true, roomCode });
    });

    // Room Joining
    socket.on("joinRoom", async ({ userId, roomCode, username }, callback) => {
      const room = await Game.findOne({ roomCode });
      if (!room) return callback?.({ success: false, message: "ოთახი არ მოიძებნა" });

      if (!room.players.includes(userId)) {
        room.players.push(userId);
        await room.save();
      }

      const updatedRoom = await Game.findById(room._id);
      socket.join(roomCode);

      const users = await User.find({ _id: { $in: updatedRoom.players } });

      const playersInfo = users.map(user => ({
        userId: user._id.toString(),
        username: user.username,
        score: totalScores[roomCode]?.[user._id.toString()] || 0,
      }));

      if (!totalScores[roomCode]) totalScores[roomCode] = {};
      for (const player of playersInfo) {
        if (!totalScores[roomCode][player.userId]) {
          totalScores[roomCode][player.userId] = 0;
        }
      }

      // Send room update with chat history
      io.to(roomCode).emit("roomUpdate", {
        roomCode,
        players: playersInfo,
        categories: updatedRoom.categories,
        creatorId: updatedRoom.creatorId.toString(),
        score: totalScores[roomCode][userId] || 0,
        chatHistory: updatedRoom.chatMessages || []
      });

      callback?.({ success: true });
    });

    // chatMessage
    socket.on('chatMessage', async ({ roomCode, userId, message }) => {
      try {
        const user = await User.findById(userId);
        if (!user) return;

        const chatMessage = {
          roomCode,
          senderId: userId,
          senderUsername: user.username,
          message,
          timestamp: new Date(),
        };

        // Save and emit
        await Game.findOneAndUpdate(
          { roomCode },
          { $push: { chatMessages: chatMessage } },
          { new: true }
        );

        io.to(roomCode).emit('chatMessage', chatMessage); // Matches .listen('chatMessage')
      } catch (err) {
        console.error(err);
        socket.emit('chatError', { message: 'Failed to send' });
      }
    });


    // Game Start
    socket.on("startGame", async ({ roomCode, userId }, callback) => {
      let room = await Game.findOne({ roomCode });

      if (!room) return callback?.({ success: false, message: "ოთახი არ მოიძებნა" });

      if (room.creatorId.toString() !== userId) {
        return callback?.({ success: false, message: "მხოლოდ თამაშის შემქმნელს შეუძლია დაწყება." });
      }

      if (room.status === "playing") {
        return callback?.({ success: false, message: "თამაში უკვე მიმდინარეობს." });
      }

      room = await Game.findById(room._id);

      // 🧼 Clear previous roundData when new game starts
      room.roundData = [];

      const newLetter = getRandomLetter();
      room.currentLetter = newLetter;
      room.status = "playing";

      await room.save();

      await Game.findOneAndUpdate(
        { _id: room._id },
        { $set: { currentLetter: newLetter, status: "playing" } },
        { new: true }
      );

      io.to(roomCode).emit("gameStarted", {
        letter: newLetter,
        categories: room.categories,
      });

      const leaderboard = Object.entries(totalScores[roomCode] || {})
        .map(async ([userId, totalScore]) => {
          const user = await User.findById(userId);
          return {
            userId,
            username: user?.username || 'Unknown',
            score: totalScore
          };
        })
        .sort((a, b) => b.score - a.score);

      io.to(roomCode).emit('leaderboardUpdate', leaderboard);

      callback?.({ success: true });
    });

    // Edit score manually
    socket.on("updateScore", async ({ roomCode, userId, newScore }) => {
      if (!totalScores[roomCode]) totalScores[roomCode] = {};
      totalScores[roomCode][userId] = newScore;

      // Optional: emit leaderboard if you still want it
      const leaderboard = Object.entries(totalScores[roomCode]).map(([userId, score]) => ({
        userId,
        score
      }));
      io.to(roomCode).emit("leaderboardUpdate", leaderboard);

      // Send fresh roomUpdate with updated scores
      const room = await Game.findOne({ roomCode });
      if (!room) return;

      const users = await User.find({ _id: { $in: room.players } });
      const playersInfo = users.map(user => ({
        userId: user._id.toString(),
        username: user.username,
        score: totalScores[roomCode][user._id.toString()] || 0
      }));

      io.to(roomCode).emit("roomUpdate", {
        roomCode,
        players: playersInfo,
        categories: room.categories,
        creatorId: room.creatorId.toString(),
        chatHistory: room.chatMessages || []
      });
    });



    // Draft Answers
    socket.on('draftAnswers', ({ roomCode, userId, draft }) => {
      if (!playerDrafts[roomCode]) playerDrafts[roomCode] = {};
      playerDrafts[roomCode][userId] = draft;
    });

    // Stop Round
    socket.on("stopRound", async ({ roomCode }) => {
      const room = await Game.findOne({ roomCode }).populate("players");

      if (room.status !== "playing") {
        return; // Prevent duplicate scoring
      }

      room.status = "waiting"; // Mark round as finished

      const submittedAnswers = playerDrafts[roomCode] || {};

      for (const player of room.players) {
        const userId = player._id.toString();
        const draft = submittedAnswers[userId] || {};
        room.roundData.push({ userId, answers: draft });
      }

      await room.save();

      const scores = calculateScores(room.categories, room.roundData);
      const users = await User.find({ _id: { $in: Object.keys(scores) } });

      for (const userId in scores) {
        if (!totalScores[roomCode]) totalScores[roomCode] = {};
        if (!totalScores[roomCode][userId]) {
          totalScores[roomCode][userId] = 0;
        }
        totalScores[roomCode][userId] += scores[userId];
      }

      const scoreArray = users.map((user) => ({
        userId: user._id,
        username: user.username,
        score: scores[user._id] || 0,
      }));

      io.to(roomCode).emit("roundResults", {
        scores: scoreArray,
        allAnswers: [...room.roundData],
      });

      const leaderboard = await Promise.all(
        Object.entries(totalScores[roomCode] || {}).map(async ([userId, totalScore]) => {
          const user = await User.findById(userId);
          return {
            userId,
            username: user?.username || 'Unknown',
            score: totalScore
          };
        })
      );

      leaderboard.sort((a, b) => b.score - a.score);
      io.to(roomCode).emit('leaderboardUpdate', leaderboard);


      delete playerDrafts[roomCode];
    });

    // Disconnection
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};