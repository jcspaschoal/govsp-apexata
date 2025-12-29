import {createContext} from "react";
import type {TenantConfig} from "@/config/tenants.ts";


interface TenantContextProps {
    tenant: TenantConfig;
}


export const TenantContext = createContext<TenantContextProps | null>(null);
