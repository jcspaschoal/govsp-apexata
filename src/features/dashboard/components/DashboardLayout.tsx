// src/features/dashboard/components/DashboardLayout.tsx
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router";
import { getMyDashboard } from "../api/dashboardService";
import { logout } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { ArrowLeftOnRectangleIcon, UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { getMe } from "@/features/auth/api/userService";
import Footer from "./Footer";

import { useTenant } from "@/context/useTenant";

export const DashboardLayout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Fechar menu com ESC e gerenciar scroll do body
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                buttonRef.current?.focus();
            }
        };

        if (isMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Focus trap logic
    useEffect(() => {
        if (isMenuOpen && menuRef.current) {
            const focusableElements = menuRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            const handleTab = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            const element = menuRef.current;
            element.addEventListener('keydown', handleTab);
            firstElement?.focus();

            return () => {
                element.removeEventListener('keydown', handleTab);
            };
        }
    }, [isMenuOpen]);

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
        return <Navigate to={`/dashboard/${dashboard.id}/page/${firstPage.id}`} replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar - SP Government Institutional */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            {/* Hamburger Button - Mobile Only */}
                            <button
                                ref={buttonRef}
                                type="button"
                                className="lg:hidden mr-2 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                onClick={() => setIsMenuOpen(true)}
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                                aria-label="Abrir menu principal"
                            >
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            </button>

                            <img
                                src={tenant.assets.logo}
                                alt={tenant.name}
                                className="h-14 w-auto"
                            />
                            <div className="ml-4 pl-4 border-l border-gray-300 h-10 flex items-center">
                                <span className="text-gray-900 font-semibold tracking-tight uppercase text-sm">
                                    {dashboard.name}
                                </span>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center space-x-6">
                            <button
                                onClick={() => navigate("/dashboard/profile")}
                                className="flex items-center text-gray-700 hover:text-blue-700 transition-colors duration-200 text-sm group"
                            >
                                <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400 group-hover:text-blue-500" />
                                <span className="font-medium">{userData?.name}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-gray-500 hover:text-red-600 transition-colors duration-200 text-sm font-medium"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navbar Tabs */}
                <nav className="hidden lg:block bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 shadow-sm">
                    <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                        {[...dashboard.pages].sort((a, b) => a.order - b.order).map((page) => (
                            <NavLink
                                key={page.id}
                                to={`/dashboard/${dashboard.id}/page/${page.id}`}
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

            {/* Mobile Navigation Menu (Slide-over) */}
            <div 
                className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ease-in-out ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
                role="dialog" 
                aria-modal="true" 
                id="mobile-menu"
            >
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
                    aria-hidden="true"
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Menu Panel */}
                <div
                    ref={menuRef}
                    className={`fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl flex flex-col focus:outline-none transition-transform duration-300 ease-in-out transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                    aria-labelledby="mobile-menu-title"
                >
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <span id="mobile-menu-title" className="text-gray-900 font-bold uppercase text-sm tracking-wider">Menu</span>
                        <button
                            type="button"
                            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="sr-only">Fechar menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                        {[...dashboard.pages].sort((a, b) => a.order - b.order).map((page) => (
                            <NavLink
                                key={page.id}
                                to={`/dashboard/${dashboard.id}/page/${page.id}`}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                {page.title}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer Section of Menu */}
                    <div className="border-t border-gray-200 p-4 bg-white">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                navigate("/dashboard/profile");
                            }}
                            className="flex w-full items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700 rounded-md transition-colors duration-200 mb-1"
                        >
                            <UserCircleIcon className="h-6 w-6 mr-3 text-gray-400" />
                            Editar Perfil
                        </button>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                handleLogout();
                            }}
                            className="flex w-full items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
                        >
                            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3 text-gray-400" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};
