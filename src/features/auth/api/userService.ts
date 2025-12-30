// src/features/auth/api/userService.ts
import api from "@/service/api";
import type { User } from "@/types/auth";

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    enabled?: boolean;
}

export const getMe = async (): Promise<User> => {
    const { data } = await api.get<User>("/v1/users/me");
    return data;
};

export const updateMe = async (payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.put<User>("/v1/users/me", payload);
    return data;
};
