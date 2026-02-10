# MCP PocketBase

**English** | [中文](./README_CN.md)

---

A Model Context Protocol (MCP) server for PocketBase that enables AI assistants to interact with your PocketBase database through standardized tools.

## Features

- 🔍 **Collection Discovery**: List and explore all collections in your PocketBase database
- 📋 **Schema Inspection**: Get detailed schema information for any collection
- 🔐 **Permission Management**: Easily manage API access rules for collections
- 🔧 **Admin & Guest Modes**: Supports both authenticated admin and guest access modes
- 🚀 **MCP Standard**: Built on the Model Context Protocol for seamless AI integration

## Available Tools

| Tool                            | Description                                        | Auth Required |
| ------------------------------- | -------------------------------------------------- | ------------- |
| `ping`                          | Health check endpoint                              | No            |
| `list_collections`              | List all collections with pagination and filtering | Yes           |
| `get_collection`                | Get detailed schema for a specific collection      | Yes           |
| `unlock_collection_permissions` | Remove all API permission rules (make public)      | Yes           |
| `set_collection_permissions`    | Set uniform permission rules across all APIs       | Yes           |

## Installation

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- A running PocketBase instance

### Setup

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd mcp-pocketbase
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

3. **Configure environment variables**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` and configure:

    ```env
    # PocketBase server URL (required)
    POCKETBASE_URL=http://127.0.0.1:8090

    # Admin credentials (required for admin mode)
    POCKETBASE_ADMIN_EMAIL=admin@example.com
    POCKETBASE_ADMIN_PASSWORD=your_password
    ```

    > **Note**: If you don't provide admin credentials, the server will run in guest mode with limited functionality.

## Usage

### Development Mode

Run the server in development mode with hot reload:

```bash
pnpm build
pnpm debug
```

This will start the MCP inspector, allowing you to test tools interactively.

### Production Mode

1. **Build the project**

    ```bash
    pnpm build
    ```

2. **Run the server**
    ```bash
    node build/index.js
    ```

### Standalone Executable

Build a standalone executable using Bun:

```bash
pnpm bundle
```

This creates a `mcp-pb` executable that can be distributed without Node.js.

### Integration with MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop):

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

Or use the standalone executable:

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

## Development

### Project Structure

```
mcp-pocketbase/
├── src/
│   ├── index.ts          # Main MCP server and tool definitions
│   └── pocketbase.ts     # PocketBase client initialization and auth
├── build/                # Compiled JavaScript output
├── scripts/              # Build and utility scripts
├── .env.example          # Environment variable template
├── manifest.json         # MCP server manifest
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Available Scripts

| Script        | Description                           |
| ------------- | ------------------------------------- |
| `pnpm build`  | Compile TypeScript to JavaScript      |
| `pnpm bundle` | Create standalone executable with Bun |
| `pnpm debug`  | Run with MCP inspector for testing    |
| `pnpm format` | Format code with Prettier             |
| `pnpm commit` | Interactive commit with Commitizen    |

### Code Quality

This project uses:

- **TypeScript** for type safety
- **Prettier** for code formatting
- **Husky** for git hooks
- **Commitizen** for conventional commits
- **lint-staged** for pre-commit checks

### Adding New Tools

1. Define your tool in `src/index.ts`:

    ```typescript
    server.tool(
        'tool_name',
        'Tool description',
        {
            param1: z.string().describe('Parameter description')
        },
        async ({param1}) => {
            // Tool implementation
            return {
                content: [{type: 'text', text: 'Result'}]
            };
        }
    );
    ```

2. Rebuild and test:
    ```bash
    pnpm build
    pnpm debug
    ```

### Authentication Modes

#### Admin Mode (Full Access)

Set both `POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` to enable all tools.

#### Guest Mode (Limited Access)

Omit admin credentials. Only tools that don't require authentication will work.

## Troubleshooting

### Connection Issues

- Verify `POCKETBASE_URL` is correct and PocketBase is running
- Check firewall settings if using remote PocketBase instance

### Authentication Failures

- Verify admin credentials are correct
- Ensure the admin account exists in PocketBase
- Check PocketBase logs for authentication errors

### Tool Errors

- Enable debug logging: `DEBUG=mcp* node build/index.js`
- Check PocketBase API documentation for collection/permission requirements

## License

ISC
