// src/types/auth.ts

// Schema: Token
export interface AuthResponse {
    token: string;
}


export interface LoginCredentials {
    email: string;
    password: string;
}

// Schema: User
// 1. Definição das Roles (Baseado no seu business/types/role)
// Ajuste conforme os valores reais do seu enum em Go (ex: 'ADMIN', 'USER', etc)
export type UserRole = 'ADMIN' | 'ANALYST' | 'USER';

// 2. Interface Principal dos Claims
export interface AuthClaims {
    // Campos Padrão (jwt.RegisteredClaims)
    iss?: string;       // Issuer (Emissor)
    sub: string;        // Subject (ID do Usuário - UUID)
    exp: number;        // Expiration Time (Unix Timestamp)
    iat: number;        // Issued At (Unix Timestamp)
    nbf?: number;       // Not Before (Opcional)
    aud?: string[];     // Audience (Opcional)
    jti?: string;       // JWT ID (Opcional)

    // Campos Personalizados (Sua struct Claims)
    tenant_id?: string; // UUID (Opcional devido ao omitempty)
    dashboard_id: string; // UUID
    role: UserRole | string; // Role do usuário
}

export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}