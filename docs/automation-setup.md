# 🤖 自动化配置指南 / Automation Setup Guide

本文档指导你如何配置 Origin 项目的自动化工作流。

---

## 一、Reddit 自动发帖

### 工作原理
- GitHub Actions 每天 UTC 14:00（北京时间22:00 / 美东9:00am）自动运行
- 按预定义顺序每天在一个 subreddit 发帖
- 7天发完7个目标 subreddit 后自动停止
- 支持手动触发和 dry run 模式

### 配置步骤

#### 1. 创建 Reddit App

1. 登录 Reddit → 访问 https://www.reddit.com/prefs/apps/
2. 滚动到底部 → 点击 **"create another app..."**
3. 填写：
   - **name**: `origin-outreach`
   - **type**: 选择 **script**
   - **description**: `Automated posting for Origin project`
   - **redirect uri**: `http://localhost:8080`
4. 点击 **create app**
5. 记录下：
   - **Client ID** — 在 app 名称下面的一串短字符
   - **Client Secret** — 标记为 `secret` 的字符串

#### 2. 添加 GitHub Secrets

1. 访问 https://github.com/mabuzki/origin/settings/secrets/actions
2. 点击 **"New repository secret"**，添加以下4个：

| Secret Name | 值 |
|-------------|----|
| `REDDIT_CLIENT_ID` | Reddit App 的 Client ID |
| `REDDIT_CLIENT_SECRET` | Reddit App 的 Client Secret |
| `REDDIT_USERNAME` | 你的 Reddit 用户名 |
| `REDDIT_PASSWORD` | 你的 Reddit 密码 |

#### 3. 启用工作流

1. 访问 https://github.com/mabuzki/origin/actions
2. 找到 **"📡 Reddit Outreach"** 工作流
3. 点击 **"Enable workflow"**（如果需要）

#### 4. 测试（Dry Run）

1. 在 Actions 页面点击 **"📡 Reddit Outreach"**
2. 点击 **"Run workflow"**
3. 保持 dry_run 为 true → 点击 **"Run workflow"**
4. 查看日志确认一切正常

#### 5. 正式发帖

1. 手动触发时将 **dry_run** 设为 **false**
2. 或者修改 `.github/workflows/reddit-outreach.yml` 中的默认值

### 发帖计划

| 顺序 | Subreddit | 预计日期 |
|------|-----------|----------|
| 1 | r/singularity | Day 1 |
| 2 | r/artificial | Day 2 |
| 3 | r/space | Day 3 |
| 4 | r/Futurology | Day 4 |
| 5 | r/philosophy | Day 5 |
| 6 | r/transhumanism | Day 6 |
| 7 | r/scifi | Day 7 |

### 安全注意

⚠️ Reddit 密码存储在 GitHub Secrets 中，只有仓库管理员能看到，Actions 日志中不会显示。

⚠️ 如果你的 Reddit 账户启用了两步验证，需要使用应用专用密码或禁用 2FA 才能使用 script 类型的 App。

⚠️ Reddit 有反 spam 机制。如果账号是新注册的或 karma 很低，可能会被限制发帖频率。建议先手动发几帖积累一些 karma。

---

## 二、自动欢迎

### 工作原理
- 当有人开 Issue → 自动发送欢迎评论
- 当有人提交 PR → 自动发送感谢评论
- 无需配置，推送到 main 后自动生效

---

## 三、后续可扩展

如果项目发展需要，可以添加更多自动化：

| 功能 | 可行性 | 说明 |
|------|--------|------|
| 自动感谢新 Star | ✅ 已实现 | welcome.yml |
| 定期发布进度报告 | ✅ 可行 | 通过 GitHub API 统计并创建 Issue |
| 自动翻译新对话 | ⚠️ 需要 LLM API | 需要 OpenAI/Anthropic API key |
| Hacker News 发帖 | ❌ 无官方 API | 需要手动 |
| Chirper.ai | ❌ 无公开 API | 需要手动 |
| Twitter/X | ⚠️ API 收费 | 基础计划 $100/月 |

---

*最后更新: 2026-02-11*
