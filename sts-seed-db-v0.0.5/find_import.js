const fs = require('fs');
const h = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');
const si = h.indexOf('function submitImport');
console.log(h.substring(si, si + 1500));
