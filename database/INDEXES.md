# 云数据库索引清单

> 在微信开发者工具 → 云开发控制台 → 数据库 → 对应集合 → 索引管理 中添加

---

## `items` 集合

| 索引名称 | 字段 | 方向 | 说明 |
| --- | --- | --- | --- |
| `idx_status_created` | `status` asc + `createdAt` desc | 复合 | 首页查询：按状态筛选 + 按时间排序 |
| `idx_category_created` | `category` asc + `createdAt` desc | 复合 | 分类筛选 + 排序 |
| `idx_sellerId_created` | `sellerId` asc + `createdAt` desc | 复合 | "我发布的" 列表 |
| `idx__id` | `_id` asc | 单字段 | 主键查询（系统默认已有） |

---

## `favorites` 集合

| 索引名称 | 字段 | 方向 | 说明 |
| --- | --- | --- | --- |
| `idx_itemId_openid` | `itemId` asc + `_openid` asc | 复合 | 检查某用户是否收藏某商品（toggleFavorite 云函数用） |
| `idx_openid_created` | `_openid` asc + `createdAt` desc | 复合 | "我的收藏" 列表 |
| `idx__id` | `_id` asc | 单字段 | 主键查询 |

---

## `messages` 集合

| 索引名称 | 字段 | 方向 | 说明 |
| --- | --- | --- | --- |
| `idx_conversation_created` | `conversationId` asc + `createdAt` asc | 复合 | 按会话查询消息 + 时间排序 |
| `idx__id` | `_id` asc | 单字段 | 主键查询 |

---

## `users` 集合

| 索引名称 | 字段 | 方向 | 说明 |
| --- | --- | --- | --- |
| `idx_openid` | `_openid` asc | 单字段 | 按 openid 查询用户（登录/注册时用） |

---

## 创建方式

1. 打开微信开发者工具 → 云开发控制台
2. 选择「数据库」→ 目标集合
3. 点击「索引管理」→「添加索引」
4. 按上表填写字段和方向
5. 保存

> 复合索引的字段顺序不可颠倒，查询时必须按索引字段顺序使用。
