const fs = require('fs');
const j = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js', 'utf8');

// Split the target to avoid escaping issues
const p1 = 'onclick="viewSeed(';
const p2 = '+s.seed+';
const p3 = ')"';
const target = p1 + p2 + p3;
const replacement = 'data-seed="+s.seed+" onclick="viewSeed(this.dataset.seed)"';

const newJ = j.replace(target, replacement);
if (newJ === j) {
    console.log('Not replaced');
} else {
    fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/gen_v4.js', newJ);
    console.log('Fixed!');