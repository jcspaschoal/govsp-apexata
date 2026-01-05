import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
    PencilIcon,
    PlusIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";
import { DatePicker } from '@mantine/dates';
import { Popover, Button, Group, Divider } from '@mantine/core';
import dayjs from "dayjs";
import type { Page } from "@/types/dashboard.ts";

interface DashboardHeaderProps {
    page: Page;
    dashboardId: string;
    pageId: string;
    isAdminOrAnalyst: boolean;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    isUpdatingSubtitle: boolean;
    onSaveSubtitle: (newSubtitle: string) => void;
    onDeleteText: () => void;
}

const pageSupportsText = (page: Page) => {
    return page?.layout !== 'widgets_only';
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    page,
    dashboardId,
    pageId,
    isAdminOrAnalyst,
    selectedDate,
    setSelectedDate,
    isUpdatingSubtitle,
    onSaveSubtitle,
    onDeleteText
}) => {
    const navigate = useNavigate();
    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
    const [editedSubtitle, setEditedSubtitle] = useState(page.subtitle || "");
    const [opened, setOpened] = useState(false);

    const handleSave = () => {
        onSaveSubtitle(editedSubtitle);
        setIsEditingSubtitle(false);
    };

    const handleCancel = () => {
        setIsEditingSubtitle(false);
        setEditedSubtitle(page.subtitle || "");
    };

    return (
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
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                            />
                            <div className="flex items-center space-x-2 shrink-0">
                                <button
                                    onClick={handleSave}
                                    disabled={isUpdatingSubtitle}
                                    className="flex items-center px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm text-sm font-semibold"
                                >
                                    {isUpdatingSubtitle ? (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : (
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                    )}
                                    Salvar
                                </button>
                                <button
                                    onClick={handleCancel}
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
                    <div className="w-36">
                        <Popover
                            position="bottom-end"
                            shadow="md"
                            opened={opened}
                            onChange={setOpened}
                            withArrow
                        >
                            <Popover.Target>
                                <button
                                    type="button"
                                    onClick={() => setOpened((o) => !o)}
                                    className="relative flex items-center w-full pl-10 pr-3 py-1.5 bg-white border border-gray-200 text-sm font-semibold rounded-lg hover:border-gray-300 transition-all shadow-sm active:scale-95 text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    aria-label="Filtrar por data"
                                    title="Filtrar por data"
                                >
                                    <CalendarIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <span className={selectedDate ? "text-gray-700" : "text-gray-400 font-medium"}>
                                        {selectedDate ? dayjs(selectedDate).format('DD/MM/YY') : 'dd/mm/yy'}
                                    </span>
                                </button>
                            </Popover.Target>
                            <Popover.Dropdown p={0}>
                                <DatePicker
                                    locale="pt-br"
                                    value={selectedDate}
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        setOpened(false);
                                    }}
                                />
                                <Divider color="gray.1" />
                                <Group grow p="xs" gap="xs">
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        color="gray"
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setOpened(false);
                                        }}
                                    >
                                        Limpar
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        onClick={() => {
                                            setSelectedDate(new Date());
                                            setOpened(false);
                                        }}
                                    >
                                        Hoje
                                    </Button>
                                </Group>
                            </Popover.Dropdown>
                        </Popover>
                    </div>

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
                                        onClick={onDeleteText}
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
    );
};
