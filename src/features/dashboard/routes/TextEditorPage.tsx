// src/features/dashboard/routes/TextEditorPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { getMyDashboard, updatePage } from "../api/dashboardService";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export const TextEditorPage: React.FC = () => {
    const { pageId } = useParams<{ pageId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");

    const { data: dashboard, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: getMyDashboard,
    });

    const page = dashboard?.pages.find((p) => p.id === pageId);

    useEffect(() => {
        if (page) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(page.text || "");
        }
    }, [page]);

    const updatePageMutation = useMutation({
        mutationFn: (newText: string) => {
            if (!dashboard || !page) return Promise.reject("Dashboard ou página não encontrados.");
            
            const updateData = {
                layout: page.layout,
                title: page.title,
                subtitle: page.subtitle,
                text: newText,
                order: page.order,
                feedId: page.feedId || undefined
            };
            
            return updatePage(dashboard.id, page.id, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            toast.success("Texto salvo com sucesso!");
            navigate(`/dashboard/page/${pageId}`);
        },
        onError: (error: { response?: { data?: { error?: string } } }) => {
            console.error("Erro ao salvar texto:", error);
            const errorMsg = error.response?.data?.error || "Erro ao salvar as alterações.";
            toast.error(errorMsg);
        }
    });

    const handleSave = () => {
        updatePageMutation.mutate(content);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-pulse text-gray-500">Carregando editor...</div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="p-8 text-center text-gray-500">Página não encontrada.</div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Voltar"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Editar Conteúdo de Texto</h1>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{page.title}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updatePageMutation.isPending}
                    className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 font-medium text-sm"
                >
                    {updatePageMutation.isPending ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-1">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="min-h-[500px]"
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link', 'clean']
                            ],
                        }}
                    />
                </div>
            </div>
            
            <style>{`
                .ql-container {
                    font-size: 1.125rem;
                    line-height: 1.75;
                    font-family: inherit;
                    min-height: 500px;
                }
                .ql-editor {
                    min-height: 500px;
                }
                .ql-toolbar.ql-snow {
                    border-top: none;
                    border-left: none;
                    border-right: none;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 0.75rem;
                }
                .ql-container.ql-snow {
                    border: none;
                }
            `}</style>
        </div>
    );
};
