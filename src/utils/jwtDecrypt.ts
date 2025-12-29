import { jwtDecode } from "jwt-decode";
import type {AuthClaims} from "@/types/auth";

export const jwtDecrypt = (token: string): AuthClaims => {
    return jwtDecode<AuthClaims>(token);
};