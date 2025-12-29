// src/features/auth/api/authService.ts
import api from "@/service/api";
import type {AuthResponse, LoginCredentials} from "@/types/auth";

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/v1/auth/login', credentials);
    return data;
};