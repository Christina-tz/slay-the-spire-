# STS种子库 - 用户系统集成

## 目标
接入 Supabase Auth，实现邮箱注册/登录，保护「导入种子」功能。

## 完成的改动

### index.html

**1. CDN引入**
- 在 `</head>` 前加了 Supabase JS CDN：
  `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>`

**2. 顶部导航区加 Auth Bar**（nav-bar 和 import-bar 之间）
```html
<div class="auth-bar">
    <div id="auth-loading" style="display:none;">验证中...</div>
    <button class="btn-auth" id="btn-auth" onclick="openAuth()">登录 / 注册</button>
    <span id="auth-user" style="display:none;"></span>
    <button class="btn-logout" id="btn-logout" onclick="logout()" style="display:none;">退出</button>
</div>
```

**3. Auth Modal HTML**（在 import modal 之后）
- 支持登录/注册 Tab 切换
- 登录表单：邮箱 + 密码
- 注册表单：邮箱 + 密码 + 确认密码

**4. Auth CSS**（在 `</style>` 前）
- `.auth-bar` / `.btn-auth` / `.btn-logout`
- `.auth-tabs` / `.auth-tab` / `.auth-error`

**5. Supabase JS**
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**6. Auth 函数**
- `initAuth()` - 启动时检测 session + 监听状态变化
- `updateAuthUI(user)` - 根据登录状态切换按钮/用户名显示
- `openAuth()` / `closeAuth()` - 弹窗控制
- `switchAuthTab(tab)` - 登录/注册 Tab 切换
- `handleLogin()` - 邮箱+密码登录，错误提示中文
- `handleSignup()` - 注册，含密码校验
- `logout()` - 登出
- `openImport()` - **改造**：先检查 session，未登录则跳转 auth 弹窗

### 核心逻辑
- 用户不登录 → 点击「导入种子」→ 自动弹出登录弹窗
- 登录成功后 → 自动打开导入弹窗
- auth 状态变化时（登录/登出）→ `updateAuthUI` 实时刷新 UI

## 待完成：配置 Supabase

用户需要：
1. 去 [supabase.com](https://supabase.com) 注册并创建项目
2. 在项目设置 → API 中找到 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
3. 替换 `index.html` 中的两个占位符
4. 在 Supabase Dashboard → Authentication → Providers 中确认 Email 登录已开启

## 未完成：数据持久化

当前导入的种子仍存在 localStorage，未关联到 Supabase 用户。
下一步需要：
- 创建 `user_seeds` 表（seed, game, char, label, difficulty, tags, description, created_at）
- 用户导入时写入该表（需 Supabase RLS 策略）
- 加载时按 user_id 读取对应种子
- 考虑要不要公开种子库（游客可浏览，注册后可导入）

## 文件状态
- 直接修改了 `projects/sts-seed-db/index.html`（实际运行文件）
- gen_v4.js 尚未同步（下次生成会覆盖）
