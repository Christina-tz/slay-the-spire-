const fs = require('fs');
let h = fs.readFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', 'utf8');

// ==========================================
// 策略：基于特征字符串做替换（minified文件）
// ==========================================

// ---- 1. submitImport: 找函数体，用新版本替换 ----
const SUBMIT_START = 'function submitImport() {';
const SUBMIT_END = "showToast('导入成功!');";
const si = h.indexOf(SUBMIT_START);
const ei = h.indexOf(SUBMIT_END, si + SUBMIT_START.length);
console.log('submitImport: start=' + si + ' end=' + ei);

if (si >= 0 && ei > si) {
    const newSubmit = `async function submitImport() {
    const seed = document.getElementById('importSeed').value.trim().toUpperCase();
    const game = document.getElementById('importGame').value;
    const result = document.getElementById('importResult').value;
    const difficulty = document.getElementById('importDifficulty').value;
    const allTags = selectedTags.slice(0, 5);
    const description = document.getElementById('importDesc').value.trim().slice(0, 150);
    if (!seed) { showToast('请输入种子代码'); return; }
    if (!selectedChar) { showToast('请选择角色'); return; }
    if (!_sbReady) { showToast('数据库加载中，请稍候'); return; }
    const { data: { session } } = await _sbClient.auth.getSession();
    if (!session) { closeImport(); openAuth(); showToast('请先登录'); return; }
    const userId = session.user.id;
    const { error } = await _sbClient.from('seeds').upsert({
        user_id: userId, seed: seed, game: game, character: selectedChar,
        tags: allTags, description: description, victory: result === 'hu', floor_reached: 0
    }, { onConflict: 'user_id,seed,game' });
    if (error) { showToast('导入失败：' + error.message); return; }
    const existing = seedsData.find(s => s.seed === seed && s.game === game);
    if (existing) {
        Object.assign(existing, { tags: allTags, description, char: selectedChar, label: result, difficulty });
    } else {
        seedsData.push({ seed, game, char: selectedChar, label: result, difficulty, floor: 0, victory: result === 'hu', ascension: 0, tags: allTags, description });
    }
    const userSeeds = seedsData.filter(s => s.tags?.length || s.description);
    localStorage.setItem('stsSeedData', JSON.stringify(userSeeds));
    closeImport();
    renderCurrent();
    showToast('导入成功!');
}`;
    h = h.substring(0, si) + newSubmit + h.substring(ei + SUBMIT_END.length);
    console.log('submitImport replaced. File size:', h.length);
}

// ---- 2. loadUserData: 替换为 loadSeedsFromDB ----
const LOAD_START = 'function loadUserData() {';
const LOAD_END = 'loadUserData();';
const li = h.indexOf(LOAD_START);
const lj = h.indexOf(LOAD_END, li + LOAD_START.length);
console.log('loadUserData: start=' + li + ' end=' + lj);

if (li >= 0 && lj > li) {
    const newLoad = `async function loadSeedsFromDB() {
    if (!_sbReady) { setTimeout(loadSeedsFromDB, 300); return; }
    const { data, error } = await _sbClient.from('seeds').select('*').order('created_at', { ascending: false });
    if (error) { console.warn('加载种子失败:', error.message); return; }
    if (!data) return;
    data.forEach(row => {
        const existing = seedsData.find(s => s.seed === row.seed && s.game === row.game);
        if (existing) {
            if (!existing.tags?.length && row.tags?.length) existing.tags = row.tags;
            if (!existing.description && row.description) existing.description = row.description;
        } else {
            seedsData.push({ seed: row.seed, game: row.game, char: row.character || '', label: row.victory ? 'hu' : 'du', difficulty: 'A0', floor: row.floor_reached || 0, victory: row.victory || false, ascension: 0, tags: row.tags || [], description: row.description || '' });
        }
    });
    renderCurrent();
}
(function waitForSB() { if (_sbReady) { loadSeedsFromDB(); } else { setTimeout(waitForSB, 200); } })();`;
    h = h.substring(0, li) + newLoad + h.substring(lj + LOAD_END.length);
    console.log('loadUserData replaced. File size:', h.length);
}

// ---- 3. 验证 ----
const hasUpsert = h.includes('from(\'seeds\').upsert');
const hasSelect = h.includes("from('seeds').select");
const hasAsyncSubmit = h.includes('async function submitImport()');
console.log('Has upsert:', hasUpsert);
console.log('Has select:', hasSelect);
console.log('Has async submitImport:', hasAsyncSubmit);

// JS语法检查
const si2 = h.indexOf('<script>') + 8;
const ei2 = h.lastIndexOf('</script>');
const js = h.slice(si2, ei2);
try {
    new Function(js);
    console.log('✅ JS syntax OK');
} catch(e) {
    console.error('❌ SYNTAX ERROR:', e.message);
    // Show context
    const lines = js.split('\n');
    const m = e.message.match(/at position (\d+)/);
    if (m) console.log('Error around position:', js.substring(Math.max(0,m[1]-50), m[1]+100));
}

fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', h);
console.log('Saved! Final size:', h.length);
