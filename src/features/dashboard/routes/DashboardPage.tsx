// src/features/dashboard/routes/DashboardPage.tsx
import React from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyDashboard, getPageSubjects } from "../api/dashboardService";
import { ChartWidget } from "../components/ChartWidget";

export const DashboardPage: React.FC = () => {
    const { pageId } = useParams<{ pageId: string }>();

    const { data: dashboard } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    const page = dashboard?.pages.find((p) => p.id === pageId);

    const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
        queryKey: ["subjects", pageId, dashboard!.id],
        queryFn: () => getPageSubjects(dashboard!.id, pageId!),
        enabled: !!dashboard && !!pageId,
    });

    if (!page) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500">Página não encontrada.</p>
            </div>
        );
    }

    // Mock subjects for now if API returns empty, as requested
    const mockSubjects = [
        {
            id: "1",
            title: "Distribuição de Sentimento",
            widget: "share_of_voice_donut",
            result: {
                type: "share_of_voice_donut",
                unit: "Mencões",
                total: 1500,
                data: [
                    { category: "Positivo", value: 650 },
                    { category: "Neutro", value: 500 },
                    { category: "Negativo", value: 350 },
                ]
            }
        },
        {
            id: "2",
            title: "Evolução Temporal",
            widget: "time_series_line",
            result: {
                type: "time_series_line",
                unit: "Volume",
                granularity: "day",
                series: [{ name: "Volume Total" }],
                data: [
                    { timestamp: "2023-12-01", series: "Volume Total", value: 120 },
                    { timestamp: "2023-12-02", series: "Volume Total", value: 150 },
                    { timestamp: "2023-12-03", series: "Volume Total", value: 140 },
                    { timestamp: "2023-12-04", series: "Volume Total", value: 200 },
                ]
            }
        },
        {
            id: "3",
            title: "Top Temas",
            widget: "ranking_bar_horizontal",
            result: {
                type: "ranking_bar_horizontal",
                unit: "Ocorrências",
                data: [
                    { label: "Saúde", value: 450, percent: 30 },
                    { label: "Educação", value: 300, percent: 20 },
                    { label: "Segurança", value: 250, percent: 16 },
                    { label: "Transporte", value: 200, percent: 13 },

                ]
            }
        }
    ];

    const displaySubjects = mockSubjects;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {page.title}
                        </h1>
                        {page.text && (
                            <p className="mt-2 text-lg text-gray-600 max-w-3xl">
                                {page.text}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {false ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-100 animate-pulse h-80 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displaySubjects.map((subject) => (
                        <div key={subject.id} className={subject.widget === 'time_series_line' ? 'lg:col-span-2' : ''}>
                             <ChartWidget
                                title={subject.title}
                                type={subject.widget}
                                data={subject.result}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
