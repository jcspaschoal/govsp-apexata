// src/config/tenants.ts

export interface ThemeConfig {
    // Brand
    '--brand-primary-rgb': string;
    '--brand-secondary-rgb': string;
    '--brand-accent-rgb': string;
    '--brand-success-rgb': string;
    '--brand-danger-rgb': string;

    // Neutrals
    '--neutral-0-rgb'?: string;
    '--neutral-100-rgb'?: string;
    '--neutral-200-rgb'?: string;
    '--neutral-400-rgb'?: string;
    '--neutral-500-rgb'?: string;
    '--neutral-900-rgb'?: string;

    // Action Colors (para botões e estados)
    '--action-primary-rgb'?: string;
    '--action-hover-rgb'?: string;
    '--action-active-rgb'?: string;

    // On Colors (Texto sobre fundo)
    '--on-primary-rgb'?: string;
    '--on-secondary-rgb'?: string;

    '--font-sans'?: string;
    '--font-mono'?: string;
}

export interface TenantConfig {
    id: string;
    name: string;
    assets: {
        logo: string;
        loginBackground: string | string[];
    };
    theme: Partial<ThemeConfig>;
}

// Configuração Padrão (Metro SP / Governo)
const defaultTenant: TenantConfig = {
    id: 'default',
    name: 'Metro SP',
    assets: {
        logo: '/assets/logo_default.png',
        loginBackground: '/assets/bg_login.jpg',
    },
    theme: {
        '--brand-primary-rgb': '255 22 31',    // Vermelho
        '--brand-secondary-rgb': '3 78 162',   // Azul
        '--brand-accent-rgb': '251 185 0',     // Amarelo
        '--brand-success-rgb': '11 146 71',    // Verde
        '--brand-danger-rgb': '255 22 31',

        '--action-primary-rgb': '235 20 29',
        '--action-hover-rgb': '209 12 20',
        '--action-active-rgb': '179 10 16',

        '--neutral-0-rgb': '255 255 255',
        '--neutral-100-rgb': '245 245 245',
        '--neutral-200-rgb': '229 229 229',
        '--neutral-400-rgb': '64 64 64',
        '--neutral-500-rgb': '128 128 128',
        '--neutral-900-rgb': '0 0 0',

        '--on-primary-rgb': '255 255 255',
    },
};

export const TENANT_MAP: Record<string, TenantConfig> = {
    'localhost': defaultTenant,
    'govsp.apexata.com': {
        id: 'apexata.govsp.com',
        name: 'Governo do Estado de São Paulo',
        assets: {
            logo: '/assets/govsp/logo.png',
            loginBackground: [
                '/assets/govsp/imagem_1.jpg',
                '/assets/govsp/imagem_2.jpg',
                '/assets/govsp/imagem_3.jpg',
                '/assets/govsp/imagem_4.jpg',
                '/assets/govsp/imagem_5.jpg'
            ],
        },
        theme: {
            // Cores Oficiais (Brand)
            '--brand-primary-rgb': '255 22 31',    // #FF161F
            '--brand-secondary-rgb': '3 78 162',   // #034EA2
            '--brand-accent-rgb': '251 185 0',     // #FBB900
            '--brand-success-rgb': '11 146 71',    // #0B9247
            '--brand-danger-rgb': '255 22 31',

            // Cores de Ação (Acessibilidade WCAG AA)
            '--action-primary-rgb': '235 20 29',   // #EB141D
            '--action-hover-rgb': '209 12 20',     // #D10C14
            '--action-active-rgb': '179 10 16',    // #B30A10

            // Neutros
            '--neutral-0-rgb': '255 255 255',      // #FFFFFF
            '--neutral-100-rgb': '245 245 245',    // #F5F5F5 (Surface)
            '--neutral-200-rgb': '229 229 229',    // #E5E5E5 (Border)
            '--neutral-400-rgb': '64 64 64',       // #404040 (Texto Secundário)
            '--neutral-500-rgb': '128 128 128',    // #808080 (Muted)
            '--neutral-900-rgb': '0 0 0',          // #000000

            '--on-primary-rgb': '255 255 255',
            '--on-secondary-rgb': '255 255 255'
        }
    }
};

export const getTenantConfig = (): TenantConfig => {
    const devTenantId = import.meta.env.VITE_DEV_TENANT_ID;

    if (devTenantId) {
        const foundTenant = Object.values(TENANT_MAP).find(t => t.id === devTenantId);
        if (foundTenant) {
            console.info(`[DevMode] Forçando Tenant: ${foundTenant.name}`);
            return foundTenant;
        }
        console.warn(`[DevMode] Tenant ID "${devTenantId}" não encontrado no mapa.`);
    }

    // 2. Detecção Normal via Hostname
    const hostname = window.location.hostname;
    return TENANT_MAP[hostname] || defaultTenant;
};