const fs = require('fs');

const part1 = JSON.parse(fs.readFileSync('backend/prisma/seed/oxford_3000_batch2_part1.json', 'utf8'));
const part2 = JSON.parse(fs.readFileSync('backend/prisma/seed/oxford_3000_batch2_part2.json', 'utf8'));

const finalData = [...part1, ...part2];

fs.writeFileSync('backend/prisma/seed/oxford_3000_batch2.json', JSON.stringify(finalData, null, 2));

// Cleanup temporary files
fs.unlinkSync('backend/prisma/seed/oxford_3000_batch2_part1.json');
fs.unlinkSync('backend/prisma/seed/oxford_3000_batch2_part2.json');
fs.unlinkSync('generate_oxford_1_5.js');
fs.unlinkSync('generate_oxford_6_10.js');
