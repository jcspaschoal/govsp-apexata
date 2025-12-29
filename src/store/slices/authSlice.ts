// src/store/slices/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { jwtDecrypt } from "@/utils/jwtDecrypt";
import type {AuthClaims} from "@/types/auth";

interface AuthState {
    token: string | null;
    user: AuthClaims | null;
    isAuthenticated: boolean;
}

const tokenFromCookie = Cookies.get("token");
let userFromCookie: AuthClaims | null = null;

if (tokenFromCookie) {
    try {
        userFromCookie = jwtDecrypt(tokenFromCookie);
    } catch {
        Cookies.remove("token");
    }
}

const initialState: AuthState = {
    token: tokenFromCookie || null,
    user: userFromCookie,
    isAuthenticated: !!tokenFromCookie && !!userFromCookie,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string }>) => {
            const { token } = action.payload;
            state.token = token;
            state.isAuthenticated = true;
            state.user = jwtDecrypt(token);

            Cookies.set("token", token, { expires: 1 }); // 1 dia
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            Cookies.remove("token");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;