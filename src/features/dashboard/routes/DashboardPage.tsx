/* eslint-disable */
// @ts-nocheck
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
    const { dashboardId, pageId } = useParams<{ dashboardId: string; pageId: string }>();
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

    const displaySubjects = subjectsData || [];

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

        // 2. Fallback: if no subjects matched subsections
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
            <header className="border-b border-gray-100 pb-6 mb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center min-w-0 flex-1">
                        {isEditingSubtitle ? (
                            <div className="flex items-center space-x-3 w-full max-w-2xl">
                                <input
                                    type="text"
                                    className="text-3xl font-bold text-gray-900 tracking-tight border-b-2 border-blue-600 focus:outline-none bg-transparent w-full"
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
                                <div className="flex items-center space-x-2 shrink-0">
                                    <button
                                        onClick={handleSaveSubtitle}
                                        disabled={updatePageMutation.isPending}
                                        className="flex items-center px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm text-sm font-semibold"
                                    >
                                        {updatePageMutation.isPending ? (
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        ) : (
                                            <CheckIcon className="h-4 w-4 mr-2" />
                                        )}
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingSubtitle(false);
                                            setEditedSubtitle(page.subtitle || "");
                                        }}
                                        className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group flex items-center space-x-3 max-w-full">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight truncate">
                                    {page.subtitle || page.title || "Sem título"}
                                </h1>
                                {isAdminOrAnalyst && (
                                    <button
                                        onClick={() => {
                                            setEditedSubtitle(page.subtitle || "");
                                            setIsEditingSubtitle(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
                                        title="Editar subtítulo"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 md:self-center">
                        {/* Datepicker */}
                        <div className="relative flex items-center group">
                            <CalendarIcon className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="date"
                                className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm transition-all hover:border-gray-300 cursor-pointer"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                title="Filtrar por data"
                            />
                        </div>

                        {/* Add Text / Text controls */}
                        {pageSupportsText(page) && isAdminOrAnalyst && (
                            <div className="flex items-center">
                                {!page.text ? (
                                    <button
                                        onClick={() => navigate(`/dashboard/${dashboardId}/page/${pageId}/edit-text`)}
                                        className="flex items-center px-4 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Adicionar Texto
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm">
                                        <button
                                            onClick={() => navigate(`/dashboard/${dashboardId}/page/${pageId}/edit-text`)}
                                            className="group flex items-center px-3 py-1.5 text-gray-700 hover:text-blue-700 hover:bg-white rounded-md transition-all text-sm font-semibold"
                                            title="Editar texto"
                                        >
                                            <PencilIcon className="h-4 w-4 mr-1.5 text-gray-400 group-hover:text-blue-600" />
                                            Editar
                                        </button>
                                        <div className="w-px h-4 bg-gray-200" />
                                        <button
                                            onClick={handleDeleteText}
                                            className="group flex items-center px-3 py-1.5 text-gray-600 hover:text-red-700 hover:bg-white rounded-md transition-all text-sm font-semibold"
                                            title="Remover texto"
                                        >
                                            <TrashIcon className="h-4 w-4 mr-1.5 text-gray-400 group-hover:text-red-600" />
                                            Remover
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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
                                {row.items.map((item) => (
                                    <div 
                                        key={item.subject.id} 
                                        className={
                                            item.renderSize === 3 ? 'md:col-span-3' : 
                                            item.renderSize === 2 ? 'md:col-span-2' : 
                                            'md:col-span-1'
                                        }
                                    >
                                         <ChartWidget
                                            title={item.subject.title}
                                            type={item.subject.widget}
                                            data={item.subject.result}
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
