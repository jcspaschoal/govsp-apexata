// src/features/auth/api/userService.ts
import api from "@/service/api";
import { User } from "@/types/auth";

export const getMe = async (): Promise<User> => {
    // Note: The api.yaml shows PUT and DELETE for /v1/me, but usually there's a GET /v1/me 
    // or we might need to use /v1/users/{id} if we have the ID in the token.
    // Looking at api.yaml, I see /v1/users/{user_id} GET.
    // However, a common pattern is GET /v1/me. If not present, I'll use the ID from token.
    const { data } = await api.get<User>('/v1/me');
    return data;
};
