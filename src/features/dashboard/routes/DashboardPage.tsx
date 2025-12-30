// src/features/dashboard/routes/DashboardPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDashboard, getPageSubjects, updatePage, getSubsections } from "../api/dashboardService";
import { ChartWidget } from "../components/ChartWidget";
import { groupSubjectsIntoRows } from "../utils/layoutUtils";
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
import type {Page, Subject, Subsection} from "@/types/dashboard.ts";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";

// Helper to determine if a page supports text content
const pageSupportsText = (page: Page) => {
    return page?.layout !== 'widgets_only';
};

export const DashboardPage: React.FC = () => {
    const { pageId } = useParams<{ pageId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
    const [editedSubtitle, setEditedSubtitle] = useState("");

    const { data: dashboard } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    const page = dashboard?.pages.find((p) => p.id === pageId);

    // Use user role from JWT claims in Redux
    const user = useSelector((state: RootState) => state.auth.user);
    const isAdminOrAnalyst = user?.role === "ADMIN" || user?.role === "ANALYST";
    const [prevPageId, setPrevPageId] = useState<string | undefined>(undefined);

    // Sync state during render if page changes
    if (pageId !== prevPageId) {
        setPrevPageId(pageId);
        if (page) {
            setEditedSubtitle(page.subtitle || "");
            setIsEditingSubtitle(false);
        }
    }

    const updatePageMutation = useMutation({
        mutationFn: (updateData: Partial<Page>) => {
            if (!dashboard || !page) return Promise.reject("Dashboard ou página não encontrados.");
            
            const fullUpdateData = {
                layout: page.layout,
                title: page.title,
                subtitle: page.subtitle,
                text: page.text || "",
                order: page.order,
                feedId: page.feedId || undefined,
                ...updateData
            };
            
            return updatePage(dashboard.id, page.id, fullUpdateData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            if (variables.subtitle !== undefined) {
                setIsEditingSubtitle(false);
                toast.success("Subtítulo atualizado com sucesso!");
            } else if (variables.text === "") {
                toast.success("Texto removido com sucesso!");
            }
        },
        onError: (error: { response?: { data?: { error?: string } } }) => {
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
        updatePageMutation.mutate({ subtitle: editedSubtitle.trim() || null });
    };

    const handleDeleteText = () => {
        if (window.confirm("Tem certeza que deseja remover o texto desta página?")) {
            updatePageMutation.mutate({ text: "" });
        }
    };

    const { data: subsections } = useQuery({
        queryKey: ["subsections", pageId, dashboard?.id],
        queryFn: () => getSubsections(dashboard!.id, pageId!),
        enabled: !!dashboard && !!pageId,
    });

    useEffect(() => {
        if (subsections) {
            console.log("[DashboardPage] Subsections data:", subsections);
        }
    }, [subsections]);

    const { data: subjectsData } = useQuery({
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
    const mockSubjects: Subject[] = [
        {
            id: "1",
            subsectionId: "mock",
            title: "Distribuição de Sentimento",
            widget: "share_of_voice_donut",
            size: "medium",
            order: 1,
            createdAt: "",
            updatedAt: "",
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
        } as Subject,
        {
            id: "2",
            subsectionId: "mock",
            title: "Evolução Temporal",
            widget: "time_series_line",
            size: "large",
            order: 2,
            createdAt: "",
            updatedAt: "",
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
        } as Subject,
        {
            id: "3",
            subsectionId: "mock",
            title: "Top Temas",
            widget: "ranking_bar_horizontal",
            size: "medium",
            order: 3,
            createdAt: "",
            updatedAt: "",
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
        } as Subject,
        {
            id: "4",
            subsectionId: "mock",
            title: "Emoções (Trend)",
            widget: "sentiment_emotions_time_series",
            size: "large",
            order: 4,
            createdAt: "",
            updatedAt: "",
            result: {
                type: "sentiment_emotions_time_series",
                unit: "Percentual",
                series: [
                    { name: "Alegria", color: "#10b981" },
                    { name: "Antecipação", color: "#f59e0b" },
                    { name: "Confiança", color: "#3b82f6" },
                    { name: "Raiva", color: "#ef4444" },
                    { name: "Tristeza", color: "#6366f1" }
                ],
                data: [
                    { timestamp: "2023-12-01", series: "Alegria", value: 30 },
                    { timestamp: "2023-12-01", series: "Antecipação", value: 20 },
                    { timestamp: "2023-12-01", series: "Confiança", value: 25 },
                    { timestamp: "2023-12-01", series: "Raiva", value: 10 },
                    { timestamp: "2023-12-01", series: "Tristeza", value: 15 },
                    { timestamp: "2023-12-02", series: "Alegria", value: 35 },
                    { timestamp: "2023-12-02", series: "Antecipação", value: 15 },
                    { timestamp: "2023-12-02", series: "Confiança", value: 30 },
                    { timestamp: "2023-12-02", series: "Raiva", value: 5 },
                    { timestamp: "2023-12-02", series: "Tristeza", value: 15 },
                ]
            }
        } as Subject,
        {
            id: "5",
            subsectionId: "mock",
            title: "Polaridade de Sentimento",
            widget: "sentiment_polarity_threshold_line",
            size: "large",
            order: 5,
            createdAt: "",
            updatedAt: "",
            result: {
                type: "sentiment_polarity_threshold_line",
                unit: "Score",
                threshold: 50,
                series: [{ name: "Polaridade" }],
                data: [
                    { timestamp: "2023-12-01", series: "Polaridade", value: 45 },
                    { timestamp: "2023-12-02", series: "Polaridade", value: 52 },
                    { timestamp: "2023-12-03", series: "Polaridade", value: 48 },
                    { timestamp: "2023-12-04", series: "Polaridade", value: 60 },
                    { timestamp: "2023-12-05", series: "Polaridade", value: 55 },
                    { timestamp: "2023-12-06", series: "Polaridade", value: 42 },
                ]
            }
        } as Subject
    ];

    const displaySubjects = (subjectsData && subjectsData.length > 0) ? subjectsData : mockSubjects;

    // Sort subsections by order
    const sortedSubsections = useMemo(() => {
        if (!subsections || subsections.length === 0) return [];
        return [...subsections].sort((a, b) => a.order - b.order);
    }, [subsections]);

    // Group and sort subjects by subsection
    const sectionsToRender = useMemo(() => {
        // 1. Try to group subjects by their real subsections
        const sections = sortedSubsections.map(sub => {
            const subjects = displaySubjects
                .filter(s => s.subsectionId === sub.id)
                .sort((a, b) => a.order - b.order);
            
            return {
                id: sub.id,
                title: sub.title,
                description: sub.description,
                rows: groupSubjectsIntoRows(subjects)
            };
        }).filter(section => section.rows.length > 0);

        if (sections.length > 0) return sections;

        // 2. Fallback: if no subjects matched subsections (e.g. using mocks)
        // or if there are no subsections at all, show everything in a flat section.
        if (displaySubjects.length > 0) {
            const sortedSubjects = [...displaySubjects].sort((a, b) => a.order - b.order);
            return [{
                id: 'default',
                title: '',
                rows: groupSubjectsIntoRows(sortedSubjects)
            }];
        }

        return [];
    }, [sortedSubsections, displaySubjects]);

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
                                    {page.subtitle || page.title || "Sem título"}
                                </h1>
                                {isAdminOrAnalyst && (
                                    <button
                                        onClick={() => {
                                            setEditedSubtitle(page.subtitle || "");
                                            setIsEditingSubtitle(true);
                                        }}
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
                                    {!page.text ? (
                                        <button
                                            onClick={() => navigate(`/dashboard/page/${pageId}/edit-text`)}
                                            className="flex items-center px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Adicionar Texto
                                        </button>
                                    ) : (
                                        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                                            <button
                                                onClick={() => navigate(`/dashboard/page/${pageId}/edit-text`)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                                                title="Editar texto"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={handleDeleteText}
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
                    </div>
                </div>
            </header>

            {page.text && (
                <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div 
                        className="prose prose-slate max-w-none text-gray-600 leading-relaxed break-words overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: page.text }} 
                    />
                </section>
            )}

            {sectionsToRender.map((section, idx) => (
                <section key={section.id} className="space-y-6 pt-4">
                    {section.title && (
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                {section.title}
                            </h2>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>
                    )}
                    <div className="flex flex-col space-y-10">
                        {section.rows.map((row, rowIdx) => (
                            <div 
                                key={rowIdx} 
                                className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${rowIdx > 0 ? 'border-t border-gray-100 pt-10' : ''}`}
                            >
                                {row.subjects.map((subject) => (
                                    <div 
                                        key={subject.id} 
                                        className={
                                            subject.size === 'large' ? 'md:col-span-3' : 
                                            subject.size === 'medium' ? 'md:col-span-3' : 
                                            'md:col-span-1'
                                        }
                                    >
                                         <ChartWidget
                                            title={subject.title}
                                            type={subject.widget}
                                            data={subject.result}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* Spacer between sections */}
                    {idx < sectionsToRender.length - 1 && (
                        <div className="py-8" />
                    )}
                </section>
            ))}
        </div>
    );
};
