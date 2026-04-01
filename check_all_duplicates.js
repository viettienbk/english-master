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

const wordMap = new Map();
let totalWords = 0;

files.forEach(file => {
  const filePath = path.join(seedDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.forEach(topic => {
    topic.words.forEach(w => {
      const wordLower = w.word.toLowerCase();
      totalWords++;
      if (wordMap.has(wordLower)) {
        wordMap.get(wordLower).push(`${file} (${topic.name})`);
      } else {
        wordMap.set(wordLower, [`${file} (${topic.name})`]);
      }
    });
  });
});

console.log(`Total words processed: ${totalWords}`);
console.log(`Unique words: ${wordMap.size}`);

const duplicates = [];
wordMap.forEach((occurrences, word) => {
  if (occurrences.length > 1) {
    duplicates.push({ word, occurrences });
  }
});

console.log(`Total duplicates: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.log('Sample duplicates:');
  duplicates.slice(0, 10).forEach(d => {
    console.log(`- ${d.word}: ${d.occurrences.join(', ')}`);
  });
}
