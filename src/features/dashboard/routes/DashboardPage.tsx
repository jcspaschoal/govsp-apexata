/* eslint-disable */
// @ts-nocheck


import React, { useState, useMemo } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDashboard, getPageSubjects, updatePage, getSubsections, updateSubsection } from "../api/dashboardService";
import { groupSubjectsIntoRows } from "../utils/layoutUtils";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Page } from "@/types/dashboard.ts";
import { toast } from "react-toastify";
import { NotFoundPage } from "@/components/NotFoundPage";
import { PageSkeleton } from "../components/DashboardSkeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// --- NEW COMPONENTS ---
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardTextSection } from "../components/DashboardTextSection";
import { DashboardGrid } from "../components/DashboardGrid";

// --- DAYJS IMPORTS ---
import 'dayjs/locale/pt-br';

export const DashboardPage: React.FC = () => {
    const { dashboardId, pageId } = useParams<{ dashboardId: string; pageId: string }>();
    const queryClient = useQueryClient();

    // Estado do DatePicker Mantine
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Estado para o modal de confirmação de exclusão de texto
    const [isDeleteTextModalOpen, setIsDeleteTextModalOpen] = useState(false);

    const { data: dashboard } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    const page = dashboard?.pages.find((p) => p.id === pageId);

    // Use user role from JWT claims in Redux
    const user = useSelector((state: RootState) => state.auth.user);
    const isAdminOrAnalyst = user?.role === "ADMIN" || user?.role === "ANALYST";

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
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            if (variables.subtitle !== undefined) {
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

    const updateSubsectionMutation = useMutation({
        mutationFn: ({ subsectionId, title }: { subsectionId: string; title: string }) => {
            if (!dashboard || !pageId) return Promise.reject("Dashboard ou página não encontrados.");
            return updateSubsection(dashboard.id, pageId, subsectionId, { title });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subsections", pageId, dashboard?.id] });
            toast.success("Subseção renomeada com sucesso!");
        },
        onError: (error: any) => {
            console.error("Erro ao renomear subseção:", error);
            toast.error("Erro ao renomear subseção.");
        }
    });

    const handleRenameSubsection = (subsectionId: string, newTitle: string) => {
        updateSubsectionMutation.mutate({ subsectionId, title: newTitle });
    };

    const handleSaveSubtitle = (newSubtitle: string) => {
        if (newSubtitle.trim() === (page?.subtitle || "")) {
            return;
        }
        updatePageMutation.mutate({ subtitle: newSubtitle.trim() || null });
    };

    const handleDeleteText = () => {
        setIsDeleteTextModalOpen(true);
    };

    const confirmDeleteText = () => {
        updatePageMutation.mutate({ text: "" }, {
            onSuccess: () => setIsDeleteTextModalOpen(false)
        });
    };

    const { data: subsections, isLoading: isLoadingSubsections } = useQuery({
        queryKey: ["subsections", pageId, dashboard?.id],
        queryFn: () => getSubsections(dashboard!.id, pageId!),
        enabled: !!dashboard && !!pageId,
    });

    const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
        queryKey: ["subjects", pageId, dashboard?.id],
        queryFn: () => getPageSubjects(dashboard!.id, pageId!),
        enabled: !!dashboard && !!pageId,
    });

    // Sort subsections by order
    const sortedSubsections = useMemo(() => {
        if (!subsections || subsections.length === 0) return [];
        return [...subsections].sort((a, b) => a.order - b.order);
    }, [subsections]);

    // Group and sort subjects by subsection
    const sectionsToRender = useMemo(() => {
        const displaySubjects = subjectsData || [];

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

        if (displaySubjects.length > 0) {
            const sortedSubjects = [...displaySubjects].sort((a, b) => a.order - b.order);
            return [{
                id: 'default',
                title: '',
                rows: groupSubjectsIntoRows(sortedSubjects)
            }];
        }

        return [];
    }, [sortedSubsections, subjectsData]);

    if (!page) {
        return <NotFoundPage />;
    }

    if (isLoadingSubsections || isLoadingSubjects) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                page={page}
                dashboardId={dashboardId!}
                pageId={pageId!}
                isAdminOrAnalyst={isAdminOrAnalyst}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                isUpdatingSubtitle={updatePageMutation.isPending}
                onSaveSubtitle={handleSaveSubtitle}
                onDeleteText={handleDeleteText}
            />

            <DashboardTextSection text={page.text} />

            <DashboardGrid
                sections={sectionsToRender}
                isAdminOrAnalyst={isAdminOrAnalyst}
                onRenameSubsection={handleRenameSubsection}
            />

            <ConfirmDialog
                isOpen={isDeleteTextModalOpen}
                onClose={() => setIsDeleteTextModalOpen(false)}
                onConfirm={confirmDeleteText}
                title="Remover Texto"
                description="Tem certeza que deseja remover o texto desta página? Esta ação não pode ser desfeita."
                confirmLabel="Remover"
                variant="danger"
                isLoading={updatePageMutation.isPending}
            />
        </div>
    );
};