const fs = require('fs');
let j = fs.readFileSync('./gen_v4.js', 'utf8');
let pos = j.indexOf('viewSeed(chr');
console.log('Pos:', pos);
if(pos > 0) console.log(j.slice(pos, pos+50));
else console.log('Not found');