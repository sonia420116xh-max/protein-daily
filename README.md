# Protein Daily

面向手机的 AI 蛋白质记录 PWA。当前版本是可运行的第一阶段 MVP，前端使用本地 Mock 数据，服务端提供 Hono Mock 接口和 PostgreSQL 建表草案。

## 本地运行

```bash
pnpm install
pnpm dev
```

前端默认运行在 `http://localhost:5173`。如需同时查看 Mock API：

```bash
pnpm dev:api
```

API 默认运行在 `http://localhost:8787`。

## 手机随时访问

当前前端是纯客户端 MVP，最简单的方式是部署 `apps/web` 到 Vercel、Netlify 或 Cloudflare Pages。构建目录为 `apps/web/dist`，构建命令为 `pnpm build`（Monorepo 根目录执行），并将 `apps/web/vercel.json` 中的 SPA 路由重写一并部署。

部署后用手机打开 HTTPS 地址，选择“添加到主屏幕”即可像 App 一样使用。当前记录保存在手机浏览器本地；换设备或清除浏览器数据不会自动同步。下一阶段接入登录和 PostgreSQL 后，才会支持跨设备同步。

## 验证

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 目录

- `apps/web`：Vue 3 + TypeScript + Vite + Tailwind + Vant PWA
- `apps/api`：Node.js + Hono + Zod Mock API
- `packages/shared`：前后端共享类型与蛋白质计算函数
- `apps/api/db/schema.sql`：下一阶段 PostgreSQL 表结构草案

浏览器端数据存储在 `localStorage`。AI 识别、Magic Link 登录和云端数据隔离将在下一阶段接入，密钥只应配置在服务端环境变量中。
