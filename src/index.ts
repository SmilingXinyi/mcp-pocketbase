import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
import Debug from 'debug';
import 'dotenv/config';
import {getPocketBase, isAdminAuthenticated} from './pocketbase.js';

const debug = Debug('mcp');

const server = new McpServer({
    name: 'mcp-pocketbase',
    version: '0.1.0'
});

// Health check tool
server.tool('ping', 'Simple health check', {}, async () => ({content: [{type: 'text', text: 'pong'}]}));

// 获取 Collections 列表
server.tool(
    'list_collections',
    'List all collections (tables/schemas) in PocketBase database. Use this to discover available data structures, understand the database schema, or find specific collections by name. Returns collection names, types, and field summaries. Requires admin authentication.',
    {
        page: z.number().optional().default(1).describe('页码，默认为 1'),
        perPage: z.number().optional().default(50).describe('每页数量，默认为 50'),
        filter: z.string().optional().describe('过滤表达式，例如: name~"user"')
    },
    async ({page, perPage, filter}) => {
        try {
            const pb = await getPocketBase();

            if (!isAdminAuthenticated()) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    error: '未认证',
                                    message:
                                        '访问 Collections API 需要管理员权限。请配置 POCKETBASE_ADMIN_EMAIL 和 POCKETBASE_ADMIN_PASSWORD 环境变量。'
                                },
                                null,
                                2
                            )
                        }
                    ],
                    isError: true
                };
            }

            const options: {filter?: string} = {};
            if (filter) {
                options.filter = filter;
            }

            const result = await pb.collections.getList(page, perPage, options);

            // 简化返回数据，只保留关键字段
            const simplifiedItems = result.items.map(collection => ({
                id: collection.id,
                name: collection.name,
                type: collection.type,
                system: collection.system,
                fields: collection.fields?.map((field: {name: string; type: string; required?: boolean}) => ({
                    name: field.name,
                    type: field.type,
                    required: field.required
                }))
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                page: result.page,
                                perPage: result.perPage,
                                totalItems: result.totalItems,
                                totalPages: result.totalPages,
                                items: simplifiedItems
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            debug('list_collections error:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                error: '获取 Collections 列表失败',
                                message: error instanceof Error ? error.message : String(error)
                            },
                            null,
                            2
                        )
                    }
                ],
                isError: true
            };
        }
    }
);

// 获取单个 Collection 详情
server.tool(
    'get_collection',
    'Get detailed schema information for a specific PocketBase collection. Use this to understand the complete field definitions, data types, validation rules, and API access rules of a collection before querying or modifying its records. Requires admin authentication.',
    {
        collectionIdOrName: z.string().describe('Collection 的 ID 或名称')
    },
    async ({collectionIdOrName}) => {
        try {
            const pb = await getPocketBase();

            if (!isAdminAuthenticated()) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    error: '未认证',
                                    message:
                                        '访问 Collections API 需要管理员权限。请配置 POCKETBASE_ADMIN_EMAIL 和 POCKETBASE_ADMIN_PASSWORD 环境变量。'
                                },
                                null,
                                2
                            )
                        }
                    ],
                    isError: true
                };
            }

            const collection = await pb.collections.getOne(collectionIdOrName);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(collection, null, 2)
                    }
                ]
            };
        } catch (error) {
            debug('get_collection error:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                error: '获取 Collection 详情失败',
                                message: error instanceof Error ? error.message : String(error)
                            },
                            null,
                            2
                        )
                    }
                ],
                isError: true
            };
        }
    }
);

// 取消 Collection API 权限要求 (置空权限规则)
server.tool(
    'unlock_collection_permissions',
    'Remove all API permission rules (list, view, create, update, delete) for a specific PocketBase collection by setting them to an empty string. This effectively makes the collection APIs public. Use this for rapid development and prototyping. Requires admin authentication.',
    {
        collectionIdOrName: z.string().describe('Collection 的 ID 或名称')
    },
    async ({collectionIdOrName}) => {
        try {
            const pb = await getPocketBase();

            if (!isAdminAuthenticated()) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    error: '未认证',
                                    message:
                                        '修改 Collection 规则需要管理员权限。请配置 POCKETBASE_ADMIN_EMAIL 和 POCKETBASE_ADMIN_PASSWORD 环境变量。'
                                },
                                null,
                                2
                            )
                        }
                    ],
                    isError: true
                };
            }

            // 获取当前 collection 信息，以确保它存在
            const collection = await pb.collections.getOne(collectionIdOrName);

            // 更新权限规则为空字符串
            const result = await pb.collections.update(collection.id, {
                listRule: '',
                viewRule: '',
                createRule: '',
                updateRule: '',
                deleteRule: ''
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                message: `Collection "${collection.name}" (${collection.id}) 的 API 权限已置空。`,
                                collection: {
                                    id: result.id,
                                    name: result.name,
                                    listRule: result.listRule,
                                    viewRule: result.viewRule,
                                    createRule: result.createRule,
                                    updateRule: result.updateRule,
                                    deleteRule: result.deleteRule
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            debug('unlock_collection_permissions error:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                error: '取消 API 权限要求失败',
                                message: error instanceof Error ? error.message : String(error)
                            },
                            null,
                            2
                        )
                    }
                ],
                isError: true
            };
        }
    }
);

// 统一设置 Collection API 权限要求
server.tool(
    'set_collection_permissions',
    'Set uniform API permission rules (list, view, create, update, delete) for a specific PocketBase collection to a single provided rule string. Use this to quickly apply a common access control policy across all API endpoints of a collection. Requires admin authentication.',
    {
        collectionIdOrName: z.string().describe('Collection 的 ID 或名称'),
        rule: z
            .string()
            .describe('要应用的权限规则字符串，例如: @request.auth.id = "zwl2yz7e5tq5lu9" 或 @request.auth.id != ""')
    },
    async ({collectionIdOrName, rule}) => {
        try {
            const pb = await getPocketBase();

            if (!isAdminAuthenticated()) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    error: '未认证',
                                    message:
                                        '修改 Collection 规则需要管理员权限。请配置 POCKETBASE_ADMIN_EMAIL 和 POCKETBASE_ADMIN_PASSWORD 环境变量。'
                                },
                                null,
                                2
                            )
                        }
                    ],
                    isError: true
                };
            }

            // 获取当前 collection 信息，以确保它存在
            const collection = await pb.collections.getOne(collectionIdOrName);

            // 统一更新所有权限规则
            const result = await pb.collections.update(collection.id, {
                listRule: rule,
                viewRule: rule,
                createRule: rule,
                updateRule: rule,
                deleteRule: rule
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                message: `Collection "${collection.name}" (${collection.id}) 的 API 权限已统一设置为: ${rule}`,
                                collection: {
                                    id: result.id,
                                    name: result.name,
                                    listRule: result.listRule,
                                    viewRule: result.viewRule,
                                    createRule: result.createRule,
                                    updateRule: result.updateRule,
                                    deleteRule: result.deleteRule
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            debug('set_collection_permissions error:', error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                error: '设置 API 权限要求失败',
                                message: error instanceof Error ? error.message : String(error)
                            },
                            null,
                            2
                        )
                    }
                ],
                isError: true
            };
        }
    }
);

async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server running on stdio');
}

startServer().catch(err => {
    console.error('MCP Server error:', err);
    process.exit(1);
});
