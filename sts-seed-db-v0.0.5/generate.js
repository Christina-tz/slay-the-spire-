// STS Seed Database Generator
// 读取所有游戏存档，生成带分类筛选的 HTML 页面

const fs = require('fs');
const path = require('path');

// ==================== STS1 读取 ====================
const sts1Dir = 'F:/steam/steamapps/common/SlayTheSpire/runs';
const sts1Seeds = [];

const charFolders = fs.readdirSync(sts1Dir);
for (const char of charFolders) {
    const charPath = path.join(sts1Dir, char);
    if (!fs.statSync(charPath).isDirectory()) continue;
    const files = fs.readdirSync(charPath).filter(f => f.endsWith('.run'));
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(charPath, file), 'utf8');
            const j = JSON.parse(content);
            const charName = j.character_chosen || char;
            const victory = j.victory === true;
            const floor = j.floor_reached || 0;
            // 判断胡/毒：通关或到50+为胡，反之为毒
            const label = victory || floor >= 50 ? 'hu' : 'du';
            sts1Seeds.push({
                id: file.replace('.run', ''),
                char: charName,
                seed: j.seed_played || 'N/A',
                floor,
                victory,
                label
            });
        } catch(e) {}
    }
}

// ==================== STS2 读取 ====================
const sts2Dir = 'C:/Users/29921/AppData/Roaming/SlayTheSpire2/steam/76561199466383061/profile1/saves/history';
const sts2Seeds = [];

if (fs.existsSync(sts2Dir)) {
    const files = fs.readdirSync(sts2Dir).filter(f => f.endsWith('.run'));
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(sts2Dir, file), 'utf8');
            const j = JSON.parse(content);
            const char = j.players && j.players[0] ? j.players[0].character.replace('CHARACTER.', '') : 'UNKNOWN';
            const victory = j.win === true;
            // STS2 通关=3个act全通
            const label = victory ? 'hu' : 'du';
            sts2Seeds.push({
                id: file.replace('.run', ''),
                char,
                seed: j.seed || 'N/A',
                floor: 3,
                victory,
                label
            });
        } catch(e) {}
    }
}

// 合并所有种子
const allSeeds = [
    ...sts1Seeds.map(s => ({...s, game: 'STS1'})),
    ...sts2Seeds.map(s => ({...s, game: 'STS2'}))
];

// 随机分配（模拟"标注"）
// 胡/毒已经在上面按胜负判断了，这里保持原样

// 生成 HTML
const charLabels = {
    'IRONCLAD': '铁甲', 'THE_SILENT': '静默', 'SILENT': '静默',
    'DEFECT': '缺陷', 'WATCHER': '观者', 'REGENT': '摄政',
    'NECROBINDER': '死灵', 'UNKNOWN': '未知'
};

function getCharLabel(c) {
    return charLabels[c] || c;
}

function makeCard(seed) {
    const charLbl = getCharLabel(seed.char);
    const typeLabel = seed.label === 'hu' ? '胡种' : '毒种';
    const typeClass = seed.label === 'hu' ? 'type-hu' : 'type-du';
    const winTag = seed.victory ? '<span class="tag-win">通关</span>' : '';
    const copyBtn = `copy${seed.id}`;
    return `<div class="seed-card">
        <div class="seed-header">
            <span class="char-badge">${charLbl}</span>
            <span class="${typeClass}">${typeLabel}</span>
            ${winTag}
        </div>
        <div class="seed-seed">
            <span class="seed-num" id="seed-${seed.id}">${seed.seed}</span>
            <button class="btn-copy" onclick="copySeed('${seed.seed}', '${copyBtn}')">复制</button>
        </div>
        <div class="seed-meta">
            ${seed.game} · 楼层: ${seed.floor}
        </div>
    </div>`;
}

// STS1 胡/毒
const sts1Hu = allSeeds.filter(s => s.game === 'STS1' && s.label === 'hu');
const sts1Du = allSeeds.filter(s => s.game === 'STS1' && s.label === 'du');
const sts2Hu = allSeeds.filter(s => s.game === 'STS2' && s.label === 'hu');
const sts2Du = allSeeds.filter(s => s.game === 'STS2' && s.label === 'du');

const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>STS 种子库 - STS1 &amp; STS2</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #e0e0e0; min-height: 100vh; padding: 20px; }
h1 { text-align: center; color: #e94560; margin-bottom: 8px; font-size: 28px; }
.subtitle { text-align: center; color: #888; margin-bottom: 24px; font-size: 14px; }

/* 主导航 */
.nav-bar { display: flex; gap: 12px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
.nav-btn { background: #16213e; color: #aaa; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 15px; transition: all 0.2s; }
.nav-btn:hover { background: #1f3460; color: #fff; }
.nav-btn.active { background: #e94560; color: #fff; border-color: #e94560; font-weight: bold; }

/* 分类区块 */
.section { display: none; }
.section.active { display: block; }

/* 子分类 */
.cat-tabs { display: flex; gap: 10px; margin-bottom: 16px; }
.cat-tab { background: #16213e; color: #888; border: 1px solid #333; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.cat-tab:hover { background: #1f3460; color: #fff; }
.cat-tab.active { background: #0f3460; color: #4fc3f7; border-color: #4fc3f7; }

/* 卡片网格 */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.seed-card { background: #16213e; border-radius: 10px; padding: 14px; border: 1px solid #2a2a4a; }
.seed-header { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
.char-badge { background: #e94560; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
.type-hu { background: #2e7d32; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
.type-du { background: #c62828; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
.tag-win { background: #1565c0; color: #fff; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
.seed-seed { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.seed-num { font-family: monospace; font-size: 14px; color: #4fc3f7; word-break: break-all; }
.btn-copy { background: #333; color: #aaa; border: 1px solid #555; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
.btn-copy:hover { background: #e94560; color: #fff; border-color: #e94560; }
.seed-meta { font-size: 12px; color: #666; }

/* 空状态 */
.empty { text-align: center; padding: 40px; color: #555; font-size: 16px; }

/* 统计 */
.stats { text-align: center; margin-bottom: 20px; color: #666; font-size: 13px; }
.stats span { color: #4fc3f7; font-weight: bold; }

.toast {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #e94560; color: #fff; padding: 10px 24px; border-radius: 20px;
    font-size: 14px; display: none; z-index: 9999;
}
</style>
</head>
<body>
<h1>🎴 STS 种子库</h1>
<p class="subtitle">杀戮尖塔 1 &amp; 2 存档种子管理 Beta v0.1</p>

<div class="nav-bar">
    <button class="nav-btn active" onclick="showSection('all')">全部种子</button>
    <button class="nav-btn" onclick="showSection('sts1')">STS1 (${sts1Seeds.length})</button>
    <button class="nav-btn" onclick="showSection('sts2')">STS2 (${sts2Seeds.length})</button>
</div>

<!-- 全部 -->
<div id="sec-all" class="section active">
    <div class="cat-tabs">
        <button class="cat-tab active" onclick="filterAll('all')">全部 (${allSeeds.length})</button>
        <button class="cat-tab" onclick="filterAll('hu')">胡种 (${sts1Hu.length + sts2Hu.length})</button>
        <button class="cat-tab" onclick="filterAll('du')">毒种 (${sts1Du.length + sts2Du.length})</button>
    </div>
    <div class="cards" id="all-cards">
        ${allSeeds.map(s => makeCard(s)).join('\n')}
    </div>
</div>

<!-- STS1 -->
<div id="sec-sts1" class="section">
    <div class="cat-tabs">
        <button class="cat-tab" onclick="filterSts1('hu')">胡种 (${sts1Hu.length})</button>
        <button class="cat-tab" onclick="filterSts1('du')">毒种 (${sts1Du.length})</button>
    </div>
    <div class="cards" id="sts1-cards"></div>
</div>

<!-- STS2 -->
<div id="sec-sts2" class="section">
    <div class="cat-tabs">
        <button class="cat-tab" onclick="filterSts2('hu')">胡种 (${sts2Hu.length})</button>
        <button class="cat-tab" onclick="filterSts2('du')">毒种 (${sts2Du.length})</button>
    </div>
    <div class="cards" id="sts2-cards"></div>
</div>

<div class="toast" id="toast"></div>

<script>
// 所有数据
const data = {
    all: ${JSON.stringify(allSeeds)},
    sts1: { hu: ${JSON.stringify(sts1Hu)}, du: ${JSON.stringify(sts1Du)} },
    sts2: { hu: ${JSON.stringify(sts2Hu)}, du: ${JSON.stringify(sts2Du)} }
};

function makeCard(seed) {
    const charMap = {'IRONCLAD':'铁甲','THE_SILENT':'静默','SILENT':'静默','DEFECT':'缺陷','WATCHER':'观者','REGENT':'摄政','NECROBINDER':'死灵'};
    const charLbl = charMap[seed.char] || seed.char;
    const typeLabel = seed.label === 'hu' ? '胡种' : '毒种';
    const typeClass = seed.label === 'hu' ? 'type-hu' : 'type-du';
    const winTag = seed.victory ? '<span class="tag-win">通关</span>' : '';
    return '<div class="seed-card"><div class="seed-header"><span class="char-badge">'+charLbl+'</span><span class="'+typeClass+'">'+typeLabel+'</span>'+winTag+'</div><div class="seed-seed"><span class="seed-num" id="seed-'+seed.id+'">'+seed.seed+'</span><button class="btn-copy" onclick="copySeed(\\''+seed.seed+'\\')">复制</button></div><div class="seed-meta">'+seed.game+' · 楼层:'+seed.floor+'</div></div>';
}

function renderCards(containerId, seeds) {
    const el = document.getElementById(containerId);
    el.innerHTML = seeds.length ? seeds.map(s => makeCard(s)).join('') : '<div class="empty">暂无数据</div>';
}

// 全部筛选
function filterAll(type) {
    document.querySelectorAll('#sec-all .cat-tab').forEach((t,i) => {
        t.classList.toggle('active', (i===0&&type==='all')||(i===1&&type==='hu')||(i===2&&type==='du'));
    });
    const filtered = type === 'all' ? data.all : data.all.filter(s => s.label === type);
    renderCards('all-cards', filtered);
}

// STS1筛选
function filterSts1(type) {
    document.querySelectorAll('#sec-sts1 .cat-tab').forEach((t,i) => {
        t.classList.toggle('active', (i===0&&type==='hu')||(i===1&&type==='du'));
    });
    renderCards('sts1-cards', data.sts1[type]);
}

// STS2筛选
function filterSts2(type) {
    document.querySelectorAll('#sec-sts2 .cat-tab').forEach((t,i) => {
        t.classList.toggle('active', (i===0&&type==='hu')||(i===1&&type==='du'));
    });
    renderCards('sts2-cards', data.sts2[type]);
}

// 导航
function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('sec-' + name).classList.add('active');
    event.target.classList.add('active');
    // 初始化子筛选
    if (name === 'sts1') filterSts1('hu');
    if (name === 'sts2') filterSts2('hu');
}

// 复制种子
function copySeed(seed) {
    navigator.clipboard.writeText(seed).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = '已复制: ' + seed;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}

// 初始加载
filterAll('all');
</script>
</body>
</html>`;

// 写入文件
const outPath = 'C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('OK: ' + outPath);
console.log('STS1 seeds: ' + sts1Seeds.length);
console.log('STS2 seeds: ' + sts2Seeds.length);
