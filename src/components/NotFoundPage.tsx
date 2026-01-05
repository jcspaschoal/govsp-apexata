import React from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleBackToLogin = () => {
        if (isAuthenticated) {
            dispatch(logout());
        }
        navigate("/");
    };

    return (
        <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 font-sans">
            <div className="text-center">
                <p className="text-base font-semibold text-primary">404</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
                    Página não encontrada
                </h1>
                <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                    Desculpe, não conseguimos encontrar a página que você está procurando.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <button
                        onClick={handleBackToLogin}
                        className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all active:scale-95"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        </main>
    );
};
