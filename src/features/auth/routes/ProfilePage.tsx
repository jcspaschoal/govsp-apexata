// src/features/auth/routes/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckIcon, UserCircleIcon, KeyIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { getMe, updateMe } from "../api/userService";

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { data: user, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
    });

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const updateProfileMutation = useMutation({
        mutationFn: updateMe,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success("Perfil atualizado com sucesso!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (error: any) => {
            console.error("Erro ao atualizar perfil:", error);
            const errorMsg = error.response?.data?.error || "Erro ao atualizar o perfil.";
            toast.error(errorMsg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação de Nome
        if (name.length < 3 || name.length > 100) {
            toast.error("O nome deve ter entre 3 e 100 caracteres.");
            return;
        }

        const payload: any = { name };

        // Validação de Senha (se preenchida)
        if (newPassword) {
            const passwordRegex = /^[a-zA-Z0-9#@!-]{6,}$/;
            if (!passwordRegex.test(newPassword)) {
                toast.error("A senha deve ter no mínimo 6 caracteres e conter apenas letras, números e # @ ! -");
                return;
            }

            if (newPassword !== confirmPassword) {
                toast.error("As senhas não coincidem.");
                return;
            }
            payload.password = newPassword;
        }

        updateProfileMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-pulse text-gray-500">Carregando perfil...</div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Voltar"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Gerenciar conta</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center mb-4">
                            <UserCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-800">Informações Básicas</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mail (não pode ser alterado)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Nome"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <KeyIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-800">Alterar Senha</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 mb-2">
                                Deixe em branco se não desejar alterar a senha. <br />
                                <span className="font-medium text-blue-600">Mínimo 6 caracteres, apenas letras, números e # @ ! -</span>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 font-medium text-sm"
                        >
                            {updateProfileMutation.isPending ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                                <CheckIcon className="h-4 w-4 mr-2" />
                            )}
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
