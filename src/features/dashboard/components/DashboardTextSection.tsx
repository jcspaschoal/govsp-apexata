import React from "react";

interface DashboardTextSectionProps {
    text: string | null | undefined;
}

export const DashboardTextSection: React.FC<DashboardTextSectionProps> = ({ text }) => {
    if (!text) return null;

    return (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
            <div
                className="prose prose-slate max-w-none text-gray-600 leading-relaxed break-words overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </section>
    );
};
