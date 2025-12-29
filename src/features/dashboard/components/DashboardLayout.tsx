// src/features/dashboard/components/DashboardLayout.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router";
import { getMyDashboard } from "../api/dashboardService";
import { logout } from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import type {RootState} from "@/store";
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export const DashboardLayout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const { data: dashboard, isLoading, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

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
        const firstPage = [...dashboard.pages].sort((a, b) => a.order - b.order)[0];
        return <Navigate to={`/dashboard/page/${firstPage.id}`} replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar - SP Government Institutional */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <img
                                src="/assets/govsp/logo.png"
                                alt="Governo de SP"
                                className="h-10 w-auto"
                            />
                            <div className="ml-4 pl-4 border-l border-gray-300 h-8 flex items-center">
                                <span className="text-gray-900 font-semibold tracking-tight uppercase text-sm">
                                    {dashboard.name}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center text-gray-700 text-sm">
                                <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                                <span className="font-medium">{user?.name}</span>
                            </div>
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
                <nav className="bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 shadow-sm">
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
