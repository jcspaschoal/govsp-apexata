import {useContext} from "react";
import {TenantContext} from "./tenantContext.ts"

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) throw new Error('useTenant fora do TenantProvider');
    return context;
};
