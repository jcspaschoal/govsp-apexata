// src/features/dashboard/components/DashboardLayout.tsx
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router";
import { getMyDashboard } from "../api/dashboardService";
import { logout } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { ArrowLeftOnRectangleIcon, UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { getMe } from "@/features/auth/api/userService";

import { useTenant } from "@/context/useTenant";

export const DashboardLayout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const { data: dashboard, isLoading: isLoadingDashboard, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    // Fetch user details separately since name is not in JWT claims
    const { data: userData, isLoading: isLoadingUser } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        retry: false
    });

    const isLoading = isLoadingDashboard || isLoadingUser;

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                buttonRef.current?.focus();
            }
        };

        const handleTabTrap = (e: KeyboardEvent) => {
            if (e.key !== "Tab" || !menuRef.current) return;

            const focusableElements = menuRef.current.querySelectorAll(
                'button, [href], a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        if (isMenuOpen) {
            document.addEventListener("keydown", handleEscape);
            document.addEventListener("keydown", handleTabTrap);
            // Disable scroll when menu is open
            document.body.style.overflow = "hidden";
            // Focus the close button or first menu item after a short delay to allow for rendering
            setTimeout(() => {
                const firstLink = menuRef.current?.querySelector("a, button") as HTMLElement;
                firstLink?.focus();
            }, 100);
        } else {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("keydown", handleTabTrap);
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("keydown", handleTabTrap);
            document.body.style.overflow = "unset";
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="text-gray-500 animate-pulse">Carregando dashboard...</div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="text-red-500">Erro ao carregar dashboard.</div>
            </div>
        );
    }

    // Default to the first page if we are just at /dashboard
    if (window.location.pathname === "/dashboard" && dashboard.pages.length > 0) {
        const sortedPages = [...dashboard.pages].sort((a, b) => a.order - b.order);
        const firstPage = sortedPages[0];
        return <Navigate to={`/dashboard/page/${firstPage.id}`} replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar - SP Government Institutional */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            {/* Hamburger Menu Button */}
                            <button
                                ref={buttonRef}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 mr-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                                aria-label="Abrir menu de navegação"
                            >
                                {isMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>

                            <img
                                src={tenant.assets.logo}
                                alt={tenant.name}
                                className="h-10 w-auto"
                            />
                            <div className="ml-4 pl-4 border-l border-gray-300 h-8 flex items-center hidden sm:flex">
                                <span className="text-gray-900 font-semibold tracking-tight uppercase text-sm">
                                    {dashboard.name}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 sm:space-x-6">
                            <button
                                onClick={() => navigate("/dashboard/profile")}
                                className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-200 text-sm group"
                            >
                                <UserCircleIcon className="h-5 w-5 sm:mr-2 text-gray-400 group-hover:text-blue-500" />
                                <span className="font-medium hidden sm:inline">{userData?.name}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm font-medium"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 sm:mr-1" />
                                <span className="hidden sm:inline">Sair</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 z-[60] lg:hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Menu panel */}
                        <div
                            ref={menuRef}
                            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-[70] transform transition-transform duration-300"
                            id="mobile-menu"
                            aria-labelledby="mobile-menu-title"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <span id="mobile-menu-title" className="font-semibold text-gray-900 uppercase text-xs tracking-widest">
                                    Navegação
                                </span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Fechar menu"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto bg-white">
                                {[...dashboard.pages].sort((a, b) => a.order - b.order).map((page) => (
                                    <NavLink
                                        key={page.id}
                                        to={`/dashboard/page/${page.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 rounded-l-none"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                            }`
                                        }
                                    >
                                        {page.title}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="px-2 py-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-all"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navbar Tabs - Desktop */}
                <nav className="hidden lg:block bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 shadow-sm">
                    <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                        {[...dashboard.pages].sort((a, b) => a.order - b.order).map((page) => (
                            <NavLink
                                key={page.id}
                                to={`/dashboard/page/${page.id}`}
                                className={({ isActive }) =>
                                    `py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                                        isActive
                                            ? "border-blue-700 text-blue-700"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`
                                }
                            >
                                {page.title}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
