const fs = require('fs');
let h = fs.readFileSync('C:\\Users\\29921\\.qclaw\\workspace\\projects\\sts-seed-db\\index.html', 'utf8');
let p = h.indexOf('<div class="form-group">\n            <label>角色</label>');
console.log(h.slice(p, p + 2500));