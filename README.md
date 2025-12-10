# 火山引擎 N8N 集成插件

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![N8N](https://img.shields.io/badge/platform-N8N-brightgreen.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.15-green.svg)

一个 N8N 自定义节点，用于集成火山引擎 API，支持 VikingDB 知识库、IAM 用户管理和自定义请求。

## 📦 安装

```bash
npm install @luka-cat-mimi/n8n-nodes-volcengine
```

## ⚙️ 配置凭据

在 N8N 中创建「火山引擎 API」凭据：

| 字段 | 说明 |
|------|------|
| Base URL | 火山引擎 API 地址，默认 `https://open.volcengineapi.com` |
| Access Key ID | 访问密钥 ID |
| Secret Access Key | 访问密钥 |
| Region | 服务区域（默认华北2-北京） |

👉 [获取 Access Key](https://www.volcengine.com/docs/6291/65568?lang=zh)

## 📊 功能模块

### Viking 知识库

| 操作 | 说明 |
|------|------|
| **搜索知识库** | 语义检索知识库内容 |
| **多轮对话** | 基于知识库的 AI 对话，支持多种豆包模型 |

👉 [VikingDB 文档](https://www.volcengine.com/docs/84313/1254485?lang=zh)

### IAM 用户管理

| 操作 | 说明 |
|------|------|
| **获取用户** | 获取指定用户详情 |
| **列出用户** | 获取用户列表 |
| **更新用户** | 更新用户信息 |
| **更新登录配置** | 更新用户登录设置 |

### 自定义请求

调用任意火山引擎 OpenAPI，支持 GET/POST 请求、Query 参数和 Body 参数。

👉 [API Explorer](https://api.volcengine.com/api-explorer/?action=CreateAccessKey&groupName=%E8%AE%BF%E9%97%AE%E5%AF%86%E9%92%A5&serviceCode=iam&version=2018-01-01)

## 🔧 使用示例

### 搜索知识库

```javascript
Collection Name: my-knowledge-base
Query: 如何申请休假
Limit: 5
```

### 自定义请求调用 IAM

```javascript
Service: iam
Action: ListUsers
Version: 2018-01-01
Method: GET
```

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 代码检查
npm run lint
```

### 项目结构

```
├── credentials/
│   └── VolcEngineApi.credentials.ts
├── nodes/VolcEngine/
│   ├── VolcEngine.node.ts
│   └── resource/
│       ├── viking/          # 知识库模块
│       ├── iam/             # IAM 模块
│       └── customRequest/   # 自定义请求
└── package.json
```

## 📝 许可证

MIT License

## 🆘 支持

- 📧 邮箱：luka.cat.mimi@gmail.com
- 🐛 [问题反馈](https://github.com/luka-n8n-nodes/n8n-nodes-volcengine/issues)
