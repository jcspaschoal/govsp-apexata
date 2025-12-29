// src/features/auth/api/authService.ts
import api from "@/service/api";
import type {AuthResponse, LoginCredentials} from "@/types/auth";

export const loginUser = async ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
    const basicAuth = 'Basic ' + btoa(`${email}:${password}`);

    const { data } = await api.get<AuthResponse>('/v1/auth/token', {
        headers: {
            Authorization: basicAuth
        }
    });

    return data;
};