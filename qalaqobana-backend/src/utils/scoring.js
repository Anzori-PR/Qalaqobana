function calculateScores(categories, allAnswers) {
  const playerScores = {};

  for (const category of categories) {
    const answersByCat = {};

    for (const { userId, answers } of allAnswers) {
      const answerText = answers?.[category]?.trim().toLowerCase() || "";
      answersByCat[answerText] = answersByCat[answerText] || [];
      answersByCat[answerText].push(userId);
    }

    for (const [answer, userIds] of Object.entries(answersByCat)) {
      const points = answer === "" ? 0 : userIds.length === 1 ? 10 : 5;
      for (const id of userIds) {
        playerScores[id] = (playerScores[id] || 0) + points;
      }
    }
  }

  return playerScores;
}

  
module.exports = { calculateScores };
  