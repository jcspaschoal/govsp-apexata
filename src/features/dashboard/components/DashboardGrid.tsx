import React, { useState } from "react";
import { ChartWidget } from "./ChartWidget";
import type { DashboardRow } from "../utils/layoutUtils";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Section {
    id: string;
    title?: string;
    description?: string;
    rows: DashboardRow[];
}

interface DashboardGridProps {
    sections: Section[];
    isAdminOrAnalyst?: boolean;
    onRenameSubsection?: (subsectionId: string, newTitle: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
    sections,
    isAdminOrAnalyst = false,
    onRenameSubsection
}) => {
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState("");

    const handleStartEdit = (section: Section) => {
        setEditingSectionId(section.id);
        setEditedTitle(section.title || "");
    };

    const handleSave = (sectionId: string) => {
        if (onRenameSubsection) {
            onRenameSubsection(sectionId, editedTitle);
        }
        setEditingSectionId(null);
    };

    const handleCancel = () => {
        setEditingSectionId(null);
        setEditedTitle("");
    };

    return (
        <>
            {sections.map((section, idx) => (
                <section key={section.id} className="space-y-6 pt-4">
                    {section.id !== 'default' && (
                        <div className="flex items-center gap-3 group">
                            <span
                                className="h-6 w-1.5 rounded-full bg-[rgb(var(--color-primary-rgb))] relative top-[0.5px]"
                                aria-hidden="true"
                            />
                            {editingSectionId === section.id ? (
                                <div className="flex items-center space-x-2 flex-1">
                                    <input
                                        type="text"
                                        className="text-xl font-semibold text-[rgb(var(--color-text-rgb))] tracking-tight border-b border-blue-600 focus:outline-none bg-transparent"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave(section.id);
                                            if (e.key === 'Escape') handleCancel();
                                        }}
                                    />
                                    <button
                                        onClick={() => handleSave(section.id)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    >
                                        <CheckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-semibold leading-tight text-[rgb(var(--color-text-rgb))]">
                                        {section.title || "Sem título"}
                                    </h2>
                                    {isAdminOrAnalyst && (
                                        <button
                                            onClick={() => handleStartEdit(section)}
                                            className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Renomear subseção"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
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
                    {idx < sections.length - 1 && (
                        <div className="py-8" />
                    )}
                </section>
            ))}
        </>
    );
};
