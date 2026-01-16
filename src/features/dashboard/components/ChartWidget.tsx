// src/features/dashboard/components/ChartWidget.tsx
/* eslint-disable */
// @ts-nocheck
import React, { useMemo } from "react";
import Highcharts from "@/lib/highchartsSetup";
import { Chart, XAxis, YAxis } from "@highcharts/react";
import { Column, Line } from "@highcharts/react/series";

import { SentimentPolarityThresholdChart } from "./charts/SentimentPolarityThresholdChart.tsx";
import { TimeSeriesLineChart } from "./charts/TimeSeriesLineChart.tsx";
import { ShareOfVoiceDonutChart } from "./charts/ShareOfVoiceDonutChart.tsx";
import { GroupedColumnBarChart } from "./charts/GroupedColumnBarChart.tsx";
import { SentimentEmotionsTimeSeriesChart } from "./charts/SentimentEmotionsTimeSeriesChart.tsx";
import { RankingBarHorizontalChart } from "./charts/RankingBarHorizontalChart.tsx";


import type {
    SubjectResult,
    Widget,
    WidgetCollectionItem,
    WidgetType,
} from "@/widget_types";

interface ChartWidgetProps {
    title: string;
    type: WidgetType;
    data: SubjectResult;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ title, type, data }) => {
    const baseOptions: Highcharts.Options = useMemo(
        () => ({
            chart: {
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
                height: 300,
                reflow: true,
            },
            title: { text: "" },
            credits: { enabled: false },
            accessibility: { enabled: true },
            colors: ["#1d4ed8", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
            tooltip: {
                shared: true,
                pointFormat: "{series.name}: <b>{point.y:.2f}</b><br/>",
            },
            plotOptions: {
                series: {
                    animation: { duration: 1000 },
                    marker: { enabled: true, radius: 4 },
                },
            },
            xAxis: { gridLineColor: "#f3f4f6", lineColor: "#e5e7eb" },
            yAxis: { gridLineColor: "#f3f4f6", lineColor: "#e5e7eb" },
        }),
        []
    );

    const isCollection = Array.isArray(data);

    // ✅ se for coleção, ordena por order (garante ordem visual e lógica)
    const widgets: Widget[] = useMemo(() => {
        if (!isCollection) return [data as Widget];
        return [...(data as WidgetCollectionItem[])]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((w) => w as Widget);
    }, [data, isCollection]);

    const renderSingleWidget = (widget: Widget, chartOptions: Highcharts.Options) => {
        switch (widget.type) {
            case "share_of_voice_donut":
                // ✅ componente com card próprio
                return <ShareOfVoiceDonutChart widget={widget as any} title={title} />;

            case "time_series_line":
                // ✅ coleção de time_series_line: passa a coleção ORDENADA
                if (isCollection) return <TimeSeriesLineChart widget={widgets as any} title={title} />;
                // ✅ componente com card próprio
                return <TimeSeriesLineChart widget={widget as any} title={title} />;

            case "sentiment_emotions_time_series":
                // ✅ componente com card próprio
                return <SentimentEmotionsTimeSeriesChart widget={widget as any} title={title} />;

            case "ranking_bar_horizontal": {
                return <RankingBarHorizontalChart widget={widget as any} baseOptions={chartOptions} />;
            }

            case "sentiment_polarity_threshold_line":
                // ✅ componente com card próprio
                return <SentimentPolarityThresholdChart widget={widget as any} title={title} />;

            case "grouped_column_bar":
                // ✅ componente SEM card próprio (usa o wrapper do ChartWidget)
                return <GroupedColumnBarChart widget={widget as any} baseOptions={chartOptions} />;

            case "combo_column_line_dual_axis": {
                const w = widget as any;
                const periods = Array.from(
                    new Set([...w.bars_data.map((d: any) => d.period), ...w.line_data.map((d: any) => d.period)])
                ).sort();

                const customOptions: Highcharts.Options = {
                    ...chartOptions,
                    chart: { ...chartOptions.chart, zoomType: "x" },
                    yAxis: [
                        { title: { text: w.unit_left }, gridLineColor: "#f3f4f6", lineColor: "#e5e7eb" },
                        { title: { text: w.unit_right }, labels: { format: "{value}%" }, opposite: true, max: 100, gridLineWidth: 0 },
                    ],
                    plotOptions: {
                        ...chartOptions.plotOptions,
                        column: { grouping: true, pointPadding: 0.1, groupPadding: 0.15, borderWidth: 0 },
                    },
                    tooltip: { shared: true },
                };

                return (
                    <Chart options={customOptions}>
                        <XAxis categories={periods} />
                        {w.bars.series.map((sName: string) => (
                            <Column.Series
                                key={sName}
                                name={sName}
                                yAxis={0}
                                data={periods.map((p: string) => {
                                    const entry = w.bars_data.find((d: any) => d.period === p && d.series === sName);
                                    return entry ? entry.value : null;
                                })}
                            />
                        ))}
                        <Line.Series
                            name={w.line.series}
                            yAxis={1}
                            dashStyle="ShortDot"
                            marker={{ enabled: true }}
                            data={periods.map((p: string) => {
                                const entry = w.line_data.find((d: any) => d.period === p);
                                return entry ? entry.value : null;
                            })}
                        />
                    </Chart>
                );
            }


            default: {
                const _exhaustiveCheck: never = widget as any;
                return (
                    <div className="text-red-500">
                        Tipo de widget não suportado: {(_exhaustiveCheck as any).type}
                    </div>
                );
            }
        }
    };

    // ✅ “Especiais” renderizam o próprio card + controls, então NÃO usamos o wrapper abaixo.
    // - time_series_line (single ou coleção) -> card próprio
    // - sentiment_polarity_threshold_line -> card próprio
    // - share_of_voice_donut -> card próprio
    // - sentiment_emotions_time_series -> card próprio
    const isStandaloneSpecial =
        (widgets.length === 1 &&
            (widgets[0].type === "sentiment_polarity_threshold_line" ||
                widgets[0].type === "time_series_line" ||
                widgets[0].type === "share_of_voice_donut" ||
                widgets[0].type === "sentiment_emotions_time_series")) ||
        (isCollection && (widgets[0] as any)?.type === "time_series_line");

    if (isStandaloneSpecial) {
        // coleção time_series_line precisa do array completo (ordenado)
        if (isCollection && (widgets[0] as any)?.type === "time_series_line") {
            return <TimeSeriesLineChart widget={widgets as any} title={title} />;
        }
        return renderSingleWidget(widgets[0], baseOptions);
    }

    // Default wrapper para widgets “normais” e coleções comuns
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {title}
                </h2>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
                {widgets.map((w, idx) => (
                    <div key={idx} className="space-y-3">
                        {isCollection && (data as WidgetCollectionItem[])[idx]?.sublabel && (
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                                {(data as WidgetCollectionItem[])[idx].sublabel}
                            </h4>
                        )}
                        <div className="min-h-[300px]">{renderSingleWidget(w, baseOptions)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
