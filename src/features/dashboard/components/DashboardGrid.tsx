import React from "react";
import { ChartWidget } from "./ChartWidget";
import type { DashboardRow } from "../utils/layoutUtils";

interface Section {
    id: string;
    title?: string;
    description?: string;
    rows: DashboardRow[];
}

interface DashboardGridProps {
    sections: Section[];
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ sections }) => {
    return (
        <>
            {sections.map((section, idx) => (
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
                    {idx < sections.length - 1 && (
                        <div className="py-8" />
                    )}
                </section>
            ))}
        </>
    );
};
