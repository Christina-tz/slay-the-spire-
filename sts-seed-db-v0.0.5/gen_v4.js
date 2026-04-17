// STS Seed DB - v4: 标签 + 简介 + 新UI布局
const fs = require('fs');
const path = require('path');

// ===== STS1 种子编码 =====
const STS1_CHARS = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
const STS1_BASE = BigInt(STS1_CHARS.length);

function sts1SeedToString(seedLong) {
    let n = BigInt.asUintN(64, BigInt(seedLong));
    if (n === 0n) return '0';
    let result = '';
    while (n > 0n) {
        result = STS1_CHARS[Number(n % STS1_BASE)] + result;
        n = n / STS1_BASE;
    }
    return result;
}

// ===== 读取 STS1 存档 =====
const sts1Dir = 'F:/steam/steamapps/common/SlayTheSpire/runs';
const sts1Seeds = [];
for (const char of fs.readdirSync(sts1Dir)) {
    const charPath = path.join(sts1Dir, char);
    if (!fs.statSync(charPath).isDirectory()) continue;
    for (const file of fs.readdirSync(charPath).filter(f => f.endsWith('.run'))) {
        try {
            const j = JSON.parse(fs.readFileSync(path.join(charPath, file), 'utf8'));
            const victory = j.victory === true;
            const floor = j.floor_reached || 0;
            const rawSeed = j.seed_played;
            const gameSeed = (rawSeed !== undefined && rawSeed !== 0 && rawSeed !== null)
                ? sts1SeedToString(rawSeed) : 'N/A';
            // 难度: A0-A20 (STS1), A0-A10 (STS2)
            const ascension = j.ascension_level || 0;
            const difficulty = 'A' + ascension;
            sts1Seeds.push({
                id: file.replace('.run', ''),
                char: j.character_chosen || char,
                seed: gameSeed,
                floor,
                victory,
                ascension,
                difficulty,
                label: victory || floor >= 50 ? 'hu' : 'du',
                tags: [],
                description: ''
            });
        } catch(e) {}
    }
}

// ===== 读取 STS2 存档 =====
const sts2Dir = 'C:/Users/29921/AppData/Roaming/SlayTheSpire2/steam/76561199466383061/profile1/saves/history';
const sts2Seeds = [];
if (fs.existsSync(sts2Dir)) {
    for (const file of fs.readdirSync(sts2Dir).filter(f => f.endsWith('.run'))) {
        try {
            const j = JSON.parse(fs.readFileSync(path.join(sts2Dir, file), 'utf8'));
            const victory = j.win === true;
            const ascension = j.ascension || 0;
            const difficulty = 'A' + ascension;
            sts2Seeds.push({
                id: file.replace('.run', ''),
                char: j.players && j.players[0] ? j.players[0].character.replace('CHARACTER.', '') : 'UNKNOWN',
                seed: j.seed || 'N/A',
                floor: 3,
                victory,
                ascension,
                difficulty,
                label: victory ? 'hu' : 'du',
                tags: [],
                description: ''
            });
        } catch(e) {}
    }
}

// 合并数据
const allSeeds = [
    ...sts1Seeds.map(s => ({...s, game: 'STS1'})),
    ...sts2Seeds.map(s => ({...s, game: 'STS2'}))
];

// 统计
const sts1Hu = allSeeds.filter(s => s.game === 'STS1' && s.label === 'hu');
const sts1Du = allSeeds.filter(s => s.game === 'STS1' && s.label === 'du');
const sts2Hu = allSeeds.filter(s => s.game === 'STS2' && s.label === 'hu');
const sts2Du = allSeeds.filter(s => s.game === 'STS2' && s.label === 'du');

console.log('杀戮尖塔1:', sts1Seeds.length, '| 胡:', sts1Hu.length, '| 毒:', sts1Du.length);
console.log('杀戮尖塔2:', sts2Seeds.length, '| 胡:', sts2Hu.length, '| 毒:', sts2Du.length);
console.log('Sample:');
allSeeds.slice(0, 3).forEach(s => console.log(' ', s.game, s.seed, s.char, s.difficulty));

// ===== 生成 HTML =====
const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>STS 种子库</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI','Microsoft YaHei',Arial,sans-serif;background:#0f0f1a;color:#d0d0d0;min-height:100vh;padding:16px;line-height:1.5;}
h1{text-align:center;color:#ff6b9d;margin-bottom:4px;font-size:26px;letter-spacing:2px;}
.subtitle{text-align:center;color:#666;margin-bottom:16px;font-size:12px;}
/* 导航 */
.nav-bar{display:flex;gap:10px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;}
.nav-btn{background:#1a1a2e;color:#888;border:1px solid #333;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:13px;transition:all .2s;}
.nav-btn:hover{background:#252540;color:#fff;}
.nav-btn.active{background:#ff6b9d;color:#fff;border-color:#ff6b9d;font-weight:bold;}
/* 区块 */
.section{display:none;}
.section.active{display:block;}
/* 分类标签 */
.cat-tabs{display:flex;gap:8px;margin-bottom:14px;justify-content:center;flex-wrap:wrap;}
.cat-tab{background:#1a1a2e;color:#666;border:1px solid #2a2a3e;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;}
.cat-tab:hover{background:#252540;color:#aaa;}
.cat-tab.active{background:#3a3a5e;color:#fff;border-color:#5a5a8e;}
/* 导入按钮 */
.import-bar{display:flex;justify-content:center;margin-bottom:16px;}
.btn-import{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:10px 28px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:bold;box-shadow:0 4px 15px rgba(102,126,234,0.4);transition:transform .2s,box-shadow .2s;}
.btn-import:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(102,126,234,0.6);}
/* 种子卡片网格 - 每行2个 */
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;}
.seed-card{cursor:pointer;touch-action:tap;}
.seed-card:hover{border-color:#ff6b9d;transform:translateY(-2px);}
.seed-card{background:#16162a;border-radius:12px;padding:16px;border:1px solid #2a2a44;transition:border-color .2s,transform .2s;}
.seed-card:hover{border-color:#ff6b9d;transform:translateY(-2px);}
.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.char-difficulty{display:flex;gap:8px;align-items:center;}
.char-badge{background:linear-gradient(135deg,#ff6b9d,#ff8a80);color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:bold;}
.diff-badge{background:#2a2a44;color:#888;padding:2px 8px;border-radius:10px;font-size:10px;}
.hudu{font-size:11px;font-weight:bold;padding:2px 8px;border-radius:10px;}
.hu{background:#2e7d32;color:#fff;}
.du{background:#c62828;color:#fff;}
.seed-code{display:flex;gap:8px;align-items:center;margin:10px 0;}
.seed-num{font-family:'Consolas','Monaco',monospace;font-size:16px;color:#64b5f6;word-break:break-all;flex:1;letter-spacing:1px;}
.btn-copy{background:#333;color:#aaa;border:1px solid #444;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;}
.btn-copy:hover{background:#ff6b9d;color:#fff;border-color:#ff6b9d;}
/* 标签 */
.tags{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;}
.tag{background:#2a2a4a;color:#aaa;padding:2px 8px;border-radius:10px;font-size:11px;}
.tag.empty{opacity:0.5;font-style:italic;}.tag::before{content:'#';color:#666;}
.tag.empty{opacity:0.5;font-style:italic;}
/* 简介 */
.description{background:#1a1a2e;padding:10px;border-radius:8px;margin-top:8px;font-size:12px;color:#888;line-height:1.6;max-height:60px;overflow:hidden;}
.description:empty{display:none;}
.meta{font-size:10px;color:#444;margin-top:6px;}.seed-detail{padding:16px;background:#16162a;border-radius:8px;margin:12px 0;}.seed-detail .seed-code{font-size:20px;color:#64b5f6;margin-bottom:8px;}.seed-footer{display:flex;justify-content:space-between;align-items:center;margin-top:12px;}.seed-footer .meta{font-size:12px;color:#888;}.seed-footer .btn-copy{margin-left:auto;}
/* 模态框 */
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center;}
.modal.active{display:flex;}
.modal-content{background:#1a1a2e;border-radius:16px;padding:24px;width:90%;max-width:420px;border:1px solid #333;max-height:90vh;overflow-y:auto;}
.modal h2{color:#ff6b9d;margin-bottom:16px;font-size:18px;}
.form-group{margin-bottom:14px;}
.form-group label{display:block;color:#888;margin-bottom:6px;font-size:12px;}
.form-group input,.form-group select,.form-group textarea{width:100%;background:#0f0f1a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;}
.form-group textarea{resize:vertical;min-height:80px;}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:#ff6b9d;}
/* 详情弹窗样式 */
.modal-header{position:relative;margin-bottom:16px;}
.modal-header h3{color:#fff;font-size:18px;margin:0;}
.close-btn{position:absolute;right:-8px;top:-8px;width:32px;height:32px;background:#c62828;border-radius:50%;border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.close-btn:hover{background:#f44336;transform:scale(1.1);}
.detail-row{display:flex;align-items:flex-start;margin-bottom:12px;}
.detail-label{color:#888;font-size:12px;min-width:50px;}
.detail-value{color:#fff;font-size:14px;}
.detail-value.seed-code{color:#64b5f6;font-size:16px;font-weight:bold;font-family:monospace;}
.detail-tags-box,.detail-desc-box{flex:1;background:#16162a;border-radius:8px;padding:10px;}
.detail-tags-box .tag{background:#252540;padding:4px 10px;border-radius:12px;font-size:11px;margin:2px;}
.detail-tags-box .empty,.detail-desc-box{color:#555;font-size:13px;}
.char-select{display:flex;gap:8px;flex-wrap:wrap;}
.char-option{background:#0f0f1a;border:1px solid #333;padding:6px 12px;border-radius:16px;cursor:pointer;font-size:12px;color:#666;transition:all .2s;}
.char-option:hover{background:#252540;color:#fff;}
.char-option.selected{background:#ff6b9d;color:#fff;border-color:#ff6b9d;}
/* 预设标签 */
.preset-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
.preset-tag{background:#252540;border:1px solid #3a3a5e;padding:4px 10px;border-radius:12px;cursor:pointer;font-size:11px;color:#888;transition:all .2s;}
.preset-tag:hover{background:#3a3a5e;color:#fff;}
.preset-tag.selected{background:#667eea;color:#fff;border-color:#667eea;}
/* 按钮 */
.btn-row{display:flex;gap:10px;margin-top:16px;}
.btn-cancel,.btn-submit{flex:1;padding:12px;border-radius:24px;font-size:14px;cursor:pointer;border:none;transition:all .2s;}
.btn-cancel{background:#333;color:#888;}
.btn-cancel:hover{background:#444;color:#fff;}
.btn-submit{background:linear-gradient(135deg,#ff6b9d,#ff8a80);color:#fff;font-weight:bold;}
.btn-submit:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(255,107,157,0.4);}
.btn-delete{background:#b71c1c;color:#fff;border:none;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:11px;margin-left:auto;}
.btn-delete:hover{background:#d32f2f;}
/* 提示 */
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ff6b9d;color:#fff;padding:10px 24px;border-radius:20px;font-size:14px;display:none;z-index:9999;}
.empty{text-align:center;padding:40px;color:#444;font-size:14px;}
.char-count{font-size:10px;color:#555;text-align:right;margin-top:4px;}
/* 游戏切换 */
.game-tabs{display:flex;gap:8px;margin-bottom:12px;justify-content:center;}
.game-tab{background:transparent;border:1px solid #333;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;color:#666;}
.game-tab.active{background:#ff6b9d;color:#fff;border-color:#ff6b9d;}
</style>
</head>
<body>
<h1>🎴 STS 种子库</h1>
<p class="subtitle">杀戮尖塔 1 &amp; 2 · 种子管理</p>

<div class="nav-bar">
    <button class="nav-btn active" onclick="showGame('all')">全部</button>
    <button class="nav-btn" onclick="showGame('sts1')">杀戮尖塔1</button>
    <button class="nav-btn" onclick="showGame('sts2')">杀戮尖塔2</button>
</div>

<div class="import-bar">
    <button class="btn-import" onclick="openImport()">+ 导入种子</button>
</div>

<!-- 全部 -->
<div id="sec-all" class="section active">
    <div class="game-tabs">
        <button class="game-tab active" onclick="filterGame('all','all')">全部</button>
        <button class="game-tab" onclick="filterGame('all','hu')">胡种</button>
        <button class="game-tab" onclick="filterGame('all','du')">毒种</button>
    </div>
    <div class="cards" id="all-cards"></div>
</div>

<!-- 杀戮尖塔1 -->
<div id="sec-sts1" class="section">
    <div class="game-tabs">
        <button class="game-tab active" onclick="filterGame('sts1','all')">全部</button>
        <button class="game-tab" onclick="filterGame('sts1','hu')">胡种</button>
        <button class="game-tab" onclick="filterGame('sts1','du')">毒种</button>
    </div>
    <div class="cards" id="sts1-cards"></div>
</div>

<!-- 杀戮尖塔2 -->
<div id="sec-sts2" class="section">
    <div class="game-tabs">
        <button class="game-tab active" onclick="filterGame('sts2','all')">全部</button>
        <button class="game-tab" onclick="filterGame('sts2','hu')">胡种</button>
        <button class="game-tab" onclick="filterGame('sts2','du')">毒种</button>
    </div>
    <div class="cards" id="sts2-cards"></div>
</div>

<!-- 导入模态框 -->
<div id="importModal" class="modal">
    <div class="modal-content">
        <h2>导入种子</h2>
        <div class="form-group">
            <label>种子代码</label>
            <input type="text" id="importSeed" placeholder="如: 3F7P8HYF6NZ2">
        </div>
        <div class="form-group">
            <label>游戏</label>
            <select id="importGame">
                <option value="STS1">杀戮尖塔1</option>
                <option value="STS2">杀戮尖塔2</option>
            </select>
        </div>
        <div class="form-group">
            <label>角色</label>
            <div class="char-select" id="charSelect"></div>
        </div>
        <div class="form-group">
            <label>结果</label>
            <select id="importResult">
                <option value="hu">胡种 (通关)</option>
                <option value="du">毒种 (未通关)</option>
            </select>
        </div>
        <div class="form-group">
            <label>难度</label>
            <select id="importDifficulty">
                <option value="A0">A0</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="A6">A6</option>
                <option value="A7">A7</option>
                <option value="A8">A8</option>
                <option value="A9">A9</option>
                <option value="A10">A10</option>
                <option value="A11">A11</option>
                <option value="A12">A12</option>
                <option value="A13">A13</option>
                <option value="A14">A14</option>
                <option value="A15">A15</option>
                <option value="A16">A16</option>
                <option value="A17">A17</option>
                <option value="A18">A18</option>
                <option value="A19">A19</option>
                <option value="A20">A20</option>
            </select>
        </div>
        <div class="form-group">
            <label>自定义标签</label>
            <input type="text" id="importTags" placeholder="输入1-10字，按回车确认" style="margin-top:8px;">
        </div>
        <div class="form-group">
            <label>简介 (可选，150字以内，详细描述路线选择和抓牌选择)</label>
            <textarea id="importDesc" placeholder="添加种子相关描述..." maxlength="150"></textarea>
            <div class="char-count"><span id="descLen">0</span>/150</div>
        </div>
        <div class="btn-row">
            <button class="btn-cancel" onclick="closeImport()">取消</button>
            <button class="btn-submit" onclick="submitImport()">导入</button>
        </div>
    </div>
</div>

<div class="toast" id="toast"></div>

<!-- 详情弹窗 -->
<div id="detailModal" class="modal">
    <div class="modal-content" style="max-width:420px;">
        <div class="modal-header"><h3>种子详情</h3><button class="close-btn" onclick="document.getElementById('detailModal').style.display='none'">×</button></div>
        <div class="detail-row"><span class="detail-label">种子:</span><span id="detailSeed" class="detail-value seed-code"></span></div>
        <div class="detail-row"><span class="detail-label">游戏:</span><span id="detailGame" class="detail-value"></span></div>
        <div class="detail-row"><span class="detail-label">角色:</span><span id="detailChar" class="detail-value"></span></div>
        <div class="detail-row"><span class="detail-label">难度:</span><span id="detailDifficulty" class="detail-value"></span></div>
        <div class="detail-row"><span class="detail-label">标签:</span><div id="detailTags" class="detail-tags-box"></div></div>
        <div class="detail-row"><span class="detail-label">简介:</span><div id="detailDesc" class="detail-desc-box"></div></div>
    </div>
</div>

<script>
// 角色选项
const CHARS_STS1 = [
    {id:'IRONCLAD', name:'战士'},
    {id:'SILENT', name:'猎手'},
    {id:'DEFECT', name:'机器人'},
    {id:'WATCHER', name:'观者'}
];
const CHARS_STS2 = [
    {id:'IRONCLAD', name:'战士'},
    {id:'SILENT', name:'猎手'},
    {id:'DEFECT', name:'机器人'},
    {id:'REGENT', name:'储君'},
    {id:'NECROBINDER', name:'亡灵'}
];

// 初始数据
let seedsData = ${JSON.stringify(allSeeds)};

// 从localStorage加载用户数据
function loadUserData() {
    try {
        const saved = localStorage.getItem('stsSeedData');
        if (saved) {
            const userSeeds = JSON.parse(saved);
            // 合并用户数据到主数据
            userSeeds.forEach(us => {
                const existing = seedsData.find(s => s.seed === us.seed && s.game === us.game);
                if (existing) {
                    existing.tags = us.tags || [];
                    existing.description = us.description || '';
                } else {
                    seedsData.push(us);
                }
            });
        }
    } catch(e) {}
}
loadUserData();

// 统计
function getStats(game) {
    const arr = game === 'all' ? seedsData : seedsData.filter(s => s.game === game);
    const hu = arr.filter(s => s.label === 'hu').length;
    const du = arr.filter(s => s.label === 'du').length;
    return { total: arr.length, hu, du };
}

// 渲染卡片
function makeCard(s) {
    const charMap = {IRONCLAD:'铁甲',THE_SILENT:'静默',SILENT:'静默',DEFECT:'缺陷',WATCHER:'观者',REGENT:'摄政',NECROBINDER:'死灵'};
    const cl = charMap[s.char] || s.char;
    const diff = s.difficulty || '低';
    const hudu = s.label === 'hu' ? '胡种' : '毒种';
    const huduClass = s.label === 'hu' ? 'hu' : 'du';
    const tagsHtml = s.tags && s.tags.length 
        ? '<div class="tags">' + s.tags.map(t => '<span class="tag">'+t+'</span>').join('') + '</div>' 
        : '<div class="tags"><span class="tag empty">#无标签</span></div>';
    const descHtml = s.description 
        ? '<div class="description">'+s.description.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>' 
        : '';
    return '<button class="seed-card" data-seed="'+s.seed+'" data-game="'+s.game+'" onclick="viewSeed(this.dataset.seed)">' +
        '<div class="card-top"><div class="char-difficulty"><span class="char-badge">'+cl+'</span><span class="diff-badge">'+diff+'</span></div><span class="hudu '+huduClass+'">'+hudu+'</span></div>' +
        '<div class="seed-seed"><span class="seed-num">'+s.seed+'</span><span class="btn-copy" onclick="copySeed(event, this.parentElement.dataset.seed)">📋 复制</span></div>' +
        tagsHtml + descHtml +
        '<div class="meta">'+s.game + (s.floor ? ' · '+s.floor+'层' : '')+'</div></button>';
}

function render(containerId, arr) {
    const container = document.getElementById(containerId);
    if (!arr.length) {
        container.innerHTML = '<div class="empty">暂无数据</div>';
        return;
    }
    container.innerHTML = arr.map(makeCard).join('');
}

// 筛选
let currentGame = 'all';
let currentFilter = 'all';

function showGame(game) {
    currentGame = game;
    currentFilter = 'all';
    document.querySelectorAll('.section').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    document.getElementById('sec-' + game.toLowerCase()).classList.add('active');
    event.target.classList.add('active');
    updateGameTabs();
    renderCurrent();
}

function filterGame(game, filter) {
    currentGame = game;
    currentFilter = filter;
    updateGameTabs();
    renderCurrent();
}

function updateGameTabs() {
    const sec = document.getElementById('sec-' + currentGame);
    if (!sec) return;
    sec.querySelectorAll('.game-tab').forEach((btn, i) => {
        const f = ['all','hu','du'][i];
        btn.classList.toggle('active', f === currentFilter);
    });
}

function renderCurrent() {
    const stats = getStats(currentGame);
    let arr = currentGame === 'all' ? seedsData : seedsData.filter(s => s.game.toLowerCase() === currentGame.toLowerCase());
    if (currentFilter !== 'all') {
        arr = arr.filter(s => s.label === currentFilter);
    }
    const containerId = currentGame + '-cards';
    render(containerId, arr);
}

// 复制
function copySeed(event, seed) {
    event.stopPropagation();
    navigator.clipboard.writeText(seed).then(() => showToast('已复制: ' + seed));
}

function viewSeed(seed) {
    const s = seedsData.find(x => x.seed === seed);
    if (!s) return;
    document.getElementById('detailSeed').textContent = s.seed;
    document.getElementById('detailGame').textContent = s.game === 'STS1' ? '杀戮尖塔1' : '杀戮尖塔2';
    // 角色转中文
    const charMap = s.game === 'STS1' ? CHARS_STS1 : CHARS_STS2;
    const charObj = charMap.find(c => c.id === s.char);
    document.getElementById('detailChar').textContent = charObj ? charObj.name : s.char;
    document.getElementById('detailDifficulty').textContent = s.difficulty;
    // 标签
    const tagsEl = document.getElementById('detailTags');
    tagsEl.innerHTML = s.tags.length ? s.tags.map(t => '<span class="tag">'+t+'</span>').join('') : '<span class="empty">无</span>';
    // 简介
    const descEl = document.getElementById('detailDesc');
    descEl.textContent = s.description || '无';
    document.getElementById('detailModal').style.display = 'flex';
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2000);
}

// 导入功能
let selectedChar = '';
let selectedTags = [];

function openImport() {
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importSeed').value = '';
    document.getElementById('importTags').value = '';
    document.getElementById('importDesc').value = '';
    selectedChar = '';
    selectedTags = [];
    renderCharOptions();
    updateDescLen();
}

function renderCharOptions() {
    const game = document.getElementById('importGame').value;
    const chars = game === 'STS2' ? CHARS_STS2 : CHARS_STS1;
    const container = document.getElementById('charSelect');
    container.innerHTML = chars.map(c => 
        '<span class="char-option" data-char="'+c.id+'" onclick="selectChar(this)">'+c.name+'</span>'
    ).join('');
}

// 游戏切换时更新角色选项
document.getElementById('importGame').addEventListener('change', function() {
    selectedChar = '';
    renderCharOptions();
});

// 标签输入回车确认
document.getElementById('importTags').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tag = this.value.trim();
        if (tag.length >= 1 && tag.length <= 10) {
            if (!selectedTags.includes(tag) && selectedTags.length < 5) {
                selectedTags.push(tag);
                renderTags();
            }
            this.value = '';
        } else if (tag.length > 10) {
            showToast('标签限1-10字');
        }
    }
});

function renderTags() {
    const container = document.getElementById('importTags');
    const tagsDisplay = selectedTags.map(t => 
        '<span class="tag" onclick="removeTag(this)">'+t+'×</span>'
    ).join('');
    // 用一个div显示已选标签
    let td = document.getElementById('tagsDisplay');
    if (!td) {
        td = document.createElement('div');
        td.id = 'tagsDisplay';
        td.className = 'tags';
        td.style.marginTop = '8px';
        container.parentNode.insertBefore(td, container.nextSibling);
    }
    td.innerHTML = tagsDisplay;
}

function removeTag(el) {
    const tag = el.textContent.replace('×', '');
    selectedTags = selectedTags.filter(t => t !== tag);
    renderTags();
}

function closeImport() {
    document.getElementById('importModal').classList.remove('active');
}

function selectChar(el) {
    document.querySelectorAll('#charSelect .char-option').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedChar = el.dataset.char;
}

function toggleTag(el) {
    el.classList.toggle('selected');
    const tag = el.textContent;
    if (el.classList.contains('selected')) {
        if (!selectedTags.includes(tag) && selectedTags.length < 3) {
            selectedTags.push(tag);
        }
    } else {
        selectedTags = selectedTags.filter(t => t !== tag);
    }
}

function updateDescLen() {
    const len = document.getElementById('importDesc').value.length;
    document.getElementById('descLen').textContent = len;
}
document.getElementById('importDesc').addEventListener('input', updateDescLen);

function submitImport() {
    const seed = document.getElementById('importSeed').value.trim().toUpperCase();
    const game = document.getElementById('importGame').value;
    const result = document.getElementById('importResult').value;
    const difficulty = document.getElementById('importDifficulty').value;
    const allTags = selectedTags.slice(0, 5);
    const description = document.getElementById('importDesc').value.trim().slice(0, 150);
    
    if (!seed) {
        showToast('请输入种子代码');
        return;
    }
    if (!selectedChar) {
        showToast('请选择角色');
        return;
    }
    
    // 添加或更新
    const existing = seedsData.find(s => s.seed === seed && s.game === game);
    if (existing) {
        existing.tags = allTags;
        existing.description = description;
        existing.char = selectedChar;
        existing.label = result;
        existing.difficulty = difficulty;
    } else {
        seedsData.push({
            seed, game, char: selectedChar, label: result, difficulty,
            floor: 0, victory: result === 'hu', ascension: 0,
            tags: allTags, description
        });
    }
    
    // 保存到localStorage
    const userSeeds = seedsData.filter(s => s.tags?.length || s.description);
    localStorage.setItem('stsSeedData', JSON.stringify(userSeeds));
    
    closeImport();
    renderCurrent();
    showToast('导入成功!');
}

// 初始化
renderCurrent();
</script>

<!-- 详情弹窗 -->
<div id="detailModal" class="modal">
</body>
</html>`;

fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', html, 'utf8');
console.log('\nDone! 输出: index.html');
