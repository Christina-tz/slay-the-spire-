const fs = require('fs');
let h = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');

// Step 1: Fix remaining supabase.auth -> _sbClient.auth in handleLogin
h = h.replace(
    'const { data, error } = await supabase.auth.signInWithPassword({ email, password });',
    'const { error } = await _sbClient.auth.signInWithPassword({ email, password });'
);

// Step 2: Fix supabase.auth.signUp in handleSignup  
h = h.replace(
    'const { error } = await supabase.auth.signUp({ email, password });',
    'const { error } = await _sbClient.auth.signUp({ email, password });'
);

// Step 3: Fix supabase.auth.signOut in logout
h = h.replace(
    "await supabase.auth.signOut();",
    "await _sbClient.auth.signOut();"
);

// Step 4: Fix openImport in main body
h = h.replace(
    `async function openImport() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { openAuth(); showToast('登录后可导入种子'); return; }`,
    `async function openImport() {
    if (!_sbReady) { showToast('Auth系统加载中，请稍候'); return; }
    const { data: { session } } = await _sbClient.auth.getSession();
    if (!session) { openAuth(); showToast('登录后可导入种子'); return; }`
);

// Verify
const issues = [];
let idx = 0;
while ((idx = h.indexOf('supabase.auth.', idx)) >= 0) {
    issues.push(h.substring(Math.max(0,idx-30), idx+50));
    idx++;
}
console.log('Remaining supabase.auth. issues:', issues.length ? issues : 'NONE - CLEAN!');
console.log('_sbClient.auth count:', (h.match(/_sbClient\.auth\./g)||[]).length);

// Step 5: Make sure _initSupabase is present (it's the new auth initialization)
const hasInit = h.includes('function _initSupabase()');
const hasClient = h.includes('var _sbClient = null');
const hasReady = h.includes('var _sbReady = false');
console.log('Has _initSupabase:', hasInit);
console.log('Has _sbClient:', hasClient);
console.log('Has _sbReady:', hasReady);

if (issues.length === 0 && hasInit && hasClient && hasReady) {
    fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', h);
    console.log('✅ File saved successfully!');
} else {
    console.log('❌ Still has issues, not saving');
}
