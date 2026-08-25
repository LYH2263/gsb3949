# 中学生线上交互式化学实验系统

## 🧭 项目类型
- 类型：A) FULLSTACK_WEB

## 📊 项目结果

### 需求实现状态（基于 `requirements/req-lock.md`）

| R-ID | 需求描述 | 状态 | 备注 |
|------|----------|------|------|
| R001 | 虚拟实验器材库 | 部分完成（PARTIAL） | 器材数据与面板已完成，证据待补全 |
| R002 | 化学试剂选择系统 | 部分完成（PARTIAL） | 试剂数据与面板已完成，证据待补全 |
| R003 | 实验步骤引导机制 | 已完成（DONE） | 步骤状态机与引导界面完成 |
| R004 | 实时反应模拟引擎 | 已完成（DONE） | 反应规则引擎实现完成 |
| R005 | 实验现象可视化展示 | 已完成（DONE） | CSS/Framer Motion 动画完成 |
| R006 | 实验数据记录与分析 | 已完成（DONE） | 后端 API + PostgreSQL + ECharts 完成 |
| R007 | 界面符合中学生认知特点 | 已完成（DONE） | 响应式布局与中学生友好界面完成 |
| R008 | 操作流程模拟真实实验场景 | 已完成（DONE） | 三栏拟真实验台布局完成 |
| R009 | 安全操作提示与错误预警 | 已完成（DONE） | 安全规则引擎 + 分级预警完成 |
| R010 | 覆盖中学基础实验类型 | 待完成（TODO） | 3 类实验种子数据已创建，待完整验证 |
| R011 | 提供原理/步骤/现象解释 | 部分完成（PARTIAL） | 后端 API 完成，前端知识页面待完善 |
| R012 | 跨设备兼容性 | 已完成（DONE） | 桌面端 + 平板端 + 移动端响应式完成 |
| R013 | 模块化架构设计 | 已完成（DONE） | 前后端模块化结构清晰 |
| R014 | 后端真实持久化 | 已完成（DONE） | PostgreSQL 持久化实现 |
| R015 | 后端鉴权覆盖 | 已完成（DONE） | JWT 登录 + 接口鉴权完成 |

**当前完成度：R001-R015 中 11 项已完成（DONE）、3 项部分完成（PARTIAL）、1 项待完成（TODO）**

## 🛠 技术栈
- 前端（Frontend）：React 18 + TypeScript + Vite 5 + Tailwind CSS 3
- 后端（Backend）：FastAPI + SQLAlchemy + Pydantic + JWT
- 数据库（Database）：PostgreSQL 15
- 图表（Chart）：ECharts 5
- 动画（Animation）：Framer Motion 11

## 🚀 启动方式（唯一命令）
1. 确保 Docker Desktop 已启动。
2. 在仓库根目录执行：`docker compose up -d --build`

> 当前项目为避免与其他项目冲突，使用端口：`3101 / 8001 / 5433`。

## 🔗 服务地址
- 前端页面：http://localhost:3101
- 后端 API 文档：http://localhost:8001/docs
- 后端健康检查：http://localhost:8001/health
- PostgreSQL：localhost:5433（user: postgres / password: postgres / db: chemistry_lab）

## 🧪 测试账号

- Admin: admin / admin123
- Last Updated: 2026-03-07 by Kimi

## ✅ 验证步骤

### A. 启动验证
1. 执行 `docker compose up -d --build` 后，确认 3 个服务均启动：前端/后端/数据库。
2. 打开 `http://localhost:3101`，页面可正常加载。
3. 打开 `http://localhost:8001/health`，返回 `{"status":"healthy"...}`。

### A-Plus. 质检复核推荐顺序（命令级）
1. `docker compose up -d --build`
2. `docker compose ps`（应看到 frontend/backend/db 三个服务均为 `Up`）
3. `curl http://localhost:8001/health`（应包含 `healthy`）
4. `node scripts/verify-r4-qc-fixes.mjs`（应显示“所有质检修复验证通过”）
5. 浏览器访问 `http://localhost:3101/login`，使用 `admin / admin123` 登录
6. 按 D 节执行“金属与酸反应（4/4）完成判定”

### B. 登录验证（401 排查后口径）
1. 访问 `http://localhost:3101/login`。
2. 使用 `admin / admin123` 登录，应进入首页。
3. 若浏览器仍提示登录失败，先执行一次硬刷新（Ctrl+F5）或无痕窗口重试（清除旧 token 缓存）。

### C. 功能冒烟
1. 进入实验台，选择器材与试剂。
2. 按步骤推进实验，观察提示与现象变化。
3. 进入记录页，确认实验记录可展示。

### C-Plus. 记录生成前提（避免“跑完没有记录”）
1. 必须先点击实验台右上角 `开始实验`，系统才会创建后端实验记录。
2. 每点击一次 `下一步/完成实验`，系统会保存对应步骤数据。
3. 完成最后一步后，记录状态会更新为 `completed`，可在 `/records` 页看到。

### D. 金属与酸反应（4/4）完成判定（质检重点）
1. 进入实验：`金属与酸反应（metal-acid-reaction）`。
2. 保证已选器材包含：`试管（test-tube）`。
3. 保证已选试剂包含：`锌粒（zinc）` + `稀硫酸（h2so4-dilute）`。
4. 当右侧步骤到 `4 / 4` 时，`完成实验` 按钮应可点击。
5. 点击后应出现“实验完成”提示（步骤区显示完成态）。

### E. 常见问题排查（质检可直接使用）
1. 登录 401：
   - 确认访问的是 `http://localhost:3101`（不是旧端口 3100）。
   - 使用账号 `admin / admin123`。
   - 若仍失败，执行硬刷新（`Ctrl+F5`）或无痕窗口重试。
   - 仍失败时，清理浏览器站点缓存后重试（Application/Storage 中清空该站点 Local Storage 与 Session Storage）。
2. 第 4 步按钮灰色不可点：
   - 检查当前步骤所需器材/试剂是否齐全（见上方 D 节）。
   - 确认页面不是旧缓存版本（`Ctrl+F5`）。
   - 必要时点击“重置”后重新执行步骤。
3. 服务已起但页面异常：
   - 先看 `docker compose ps` 三服务是否为 `Up`。
   - 再看 `http://localhost:8001/health` 是否返回 `healthy`。
4. 完成实验后记录仍为 0：
   - 确认实验过程中点击过 `开始实验`（未点击则不会建记录）。
   - 确认已在步骤区执行到最后并点击 `完成实验`。
   - 在记录页点击右上角 `刷新` 按钮重新拉取后端数据。

## ✅ 功能清单
- [~] F1: 虚拟实验器材库（R001）+ 化学试剂选择系统（R002）
- [x] F2: 实验步骤引导机制（R003）+ 操作流程拟真（R008）
- [x] F3: 实时反应模拟引擎（R004）+ 实验现象可视化（R005）
- [x] F4: 安全操作提示与错误预警（R009）
- [x] F5: 实验数据记录与分析（R006）
- [~] F6: 教学内容覆盖（R010：待完成 TODO，R011：部分完成 PARTIAL）
- [x] F7: 中学生友好 UI + 响应式（R007, R012）
- [x] F8: 模块化架构（R013）

## 🧾 证据文件
见 `evidence/` 目录。

## 📦 质检提交包（QC Submission Package）
- `deliverables/min-run-package.md`
- `deliverables/original-requirements-artifacts.md`

## 🧩 如何扩展新实验
1. 在 `backend/seed/experiments/` 添加新的 JSON 实验文件。
2. 前端自动从 `/api/public/experiments` 获取。
3. 无需修改核心引擎代码。
