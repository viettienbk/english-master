const fs = require('fs');
const path = require('path');

const seedDir = 'backend/prisma/seed/';
const files = [
  'vocabulary.json',
  'extra_vocabulary.json',
  'oxford_3000.json',
  'oxford_3000_batch2.json',
  'oxford_3000_batch3.json',
  'oxford_3000_batch4.json',
  'oxford_3000_batch5.json',
  'oxford_3000_batch6.json'
];

const existingWords = new Set();

files.forEach(file => {
  const filePath = path.join(seedDir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.forEach(topic => {
      topic.words.forEach(w => {
        existingWords.add(w.word.toLowerCase());
      });
    });
  }
});

fs.writeFileSync('existing_unique_words.json', JSON.stringify(Array.from(existingWords), null, 2));
console.log(`Saved ${existingWords.size} unique words to existing_unique_words.json`);
