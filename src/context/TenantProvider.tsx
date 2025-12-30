import React, { useEffect, useState } from 'react';
import { getTenantConfig, type TenantConfig } from '@/config/tenants';
import { TenantContext } from "./tenantContext";



export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
    const [tenant] = useState<TenantConfig>(getTenantConfig());

    useEffect(() => {
        const root = document.documentElement;
        if (tenant.theme) {
            Object.entries(tenant.theme).forEach(([key, value]) => {
                if (value) root.style.setProperty(key, value);
            });
        }
        // Update Title/Favicon se necessário
        document.title = `${tenant.name} - Plataforma`;

        if (tenant.assets.favicon) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = tenant.assets.favicon;
        }
    }, [tenant]);

    return (
        <TenantContext.Provider value={{ tenant }}>
            {children}
        </TenantContext.Provider>
    );
};

