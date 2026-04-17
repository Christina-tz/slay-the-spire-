// STS Seed DB - v2: STS1 种子使用 Base36 编码
const fs = require('fs');
const path = require('path');

const C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function numToB36(x) {
    let n = BigInt(x);
    if (n < 0n) n = -n;
    if (n === 0n) return '0';
    let s = '';
    while (n > 0n) {
        s = C[Number(n % 36n)] + s;
        n = n / 36n;
    }
    return s;
}

// STS1
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
            const gameSeed = (rawSeed !== undefined && rawSeed !== 0 && rawSeed !== null) ? numToB36(rawSeed) : 'N/A';
            sts1Seeds.push({
                id: file.replace('.run', ''),
                char: j.character_chosen || char,
                seed: gameSeed,
                floor,
                victory,
                label: victory || floor >= 50 ? 'hu' : 'du'
            });
        } catch(e) {}
    }
}

// STS2
const sts2Dir = 'C:/Users/29921/AppData/Roaming/SlayTheSpire2/steam/76561199466383061/profile1/saves/history';
const sts2Seeds = [];
if (fs.existsSync(sts2Dir)) {
    for (const file of fs.readdirSync(sts2Dir).filter(f => f.endsWith('.run'))) {
        try {
            const j = JSON.parse(fs.readFileSync(path.join(sts2Dir, file), 'utf8'));
            const victory = j.win === true;
            sts2Seeds.push({
                id: file.replace('.run', ''),
                char: j.players && j.players[0] ? j.players[0].character.replace('CHARACTER.', '') : 'UNKNOWN',
                seed: j.seed || 'N/A',
                floor: 3,
                victory,
                label: victory ? 'hu' : 'du'
            });
        } catch(e) {}
    }
}

const allSeeds = [
    ...sts1Seeds.map(s => ({...s, game: 'STS1'})),
    ...sts2Seeds.map(s => ({...s, game: 'STS2'}))
];

const sts1Hu = allSeeds.filter(s => s.game === 'STS1' && s.label === 'hu');
const sts1Du = allSeeds.filter(s => s.game === 'STS1' && s.label === 'du');
const sts2Hu = allSeeds.filter(s => s.game === 'STS2' && s.label === 'hu');
const sts2Du = allSeeds.filter(s => s.game === 'STS2' && s.label === 'du');

console.log('STS1 seeds:', sts1Seeds.length, '| Hu:', sts1Hu.length, '| Du:', sts1Du.length);
console.log('STS2 seeds:', sts2Seeds.length, '| Hu:', sts2Hu.length, '| Du:', sts2Du.length);
console.log('Sample STS1 seeds:');
sts1Seeds.slice(0, 5).forEach(s => console.log(' ', s.seed, '|', s.char, '| floor:', s.floor, '| win:', s.victory));

const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>STS 种子库 - STS1 &amp; STS2</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;background:#1a1a2e;color:#e0e0e0;min-height:100vh;padding:20px;}
h1{text-align:center;color:#e94560;margin-bottom:6px;font-size:28px;}
.subtitle{text-align:center;color:#666;margin-bottom:22px;font-size:13px;}
.nav-bar{display:flex;gap:12px;justify-content:center;margin-bottom:22px;flex-wrap:wrap;}
.nav-btn{background:#16213e;color:#aaa;border:1px solid #333;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:15px;transition:all .2s;}
.nav-btn:hover{background:#1f3460;color:#fff;}
.nav-btn.active{background:#e94560;color:#fff;border-color:#e94560;font-weight:bold;}
.section{display:none;}
.section.active{display:block;}
.cat-tabs{display:flex;gap:10px;margin-bottom:16px;}
.cat-tab{background:#16213e;color:#888;border:1px solid #333;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px;}
.cat-tab:hover{background:#1f3460;color:#fff;}
.cat-tab.active{background:#0f3460;color:#4fc3f7;border-color:#4fc3f7;}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;}
.seed-card{background:#16213e;border-radius:10px;padding:14px;border:1px solid #2a2a4a;}
.seed-header{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;}
.char-badge{background:#e94560;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold;}
.type-hu{background:#2e7d32;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;}
.type-du{background:#c62828;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;}
.tag-win{background:#1565c0;color:#fff;padding:3px 8px;border-radius:12px;font-size:11px;}
.seed-seed{display:flex;gap:8px;align-items:center;margin-bottom:6px;}
.seed-num{font-family:monospace;font-size:14px;color:#4fc3f7;word-break:break-all;flex:1;}
.btn-copy{background:#333;color:#aaa;border:1px solid #555;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:12px;white-space:nowrap;}
.btn-copy:hover{background:#e94560;color:#fff;border-color:#e94560;}
.seed-meta{font-size:12px;color:#666;}
.seed-raw{font-size:11px;color:#444;margin-bottom:4px;font-family:monospace;}
.empty{text-align:center;padding:40px;color:#555;font-size:16px;}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#e94560;color:#fff;padding:10px 24px;border-radius:20px;font-size:14px;display:none;z-index:9999;}
</style>
</head>
<body>
<h1>🎴 STS 种子库</h1>
<p class="subtitle">杀戮尖塔 1 &amp; 2 · 存档种子管理 · Beta v0.2</p>

<div class="nav-bar">
    <button class="nav-btn active" onclick="showSection('all')">全部 (${allSeeds.length})</button>
    <button class="nav-btn" onclick="showSection('sts1')">STS1 (${sts1Seeds.length})</button>
    <button class="nav-btn" onclick="showSection('sts2')">STS2 (${sts2Seeds.length})</button>
</div>

<div id="sec-all" class="section active">
    <div class="cat-tabs">
        <button class="cat-tab active" onclick="filterAll('all')">全部 (${allSeeds.length})</button>
        <button class="cat-tab" onclick="filterAll('hu')">胡种 (${sts1Hu.length + sts2Hu.length})</button>
        <button class="cat-tab" onclick="filterAll('du')">毒种 (${sts1Du.length + sts2Du.length})</button>
    </div>
    <div class="cards" id="all-cards"></div>
</div>

<div id="sec-sts1" class="section">
    <div class="cat-tabs">
        <button class="cat-tab" onclick="filterSts1('hu')">胡种 (${sts1Hu.length})</button>
        <button class="cat-tab" onclick="filterSts1('du')">毒种 (${sts1Du.length})</button>
    </div>
    <div class="cards" id="sts1-cards"></div>
</div>

<div id="sec-sts2" class="section">
    <div class="cat-tabs">
        <button class="cat-tab" onclick="filterSts2('hu')">胡种 (${sts2Hu.length})</button>
        <button class="cat-tab" onclick="filterSts2('du')">毒种 (${sts2Du.length})</button>
    </div>
    <div class="cards" id="sts2-cards"></div>
</div>

<div class="toast" id="toast"></div>

<script>
const data = {
    all: ${JSON.stringify(allSeeds)},
    sts1: {hu: ${JSON.stringify(sts1Hu)}, du: ${JSON.stringify(sts1Du)}},
    sts2: {hu: ${JSON.stringify(sts2Hu)}, du: ${JSON.stringify(sts2Du)}}
};
const charMap = {IRONCLAD:'铁甲',THE_SILENT:'静默',SILENT:'静默',DEFECT:'缺陷',WATCHER:'观者',REGENT:'摄政',NECROBINDER:'死灵'};
function makeCard(s) {
    const cl = charMap[s.char] || s.char;
    const tl = s.label === 'hu' ? '胡种' : '毒种';
    const tc = s.label === 'hu' ? 'type-hu' : 'type-du';
    const wt = s.victory ? '<span class="tag-win">通关</span>' : '';
    return '<div class="seed-card"><div class="seed-header"><span class="char-badge">'+cl+'</span><span class="'+tc+'">'+tl+'</span>'+wt+'</div><div class="seed-raw">'+s.game+'</div><div class="seed-seed"><span class="seed-num">'+s.seed+'</span><button class="btn-copy" onclick="copySeed(\\''+s.seed+'\\')">复制</button></div><div class="seed-meta">楼层: '+s.floor+'</div></div>';
}
function render(id, arr) {
    document.getElementById(id).innerHTML = arr.length ? arr.map(makeCard).join('') : '<div class="empty">暂无数据</div>';
}
function filterAll(t) {
    document.querySelectorAll('#sec-all .cat-tab').forEach((x,i)=>x.classList.toggle('active',(i===0&&t==='all')||(i===1&&t==='hu')||(i===2&&t==='du')));
    render('all-cards', t==='all' ? data.all : data.all.filter(s=>s.label===t));
}
function filterSts1(t) {
    document.querySelectorAll('#sec-sts1 .cat-tab').forEach((x,i)=>x.classList.toggle('active',(i===0&&t==='hu')||(i===1&&t==='du')));
    render('sts1-cards', data.sts1[t]);
}
function filterSts2(t) {
    document.querySelectorAll('#sec-sts2 .cat-tab').forEach((x,i)=>x.classList.toggle('active',(i===0&&t==='hu')||(i===1&&t==='du')));
    render('sts2-cards', data.sts2[t]);
}
function showSection(n) {
    document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
    document.getElementById('sec-'+n).classList.add('active');
    event.target.classList.add('active');
    if(n==='sts1') filterSts1('hu');
    if(n==='sts2') filterSts2('hu');
}
function copySeed(s) {
    navigator.clipboard.writeText(s).then(()=>{
        const t=document.getElementById('toast');
        t.textContent='已复制: '+s; t.style.display='block';
        setTimeout(()=>t.style.display='none',2000);
    });
}
filterAll('all');
</script>
</body>
</html>`;

fs.writeFileSync('C:/Users/29921/.qclaw/workspace/projects/sts-seed-db/index.html', html, 'utf8');
console.log('Done. Output: index.html');
