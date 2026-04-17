const fs = require('fs');
let j = fs.readFileSync('C:\\Users\\29921\\.qclaw\\workspace\\projects\\sts-seed-db\\gen_v4.js', 'utf8');

// 检查当前行
const oldLine = "onclick=\"viewSeed(\\'+s.seed+'\\')\"";
const newLine = 'onclick="viewSeed(this.dataset.seed)"';

// 修复makeCard中的按钮
j = j.replace(
    /<button class="btn-copy" onclick="viewSeed\(''\+s\.seed\+''\)">/g,
    '<button class="btn-copy" data-seed="+s.seed+" onclick="viewSeed(this.dataset.seed)">'
);

fs.writeFileSync('C:\\Users\\29921\\.qclaw\\workspace\\projects\\sts-seed-db\\gen_v4.js', j);
console.log('Fixed makeCard onclick');