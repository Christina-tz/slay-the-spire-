const fs = require('fs');
let j = fs.readFileSync('C:\\Users\\29921\\.qclaw\\workspace\\projects\\sts-seed-db\\gen_v4.js', 'utf8');
j = j.replace(/onclick="viewSeed\(''\+s\.seed\+'\)"/g, 'onclick="viewSeed(this.dataset.seed)"');
fs.writeFileSync('C:\\Users\\29921\\.qclaw\\workspace\\projects\\sts-seed-db\\gen_v4.js', j);
console.log('Fixed makeCard onclick');