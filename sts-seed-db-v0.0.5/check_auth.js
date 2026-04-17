const fs = require('fs');
const h = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');

// Find auth bar HTML (after import bar)
const authBarPos = h.indexOf('auth-bar');
console.log('auth-bar:', authBarPos);
if (authBarPos >= 0) console.log(h.substring(authBarPos, authBarPos + 300));

// Find any button with openAuth
const oaPos = h.indexOf('openAuth()');
console.log('openAuth() calls:', oaPos);
if (oaPos >= 0) console.log(h.substring(oaPos - 100, oaPos + 200));

// Check if authModal has class="modal" or other display issues
const modalPos = h.indexOf('id="authModal"');
console.log('\nauthModal HTML:');
console.log(h.substring(modalPos, modalPos + 500));
