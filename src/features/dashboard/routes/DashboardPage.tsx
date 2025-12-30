// src/features/dashboard/routes/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDashboard, getPageSubjects, updatePage } from "../api/dashboardService";
import { ChartWidget } from "../components/ChartWidget";
import {
    PencilIcon,
    CalendarIcon,
    PlusIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type {Page} from "@/types/dashboard.ts";
import { toast } from "react-toastify";

// Helper to determine if a page supports text content
const pageSupportsText = (page: Page) => {
    return page?.layout !== 'widgets_only';
};

export const DashboardPage: React.FC = () => {
    const { pageId } = useParams<{ pageId: string }>();
    const queryClient = useQueryClient();

    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
    const [editedSubtitle, setEditedSubtitle] = useState("");
    const [hasTextContent, setHasTextContent] = useState(true);

    const { data: dashboard } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    const page = dashboard?.pages.find((p) => p.id === pageId);

    // Use user role from JWT claims in Redux
    const user = useSelector((state: RootState) => state.auth.user);
    const isAdminOrAnalyst = user?.role === "ADMIN" || user?.role === "ANALYST";
    useEffect(() => {
        if (page) {
            setEditedSubtitle(page.subtitle || "");
            setHasTextContent(!!page.text);
        }
    }, [page]);

    const updatePageMutation = useMutation({
        mutationFn: (newSubtitle: string) => {
            if (!dashboard || !page) return Promise.reject("Dashboard ou página não encontrados.");
            
            // Construir dados de atualização garantindo tipos corretos
            const updateData = {
                layout: page.layout,
                title: page.title,
                subtitle: newSubtitle.trim() || null,
                text: page.text || "",
                order: page.order,
                feedId: page.feedId || undefined
            };
            
            return updatePage(dashboard.id, page.id, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setIsEditingSubtitle(false);
            toast.success("Subtítulo atualizado com sucesso!");
        },
        onError: (error: any) => {
            console.error("Erro ao atualizar página:", error);
            const errorMsg = error.response?.data?.error || "Erro ao salvar as alterações.";
            toast.error(errorMsg);
        }
    });

    const handleSaveSubtitle = () => {
        if (editedSubtitle.trim() === (page?.subtitle || "")) {
            setIsEditingSubtitle(false);
            return;
        }
        updatePageMutation.mutate(editedSubtitle);
    };

    const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
        queryKey: ["subjects", pageId, dashboard?.id],
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
                    <div className="flex-1">
                        {isEditingSubtitle ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    className="text-3xl font-bold text-gray-900 tracking-tight border-b-2 border-blue-600 focus:outline-none bg-transparent w-full max-w-2xl"
                                    value={editedSubtitle}
                                    onChange={(e) => setEditedSubtitle(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveSubtitle();
                                        if (e.key === 'Escape') {
                                            setIsEditingSubtitle(false);
                                            setEditedSubtitle(page.subtitle || "");
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSaveSubtitle}
                                    disabled={updatePageMutation.isPending}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                >
                                    {updatePageMutation.isPending ? (
                                        <div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <CheckIcon className="h-6 w-6" />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingSubtitle(false);
                                        setEditedSubtitle(page.subtitle || "");
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center space-x-3">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {page.subtitle || page.text || "Sem título"}
                                </h1>
                                {isAdminOrAnalyst && (
                                    <button
                                        onClick={() => setIsEditingSubtitle(true)}
                                        className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        title="Editar subtítulo"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mt-4 flex items-center space-x-4">
                            {/* Datepicker */}
                            <div className="relative flex items-center group">
                                <CalendarIcon className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm transition-all hover:border-gray-300 cursor-pointer"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Add Text / Text controls */}
                            {pageSupportsText(page) && isAdminOrAnalyst && (
                                <div className="flex items-center">
                                    {!hasTextContent ? (
                                        <button
                                            onClick={() => setHasTextContent(true)}
                                            className="flex items-center px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Adicionar Texto
                                        </button>
                                    ) : (
                                        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                                            <button
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                                                title="Editar texto"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setHasTextContent(false)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-all"
                                                title="Remover texto"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {hasTextContent && page.text && (
                            <p className="mt-6 text-lg text-gray-600 max-w-4xl leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
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
