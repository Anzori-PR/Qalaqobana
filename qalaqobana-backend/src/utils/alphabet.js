const alphabet = ["ა", "ბ", "გ", "დ", "ე", "ვ", "ზ", "თ", "ი", "კ", "ლ", "მ", "ნ", "ო", "პ", "ჟ", "რ", "ს", "ტ", "უ", "ფ", "ქ", "ღ", "ყ", "შ", "ჩ", "ც", "ძ", "წ", "ჭ", "ხ", "ჯ", "ჰ"];

function getRandomLetter(exclude = []) {
  const available = alphabet.filter(l => !exclude.includes(l));
  return available[Math.floor(Math.random() * available.length)];
}

module.exports = { getRandomLetter };
