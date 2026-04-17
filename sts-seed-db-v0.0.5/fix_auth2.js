const fs = require('fs');
const h = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');
const scriptEnd = h.lastIndexOf('</script>');
console.log('File length:', h.length, 'Script end:', scriptEnd);

// Step 1: Fix the OLD openImport() in the main body (pos ~44754)
const OLD_OPEN_IMPORT = `async function openImport() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { openAuth(); showToast('登录后可导入种子'); return; }
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importSeed').value = '';
    document.getElementById('importTags').value = '';
    document.getElementById('importDesc').value = '';
    selectedChar = '';
    selectedTags = [];
    renderCharOptions();
    updateDescLen();
}`;

const FIXED_OPEN_IMPORT = `async function openImport() {
    if (!_sbReady) { showToast('Auth系统加载中，请稍候'); return; }
    const { data: { session } } = await _sbClient.auth.getSession();
    if (!session) { openAuth(); showToast('登录后可导入种子'); return; }
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importSeed').value = '';
    document.getElementById('importTags').value = '';
    document.getElementById('importDesc').value = '';
    selectedChar = '';
    selectedTags = [];
    renderCharOptions();
    updateDescLen();
}`;

let h2 = h.replace(OLD_OPEN_IMPORT, FIXED_OPEN_IMPORT);
console.log('Step 1 - Fixed old openImport, file length:', h2.length);

// Step 2: Replace the old auth block (old handleLogin/signup/logout) with clean versions
// These old functions come after "// ===== Supabase Auth =====" in the file
const oldAuthBlockStart = h2.lastIndexOf('// ===== Supabase Auth =====');
console.log('Old auth block start:', oldAuthBlockStart);

const NEW_AUTH_END = `
// ===== Auth UI 函数 =====
// (auth UI functions included above)
`;

// Build the clean ending that replaces everything from the old auth block to </script>
const cleanEnding = `
// ===== Auth UI 函数 =====
function updateAuthUI(user) {
    document.getElementById('auth-loading').style.display = 'none';
    if (user) {
        document.getElementById('btn-auth').style.display = 'none';
        document.getElementById('auth-user').style.display = 'inline';
        document.getElementById('auth-user').textContent = '👤 ' + (user.email || user.id).split('@')[0];
        document.getElementById('btn-logout').style.display = 'inline-block';
    } else {
        document.getElementById('btn-auth').style.display = 'inline-block';
        document.getElementById('auth-user').style.display = 'none';
        document.getElementById('btn-logout').style.display = 'none';
    }
}

function openAuth() { document.getElementById('authModal').classList.add('active'); switchAuthTab('login'); }
function closeAuth() { document.getElementById('authModal').classList.remove('active'); }

function switchAuthTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
    document.getElementById('auth-login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('auth-signup-form').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
}

async function handleLogin() {
    if (!_sbReady) { document.getElementById('login-error').textContent = 'Auth系统加载中，请刷新重试'; return; }
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) { document.getElementById('login-error').textContent = '请填写邮箱和密码'; return; }
    const { error } = await _sbClient.auth.signInWithPassword({ email, password });
    if (error) {
        document.getElementById('login-error').textContent = error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message;
    } else {
        closeAuth();
        document.getElementById('importModal').classList.add('active');
        showToast('登录成功！');
    }
}

async function handleSignup() {
    if (!_sbReady) { document.getElementById('signup-error').textContent = 'Auth系统加载中，请刷新重试'; return; }
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    if (!email || !password) { document.getElementById('signup-error').textContent = '请填写所有字段'; return; }
    if (password.length < 6) { document.getElementById('signup-error').textContent = '密码至少6位'; return; }
    if (password !== confirm) { document.getElementById('signup-error').textContent = '两次密码不一致'; return; }
    const { error } = await _sbClient.auth.signUp({ email, password });
    if (error) {
        document.getElementById('signup-error').textContent = error.message;
    } else {
        closeAuth();
        showToast('注册成功！请查收验证邮件');
    }
}

async function logout() {
    if (!_sbReady) return;
    await _sbClient.auth.signOut();
    showToast('已退出登录');
}

// 渲染
renderCurrent();
</script>`;

h2 = h2.substring(0, oldAuthBlockStart) + cleanEnding;
console.log('Step 2 - Replaced auth block, file length:', h2.length);

// Verify
const supabaseAuthCount = (h2.match(/supabase\.auth\./g) || []).length;
const sbClientAuthCount = (h2.match(/_sbClient\.auth\./g) || []).length;
console.log('supabase.auth. remaining:', supabaseAuthCount);
console.log('_sbClient.auth. count:', sbClientAuthCount);

fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', h2);
console.log('File written! Final size:', h2.length);

// Final check
const h3 = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');
let idx = 0, issues = [];
while ((idx = h3.indexOf('supabase.auth.', idx)) >= 0) {
    issues.push(h3.substring(idx - 30, idx + 60));
    idx++;
}
console.log('Remaining supabase.auth issues:', issues.length ? issues : 'None - CLEAN!');
console.log('_sbClient defined:', h3.includes('var _sbClient = null'));
console.log('_sbReady defined:', h3.includes('var _sbReady = false'));
console.log('_initSupabase defined:', h3.includes('function _initSupabase'));
console.log('updateAuthUI:', h3.includes('function updateAuthUI'));
console.log('handleLogin:', h3.includes('async function handleLogin'));
