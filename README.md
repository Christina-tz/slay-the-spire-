# STS 种子库

> 杀戮尖塔（Slay the Spire）种子分享平台 · STS1 & STS2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**在线访问：** https://slay-the-spire-psi.vercel.app/

---

## 🎮 什么是 STS 种子库？

STS 种子库是一个让杀戮尖塔玩家**上传、分享、搜索种子**的工具。

- 支持 **STS1** 和 **STS2** 两个版本
- 按角色、游戏版本、标签分类筛选
- 搜索标签快速找到想要的种子
- 注册账号后可上传自己的种子

---

## ✨ 功能特色

| 功能 | 说明 |
|------|------|
| 📤 上传种子 | 输入种子代码、游戏版本、角色、通关结果、难度、标签和简介 |
| 🔍 搜索筛选 | 按标签关键词实时过滤，支持 STS1 / STS2 分类 |
| 🏷️ 标签系统 | 胡种（+150%稀有遗物）、毒种（诅咒遗物）、稀有遭遇等 |
| 📋 种子详情 | 点击卡片查看完整通关路线和抓牌策略 |
| 👤 用户系统 | 注册账号，管理自己的种子记录 |
| 💾 数据云同步 | 种子数据存储在云端，换设备不丢失 |

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML + Vanilla JS + CSS（零依赖框架） |
| 后端 | Supabase（PostgreSQL + Auth + Realtime） |
| 字体 | JetBrains Mono + Noto Sans SC |
| 部署 | Vercel |

---

## 🚀 本地运行

```bash
# 克隆仓库
git clone https://github.com/Christina-tz/slay-the-spire-.git
cd slay-the-spire-

# 进入项目目录
cd sts-seed-db-v0.0.5

# 直接用浏览器打开 index.html 即可
# （部分功能如用户认证需要 HTTP 服务，临时解决：）
python -m http.server 8080
# 然后访问 http://localhost:8080
```

---

## 📂 项目结构

```
sts-seed-db/
├── index.html          # 主网站文件（所有代码内联）
├── gen_v4.js           # 网站生成器源码
├── robots.txt          # 搜索引擎爬虫规则
├── sitemap.xml         # 站点地图
└── README.md           # 本文件
```

---

## 🗄️ 数据库结构（Supabase）

**表名：`seeds`**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| user_id | text | 上传者 ID |
| seed | text | 种子代码 |
| game | text | STS1 / STS2 |
| char | text | 角色名（IRONCLAD / SILENT / DEFECT / WATCHER） |
| result | text | VICTORY / DEATH |
| ascension | int | 进阶等级 |
| difficulty | text | NORMAL / HARD |
| label | text | 标签（胡种/毒种/稀有遭遇/其他） |
| note | text | 简介（150字以内） |
| created_at | timestamptz | 上传时间 |

---

## 🎨 标签说明

- **胡种** 🌿 — 通关获得稀有遗物，+150%稀有遗物出现率
- **毒种** 💀 — 通关时持有诅咒遗物或其他负面效果
- **稀有遭遇** ✨ — 途中遇到稀有卡牌、稀有遗物等
- **稀有商店** 🛒 — 商店刷新出强力卡牌/遗物
- **无色宝箱** 📦 — 遭遇无色宝箱事件
- **其他** — 其他有趣的种子

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！

如果你也在玩杀戮尖塔，欢迎上传你的种子，让更多人体验到好种子的乐趣 🎲

---

## 📜 许可证

MIT License · 2026 · Christina-tz

---

*杀戮尖塔（Slay the Spire）版权归 Mega Crit Games 所有，本项目仅供学习交流使用。
