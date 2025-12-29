import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { z } from "zod";
import { AxiosError } from "axios";
import clsx from "clsx"; // Certifique-se de instalar: npm install clsx

// Imports da Arquitetura
import { useTenant } from "@/context/useTenant";
import { loginUser } from "../api/authService";
import { setCredentials } from "@/store/slices/authSlice";
import type { LoginCredentials } from "@/types/auth";
import type { ErrorResult } from "@/types/error";

// --- SCHEMA DE VALIDAÇÃO ZOD ---
const loginSchema = z.object({
    email: z
        .string()
        .min(1, "O e-mail é obrigatório")
        .email("Formato de e-mail inválido"),
    password: z
        .string()
        .min(1, "A senha é obrigatória"),
});

// Definição manual do tipo de erro
type LoginFormErrors = {
    [key in keyof z.infer<typeof loginSchema>]?: string[];
};

export const Login: React.FC = () => {
    const { tenant } = useTenant();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Estados
    const [formData, setFormData] = useState<LoginCredentials>({
        email: "",
        password: "",
    });
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoveryError, setRecoveryError] = useState<string | null>(null);
    const [isRecovering, setIsRecovering] = useState(false);
    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    // 1. MEMOIZATION DOS BACKGROUNDS
    const backgrounds = useMemo(() => {
        const bg = tenant.assets.loginBackground;
        return Array.isArray(bg) ? bg : [bg];
    }, [tenant.assets.loginBackground]);

    // 2. ROTAÇÃO DE IMAGENS
    useEffect(() => {
        if (backgrounds.length <= 1) return;
        const intervalId = setInterval(() => {
            setCurrentBgIndex((prevIndex) =>
                prevIndex === backgrounds.length - 1 ? 0 : prevIndex + 1
            );
        }, 120000);
        return () => clearInterval(intervalId);
    }, [backgrounds]);

    // 3. MUTATION (API)
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            dispatch(setCredentials({ token: data.token }));
            toast.success(`Bem-vindo ao ${tenant.name}!`);
            navigate("/metro");
        },
        onError: (error: AxiosError<ErrorResult>) => {
            console.error("Erro no login:", error);

            const apiError = error.response?.data;
            const msg = apiError?.message || "Credenciais inválidas. Tente novamente.";

            toast.error(msg);
        },
    });

    // --- HANDLERS ---

    // Validação em Tempo Real
    const validateField = (name: keyof LoginCredentials, value: string) => {
        // safeParse parcial apenas para o campo
        const fieldSchema = loginSchema.shape[name as keyof typeof loginSchema.shape];
        const result = fieldSchema.safeParse(value);

        if (!result.success) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: result.error.flatten().formErrors,
            }));
        } else {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Limpa o erro ao digitar
        if (formErrors[name as keyof LoginCredentials]) {
            validateField(name as keyof LoginCredentials, value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors = result.error.flatten().fieldErrors;
            setFormErrors(formattedErrors);
            toast.warn("Verifique os campos destacados.");
            return;
        }

        setFormErrors({});
        loginMutation.mutate(formData);
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsForgotPassword(true);
        setRecoveryError(null);
    };

    const handleBackToLogin = (e?: React.MouseEvent) => {
        e?.preventDefault();
        setIsForgotPassword(false);
    };

    const handleRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecoveryError(null);

        const emailResult = z.string().email("Formato de e-mail inválido").safeParse(recoveryEmail);
        if (!emailResult.success) {
            setRecoveryError(emailResult.error.flatten().formErrors[0]);
            return;
        }

        setIsRecovering(true);

        // Mock de envio de e-mail
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success("Se o e-mail informado estiver em nossa base, você receberá as instruções de recuperação.");
            setIsForgotPassword(false);
            setRecoveryEmail("");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Ocorreu um erro ao tentar processar sua solicitação.");
        } finally {
            setIsRecovering(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans bg-bg">
            {/* Esquerda - Formulário */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-surface z-10 border-r border-border">
                <div className="mx-auto w-full max-w-sm lg:w-96">

                    <div className="text-center lg:text-left">
                        <img
                            className="h-24 w-auto mx-auto lg:mx-0 mb-8"
                            src={tenant.assets.logo}
                            alt={`Logo ${tenant.name}`}
                        />
                        <h2 className="mt-2 text-3xl font-bold leading-9 tracking-tight text-text">
                            {isForgotPassword ? "Recuperar senha" : "Acesse sua conta"}
                        </h2>
                    </div>

                    <div className="mt-10">
                        {!isForgotPassword ? (
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className={clsx("block text-sm font-medium leading-6", formErrors.email ? "text-danger" : "text-text")}>
                                        E-mail
                                    </label>
                                    <div className="mt-2 relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={() => validateField("email", formData.email)}
                                            aria-invalid={!!formErrors.email}
                                            aria-describedby={formErrors.email ? "email-error" : undefined}
                                            placeholder="nome@exemplo.sp.gov.br"
                                            className={clsx(
                                                "block w-full rounded-md py-2.5 px-3 text-sm outline-none transition-all duration-200 border",
                                                formErrors.email
                                                    ? "bg-red-50 text-red-900 border-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-danger focus:border-danger pr-10"
                                                    : "bg-white text-text border-border placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary"
                                            )}
                                        />
                                        {formErrors.email && (
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <ExclamationCircleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.email && (
                                        <p className="mt-2 text-sm text-danger" id="email-error">
                                            {formErrors.email[0]}
                                        </p>
                                    )}
                                </div>

                                {/* Senha */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className={clsx("block text-sm font-medium leading-6", formErrors.password ? "text-danger" : "text-text")}>
                                            Senha
                                        </label>
                                        <div className="text-sm/6">
                                            <a
                                                href="#"
                                                onClick={handleForgotPassword}
                                                className="font-semibold text-link hover:text-link/80 hover:underline"
                                            >
                                                Esqueceu a senha?
                                            </a>
                                        </div>
                                    </div>
                                    <div className="mt-2 relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            aria-invalid={!!formErrors.password}
                                            placeholder="••••••••"
                                            className={clsx(
                                                "block w-full rounded-md py-2.5 px-3 text-sm outline-none transition-all duration-200 border",
                                                formErrors.password
                                                    ? "bg-red-50 text-red-900 border-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-danger focus:border-danger pr-10"
                                                    : "bg-white text-text border-border placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary"
                                            )}
                                        />
                                        {formErrors.password && (
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <ExclamationCircleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.password && (
                                        <p className="mt-2 text-sm text-danger" id="password-error">
                                            {formErrors.password[0]}
                                        </p>
                                    )}
                                </div>

                                {/* Botão */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loginMutation.isPending}
                                        className="flex w-full justify-center rounded-md bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {loginMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span>
                                        ) : (
                                            "Entrar na Plataforma"
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleRecoverySubmit} className="space-y-6" noValidate>
                                <div>
                                    <label htmlFor="recovery-email" className={clsx("block text-sm font-medium leading-6", recoveryError ? "text-danger" : "text-text")}>
                                        E-mail para recuperação
                                    </label>
                                    <div className="mt-2 relative">
                                        <input
                                            id="recovery-email"
                                            name="email"
                                            type="email"
                                            value={recoveryEmail}
                                            onChange={(e) => {
                                                setRecoveryEmail(e.target.value);
                                                if (recoveryError) setRecoveryError(null);
                                            }}
                                            placeholder="nome@exemplo.sp.gov.br"
                                            className={clsx(
                                                "block w-full rounded-md py-2.5 px-3 text-sm outline-none transition-all duration-200 border",
                                                recoveryError
                                                    ? "bg-red-50 text-red-900 border-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-danger focus:border-danger pr-10"
                                                    : "bg-white text-text border-border placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary"
                                            )}
                                        />
                                        {recoveryError && (
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <ExclamationCircleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
                                            </div>
                                        )}
                                    </div>
                                    {recoveryError && (
                                        <p className="mt-2 text-sm text-danger">
                                            {recoveryError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isRecovering}
                                        className="flex w-full justify-center rounded-md bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isRecovering ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Enviando...
                                            </span>
                                        ) : (
                                            "Enviar"
                                        )}
                                    </button>
                                </div>

                                <div className="text-center lg:text-left">
                                    <a
                                        href="#"
                                        onClick={handleBackToLogin}
                                        className="text-sm font-semibold text-link hover:text-link/80 hover:underline"
                                    >
                                        Voltar para o login
                                    </a>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Direita - Background */}
            <div className="relative hidden w-0 flex-1 lg:block overflow-hidden bg-neutral-900">
                {backgrounds.map((bg, index) => (
                    <img
                        key={`${bg}-${index}`}
                        src={bg}
                        alt={`Imagem Institucional ${index + 1}`}
                        className={`
              absolute inset-0 h-full w-full object-cover 
              transition-opacity duration-1000 ease-in-out
              ${index === currentBgIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}
            `}
                        style={{
                            zIndex: index === currentBgIndex ? 10 : 0,
                            transform: index === currentBgIndex ? 'scale(1.05)' : 'scale(1)'
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-black/20 z-20 pointer-events-none" />
            </div>
        </div>
    );
};