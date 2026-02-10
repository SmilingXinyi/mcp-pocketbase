import PocketBase from 'pocketbase';
import Debug from 'debug';

const debug = Debug('mcp:pocketbase');

// 配置接口
export interface PocketBaseConfig {
    url: string;
    adminEmail?: string;
    adminPassword?: string;
}

// 从环境变量读取配置
export function getConfigFromEnv(): PocketBaseConfig {
    const url = process.env.POCKETBASE_URL;
    if (!url) {
        throw new Error('POCKETBASE_URL 环境变量未设置');
    }

    return {
        url,
        adminEmail: process.env.POCKETBASE_ADMIN_EMAIL,
        adminPassword: process.env.POCKETBASE_ADMIN_PASSWORD
    };
}

// PocketBase 客户端单例
let pbInstance: PocketBase | null = null;
let isAuthenticated = false;

/**
 * 初始化 PocketBase 客户端
 * 如果提供了管理员凭据，会自动进行认证
 */
export async function initPocketBase(config?: PocketBaseConfig): Promise<PocketBase> {
    if (pbInstance) {
        return pbInstance;
    }

    const cfg = config || getConfigFromEnv();
    pbInstance = new PocketBase(cfg.url);

    // 如果提供了管理员凭据，进行认证
    if (cfg.adminEmail && cfg.adminPassword) {
        try {
            await pbInstance.collection('_superusers').authWithPassword(cfg.adminEmail, cfg.adminPassword);
            isAuthenticated = true;
            debug('已以管理员身份认证');
        } catch (error) {
            debug('管理员认证失败:', error);
            throw new Error(`PocketBase 管理员认证失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    } else {
        debug('未提供管理员凭据，以匿名模式运行');
    }

    return pbInstance;
}

/**
 * 获取 PocketBase 客户端实例
 * 如果尚未初始化，会自动初始化
 */
export async function getPocketBase(): Promise<PocketBase> {
    if (!pbInstance) {
        return initPocketBase();
    }
    return pbInstance;
}

/**
 * 检查是否已认证
 */
export function isAdminAuthenticated(): boolean {
    return isAuthenticated;
}

/**
 * 重置客户端（主要用于测试）
 */
export function resetClient(): void {
    if (pbInstance) {
        pbInstance.authStore.clear();
    }
    pbInstance = null;
    isAuthenticated = false;
}
