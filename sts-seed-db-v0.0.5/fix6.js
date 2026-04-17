const fs = require('fs');
const j = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js', 'utf8');

const target = 'onclick="viewSeed(\\'+s.seed+\')"';
const replacement = 'data-seed="+s.seed+" onclick="viewSeed(this.dataset.seed)"';

const newJ = j.replace(target, replacement);

fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js', newJ);
console.log('Done!');