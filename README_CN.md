# MCP PocketBase

[English](./README.md) | **中文**

---

一个基于模型上下文协议（MCP）的 PocketBase 服务器，使 AI 助手能够通过标准化工具与您的 PocketBase 数据库交互。

## 功能特性

- 🔍 **集合发现**：列出并探索 PocketBase 数据库中的所有集合
- 📋 **模式检查**：获取任何集合的详细模式信息
- 🔐 **权限管理**：轻松管理集合的 API 访问规则
- 🔧 **管理员和访客模式**：支持已认证的管理员和访客访问模式
- 🚀 **MCP 标准**：基于模型上下文协议构建，实现无缝 AI 集成

## 可用工具

| 工具                            | 描述                              | 需要认证 |
| ------------------------------- | --------------------------------- | -------- |
| `ping`                          | 健康检查端点                      | 否       |
| `list_collections`              | 列出所有集合（支持分页和过滤）    | 是       |
| `get_collection`                | 获取特定集合的详细模式            | 是       |
| `unlock_collection_permissions` | 移除所有 API 权限规则（公开访问） | 是       |
| `set_collection_permissions`    | 统一设置所有 API 的权限规则       | 是       |

## 安装

### 前置要求

- Node.js 18+ 或 Bun
- pnpm（推荐）或 npm
- 运行中的 PocketBase 实例

### 设置步骤

1. **克隆仓库**

    ```bash
    git clone <repository-url>
    cd mcp-pocketbase
    ```

2. **安装依赖**

    ```bash
    pnpm install
    ```

3. **配置环境变量**

    ```bash
    cp .env.example .env
    ```

    编辑 `.env` 文件并配置：

    ```env
    # PocketBase 服务器地址（必填）
    POCKETBASE_URL=http://127.0.0.1:8090

    # 管理员凭据（管理员模式必填）
    POCKETBASE_ADMIN_EMAIL=admin@example.com
    POCKETBASE_ADMIN_PASSWORD=your_password
    ```

    > **注意**：如果不提供管理员凭据，服务器将以访客模式运行，功能受限。

## 使用方式

### 开发模式

以开发模式运行服务器（支持热重载）：

```bash
pnpm build
pnpm debug
```

这将启动 MCP 检查器，允许您交互式地测试工具。

### 生产模式

1. **构建项目**

    ```bash
    pnpm build
    ```

2. **运行服务器**
    ```bash
    node build/index.js
    ```

### 独立可执行文件

使用 Bun 构建独立可执行文件：

```bash
pnpm bundle
```

这将创建一个 `mcp-pb` 可执行文件，可以在没有 Node.js 的环境中分发使用。

### 与 MCP 客户端集成

添加到您的 MCP 客户端配置（例如 Claude Desktop）：

```json
{
    "mcpServers": {
        "pocketbase": {
            "command": "node",
            "args": ["/absolute/path/to/mcp-pocketbase/build/index.js"],
            "env": {
                "POCKETBASE_URL": "http://127.0.0.1:8090",
                "POCKETBASE_ADMIN_EMAIL": "admin@example.com",
                "POCKETBASE_ADMIN_PASSWORD": "your_password"
            }
        }
    }
}
```

或使用独立可执行文件：

```json
{
    "mcpServers": {
        "pocketbase": {
            "command": "/absolute/path/to/mcp-pocketbase/mcp-pb",
            "env": {
                "POCKETBASE_URL": "http://127.0.0.1:8090",
                "POCKETBASE_ADMIN_EMAIL": "admin@example.com",
                "POCKETBASE_ADMIN_PASSWORD": "your_password"
            }
        }
    }
}
```

## 开发指南

### 项目结构

```
mcp-pocketbase/
├── src/
│   ├── index.ts          # 主 MCP 服务器和工具定义
│   └── pocketbase.ts     # PocketBase 客户端初始化和认证
├── build/                # 编译后的 JavaScript 输出
├── scripts/              # 构建和实用脚本
├── .env.example          # 环境变量模板
├── manifest.json         # MCP 服务器清单
├── package.json          # 项目依赖和脚本
└── tsconfig.json         # TypeScript 配置
```

### 可用脚本

| 脚本          | 描述                            |
| ------------- | ------------------------------- |
| `pnpm build`  | 将 TypeScript 编译为 JavaScript |
| `pnpm bundle` | 使用 Bun 创建独立可执行文件     |
| `pnpm debug`  | 使用 MCP 检查器运行以进行测试   |
| `pnpm format` | 使用 Prettier 格式化代码        |
| `pnpm commit` | 使用 Commitizen 进行交互式提交  |

### 代码质量

本项目使用：

- **TypeScript** 提供类型安全
- **Prettier** 进行代码格式化
- **Husky** 管理 git 钩子
- **Commitizen** 规范化提交信息
- **lint-staged** 进行提交前检查

### 添加新工具

1. 在 `src/index.ts` 中定义您的工具：

    ```typescript
    server.tool(
        'tool_name',
        'Tool description',
        {
            param1: z.string().describe('参数描述')
        },
        async ({param1}) => {
            // 工具实现
            return {
                content: [{type: 'text', text: '结果'}]
            };
        }
    );
    ```

2. 重新构建并测试：
    ```bash
    pnpm build
    pnpm debug
    ```

### 认证模式

#### 管理员模式（完全访问）

同时设置 `POCKETBASE_ADMIN_EMAIL` 和 `POCKETBASE_ADMIN_PASSWORD` 以启用所有工具。

#### 访客模式（受限访问）

省略管理员凭据。只有不需要认证的工具才能工作。

## 故障排除

### 连接问题

- 验证 `POCKETBASE_URL` 是否正确且 PocketBase 正在运行
- 如果使用远程 PocketBase 实例，检查防火墙设置

### 认证失败

- 验证管理员凭据是否正确
- 确保管理员账户在 PocketBase 中存在
- 检查 PocketBase 日志以查看认证错误

### 工具错误

- 启用调试日志：`DEBUG=mcp* node build/index.js`
- 查看 PocketBase API 文档了解集合/权限要求

## 许可证

ISC
