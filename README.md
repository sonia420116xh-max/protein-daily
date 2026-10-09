# Protein Daily

面向手机的 AI 蛋白质记录 PWA。图片由浏览器压缩后发送至 Hono 服务端，服务端通过 OpenAI Responses API 进行真实视觉识别。记录当前保存在设备本地，PostgreSQL 表结构已为下一阶段云同步准备。

## 本地运行

```bash
pnpm install
pnpm dev
```

前端默认运行在 `http://localhost:5173`。真实识别需要同时启动 API，并在根目录 `.env` 中配置 `OPENAI_API_KEY`：

```bash
pnpm dev:api
```

API 默认运行在 `http://localhost:8787`。可以通过 `OPENAI_VISION_MODEL` 覆盖默认的 `gpt-4.1-mini`。

## 手机随时访问

项目当前部署在 Vercel，根目录 `vercel.json` 会同时构建前端和 `/api/recognize` 服务端函数。生产环境必须配置 `OPENAI_API_KEY`。

部署后用手机打开 HTTPS 地址，选择“添加到主屏幕”即可像 App 一样使用。当前记录保存在手机浏览器本地；换设备或清除浏览器数据不会自动同步。下一阶段接入登录和 PostgreSQL 后，才会支持跨设备同步。

## 验证

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 目录

- `apps/web`：Vue 3 + TypeScript + Vite + Tailwind + Vant PWA
- `apps/api`：Node.js + Hono + Zod + OpenAI 视觉识别 API
- `packages/shared`：前后端共享类型与蛋白质计算函数
- `apps/api/db/schema.sql`：下一阶段 PostgreSQL 表结构草案

浏览器端数据存储在 `localStorage`。OpenAI API Key 只从服务端环境变量读取，不会发送给浏览器。Magic Link 登录和云端数据隔离将在下一阶段接入。
