# STS2 联机种子 vs 单人种子 — 源码分析报告

## 分析方法
通过扫描 `sts2.dll`（9MB .NET 程序集）中的字符串元数据、类名、方法名、源码路径引用，
推断 STS2 的种子系统架构。**注意：这是基于元数据的逆向推断，非完整反编译。**

---

## 1. 核心架构：双 RNG 系统

STS2 使用**双层 RNG（随机数生成器）架构**，这是理解联机/单人种子区别的关键：

| RNG 层 | 类名 | 作用 | 联机时行为 |
|--------|------|------|-----------|
| **RunRng**（局级） | `RunRng` / `RunRngType` | 地图生成、怪物遭遇、卡牌奖励池、遗物掉落、药水掉落 | **所有玩家共享同步**（通过 SyncRngMessage） |
| **PlayerRng**（玩家级） | `PlayerRng` / `PlayerRngType` | 卡牌抽取顺序、个人随机事件 | **每玩家独立**，不同步 |

关键发现：
- `_multiplayerOptionSelectionRng` — 联机专属的第三个 RNG，用于联机事件选项选择（投票系统）
- `SyncRngMessage` / `OnSyncRngMessageReceived` — 网络同步 RNG 状态的消息协议
- `OnSyncPlayerMessageReceived` — 玩家专属同步（不是 RNG 同步，是状态同步）

---

## 2. 种子核心方法

从 `SeedHelper` 类和 Run 模型中找到：

| 方法/属性 | 作用 |
|-----------|------|
| `CanonicalizeSeed` | 规范化种子格式（输入验证/格式化） |
| `InitializeSeed` | 用种子初始化整局 RNG |
| `GetRandomSeed` | 随机生成一个种子 |
| `SetSeed` / `get_Seed` / `set_Seed` | 设置/读取种子 |
| `get_StringSeed` | 获取种子的字符串表示（就是存档里的 "CZNPQ7NSCE" 格式） |
| `GhostSeed` | 幽灵种子（用途不明，可能是观战/回放模式） |
| `DebugSeedOverride` | 调试用种子覆盖 |
| `seedDefaultLength` | 种子默认长度限制 |
| `OnSeedInputSubmitted` | 种子输入框提交回调 |

---

## 3. 联机模式流程

从类名和方法名推断的联机流程：

```
1. 房主创建 Lobby
   → SetupLobbyForHostOrSingleplayer()
   → InitializeRunLobby()
   → 输入/生成种子 → CanonicalizeSeed()
   → 广播种子 → LobbySeedChangedMessage

2. 客人加入
   → ConnectToLobby()
   → HandleSeedChangedMessage()（接收种子）
   → ConnectToLobbyOwnedByFriend()（Steam 好友加入）

3. 开局
   → StartNewMultiplayerRun()
   → InitializeSeed()（用同一种子初始化）
   → RunRng 同步：SyncRngMessage 广播给所有玩家
   → PlayerRng 独立初始化（不同步）

4. 游戏中
   → 每次需要共享随机结果时，通过 SyncRngMessage 同步
   → 事件选项：multiplayerOptionSelectionRng + 投票系统
   → 怪物 HP：ScaleMonsterHpForMultiplayer() 动态缩放
```

---

## 4. 单人 vs 联机种子核心区别

| 维度 | 单人模式 | 联机模式 |
|------|---------|---------|
| **种子格式** | 相同（如 "CZNPQ7NSCE"） | 相同，房主设定后广播 |
| **game_mode 字段** | `"standard"` | 可能是 `"multiplayer"` 或其他值 |
| **RunRng** | 本地生成 | 网络同步，所有玩家相同 |
| **PlayerRng** | 本地生成 | 本地生成，玩家间不同 |
| **multiplayerOptionSelectionRng** | 不使用 | 使用，用于投票事件的选项随机 |
| **怪物 HP** | 标准值 | ScaleMonsterHpForMultiplayer() 缩放 |
| **事件选择** | 单人直接选 | 投票机制（NMultiplayerVoteContainer） |
| **存档文件** | `runSaveFileName` | `multiplayerRunSaveFileName`（独立保存） |
| **可输入种子** | 是 | 房主可输入，客人自动同步 |
| **Daily/Custom** | 支持 | 支持 |

---

## 5. 联机专属类一览

| 命名空间 | 类名 | 功能 |
|----------|------|------|
| Multiplayer.Game.Lobby | `IRunLobbyListener` | 大厅事件监听接口 |
| Multiplayer.Game.Lobby | `LoadRunLobby` | 加载已有存档的大厅 |
| Multiplayer.Game.Lobby | `StartRunLobby` | 开新局的大厅 |
| Multiplayer.Messages.Lobby | `LobbySeedChangedMessage` | 种子变更广播 |
| Multiplayer.Messages.Lobby | `LobbyAscensionChangedMessage` | 爬塔难度同步 |
| Multiplayer.Messages.Lobby | `LobbyModifiersChangedMessage` | 修饰器同步 |
| Multiplayer.Messages | `SyncRngMessage` | RNG 状态同步 |
| Multiplayer.Transport.Steam | `SteamClient` / `SteamHost` | Steam 网络传输层 |
| Nodes.Multiplayer | `NRemoteLobbyPlayer` | 远程玩家显示 |
| Nodes.Multiplayer | `NRemoteMouseCursor` | 远程鼠标光标 |
| Nodes.Multiplayer | `NMultiplayerPlayerIntentHandler` | 玩家意图处理 |
| Nodes.Multiplayer | `NMultiplayerVoteContainer` | 投票容器 UI |
| Nodes.Multiplayer | `NMultiplayerTimeoutOverlay` | 超时覆盖层 |
| Nodes.Multiplayer | `NMultiplayerNetworkProblemIndicator` | 网络问题指示器 |

---

## 6. 对种子数据库的影响

对于我们的种子库网站：

1. **种子格式统一**：联机和单人种子格式相同（Base36 字母数字），不需要区分显示
2. **game_mode 筛选**：需要加一个 game_mode 过滤器（standard / multiplayer / daily / custom）
3. **联机种子可复用**：联机种子可以在单人模式下复现相同的地图和遭遇
4. **RNG 差异**：联机种子复现单人局时，卡牌抽取顺序可能不同（PlayerRng 独立）
5. **HP 缩放**：联机种子复现单人局时，怪物 HP 不会缩放，难度更低
6. **数据源**：需要读取 `multiplayerRunSaveFileName` 对应的联机存档

---

## 数据来源

- DLL: `F:\steam\steamapps\common\Slay the Spire 2\data_sts2_windows_x86_64\sts2.dll`
- 源码引用路径: `res://src/Core/...`（653个.cs文件引用）
- 网络库: `msquic.dll`（QUIC 协议，用于联机通信）
- 当前存档全部为 `game_mode: "standard"`，无联机数据
