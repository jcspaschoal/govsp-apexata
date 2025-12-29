// src/features/dashboard/routes/DashboardPage.tsx
import React from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyDashboard } from "../api/dashboardService";

export const DashboardPage: React.FC = () => {
    const { pageId } = useParams<{ pageId: string }>();

    const { data: dashboard } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    const page = dashboard?.pages.find((p) => p.id === pageId);

    if (!page) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500">Página não encontrada.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {page.title}
                </h1>
                {page.text && (
                    <p className="mt-2 text-lg text-gray-600 max-w-3xl">
                        {page.text}
                    </p>
                )}
            </header>

            {/* Layout based on page.layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Initial placeholders for widgets */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <span className="text-gray-400 font-medium italic">Gráfico Principal (Em breve)</span>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="11 3.055A9.003 9.003 0 003.055 11H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                    </div>
                    <span className="text-gray-400 font-medium italic">Distribuição (Em breve)</span>
                </div>

                <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-[300px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <span className="text-gray-400 font-medium italic">Série Temporal (Em breve)</span>
                </div>
            </div>
        </div>
    );
};
