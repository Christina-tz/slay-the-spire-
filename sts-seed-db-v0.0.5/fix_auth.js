const fs = require('fs');
const h = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');

// Find the start of the old auth block - it's the last "// 初始化" comment before </script>
const scriptEnd = h.lastIndexOf('</script>');
const initMarker = '// 初始化\ninitAuth();\nrenderCurrent();';
const initIdx = h.lastIndexOf(initMarker, scriptEnd);
console.log('Old init marker at:', initIdx, 'script end:', scriptEnd);

const newAuthBlock = `
// ===== Supabase Auth =====
var _sbClient = null;
var _sbReady = false;

function _initSupabase() {
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        try {
            _sbClient = window.supabase.createClient(
                'https://YOUR_PROJECT.supabase.co',
                'YOUR_ANON_KEY'
            );
            _sbReady = true;
            _sbClient.auth.getSession().then(({ data: { session } }) => {
                updateAuthUI(session?.user || null);
            });
            _sbClient.auth.onAuthStateChange((_event, session) => {
                updateAuthUI(session?.user || null);
            });
        } catch(e) {
            console.warn('Supabase init failed:', e);
        }
    }
}

(function() {
    var attempts = 0;
    function tryInit() {
        attempts++;
        if (_sbReady) return;
        _initSupabase();
        if (!_sbReady && attempts < 30) setTimeout(tryInit, 500);
    }
    setTimeout(tryInit, 200);
})();

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

async function openImport() {
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
}

// 渲染
renderCurrent();
</script>`;

// Find where "initAuth()" appears before script end - that's the old init
let newH;
if (initIdx >= 0) {
    newH = h.substring(0, initIdx) + newAuthBlock;
} else {
    // Fallback: find last "renderCurrent();" before </script>
    const rcIdx = h.lastIndexOf('renderCurrent();', scriptEnd);
    newH = h.substring(0, rcIdx + 'renderCurrent();'.length) + newAuthBlock;
}

fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', newH);
console.log('Done! New file size:', newH.length);

// Verify
const h2 = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');
console.log('_sbClient:', h2.includes('_sbClient'));
console.log('_sbReady:', h2.includes('_sbReady'));
console.log('_initSupabase:', h2.includes('_initSupabase'));
console.log('supabase.auth (should be 0):', (h2.match(/supabase\.auth\./g)||[]).length);
console.log('_sbClient.auth:', (h2.match(/_sbClient\.auth\./g)||[]).length);
console.log('authModal:', h2.includes('authModal'));
console.log('openAuth:', h2.includes('function openAuth'));
