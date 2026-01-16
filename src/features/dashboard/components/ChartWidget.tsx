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
    // Basic shared options
    const options: Highcharts.Options = useMemo(
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
            xAxis: {
                gridLineColor: "#f3f4f6",
                lineColor: "#e5e7eb",
            },
            yAxis: {
                gridLineColor: "#f3f4f6",
                lineColor: "#e5e7eb",
            },
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
                return <ShareOfVoiceDonutChart widget={widget as any} title={title} />;

            case "time_series_line":
                // ✅ coleção de time_series_line: um único chart com várias linhas
                if (isCollection) {
                    return <TimeSeriesLineChart widget={data as any} title={title} />;
                }
                return <TimeSeriesLineChart widget={widget as any} title={title} />;

            case "ranking_bar_horizontal": {
                const w = widget as any;
                return (
                    <Chart options={chartOptions}>
                        <XAxis categories={w.data.map((item: any) => item.label)} />
                        <YAxis title={{ text: w.unit }} />
                        <Column.Series name={w.unit} data={w.data.map((item: any) => item.value)} />
                    </Chart>
                );
            }

            case "sentiment_polarity_threshold_line":
                return <SentimentPolarityThresholdChart widget={widget as any} title={title} />;

            case "sentiment_emotions_time_series": {
                const w = widget as any;
                const timestamps = Array.from(new Set(w.data.map((item: any) => item.timestamp))).sort();
                return (
                    <Chart options={chartOptions}>
                        <XAxis categories={timestamps} />
                        <YAxis title={{ text: w.unit }} />
                        {w.series.map((s: any) => (
                            <Line.Series
                                key={s.name}
                                name={s.name}
                                type="spline"
                                color={s.color}
                                data={timestamps.map((t: string) => {
                                    const entry = w.data.find(
                                        (item: any) => item.timestamp === t && item.series === s.name
                                    );
                                    return entry ? entry.value : null;
                                })}
                            />
                        ))}
                    </Chart>
                );
            }

            case "grouped_column_bar": {
                const w = widget as any;
                const customOptions: Highcharts.Options = {
                    ...chartOptions,
                    chart: { ...chartOptions.chart, type: "column" },
                    plotOptions: {
                        ...chartOptions.plotOptions,
                        column: {
                            grouping: true,
                            pointPadding: 0.1,
                            groupPadding: 0.15,
                            borderWidth: 0,
                        },
                    },
                };

                return (
                    <Chart options={customOptions}>
                        <XAxis categories={w.periods} />
                        <YAxis title={{ text: w.unit }} />
                        {w.categories.map((catName: string, catIdx: number) => (
                            <Column.Series
                                key={catName}
                                name={catName}
                                data={w.values.map((periodValues: number[]) => periodValues[catIdx])}
                            />
                        ))}
                    </Chart>
                );
            }

            case "combo_column_line_dual_axis": {
                const w = widget as any;

                const periods = Array.from(
                    new Set([
                        ...w.bars_data.map((d: any) => d.period),
                        ...w.line_data.map((d: any) => d.period),
                    ])
                ).sort();

                const customOptions: Highcharts.Options = {
                    ...chartOptions,
                    chart: { ...chartOptions.chart, zoomType: "x" },
                    yAxis: [
                        {
                            title: { text: w.unit_left },
                            gridLineColor: "#f3f4f6",
                            lineColor: "#e5e7eb",
                        },
                        {
                            title: { text: w.unit_right },
                            labels: { format: "{value}%" },
                            opposite: true,
                            max: 100,
                            gridLineWidth: 0,
                        },
                    ],
                    plotOptions: {
                        ...chartOptions.plotOptions,
                        column: {
                            grouping: true,
                            pointPadding: 0.1,
                            groupPadding: 0.15,
                            borderWidth: 0,
                        },
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
                                    const entry = w.bars_data.find(
                                        (d: any) => d.period === p && d.series === sName
                                    );
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

    // ✅ Especiais renderizam o próprio card/controls
    // - widget único (qualquer um dos especiais)
    // - OU coleção de time_series_line (renderiza um chart só)
    const isStandaloneSpecial =
        (widgets.length === 1 &&
            (widgets[0].type === "sentiment_polarity_threshold_line" ||
                widgets[0].type === "time_series_line" ||
                widgets[0].type === "share_of_voice_donut")) ||
        (isCollection && (widgets[0] as any)?.type === "time_series_line");

    if (isStandaloneSpecial) {
        // coleção time_series_line precisa do array completo
        if (isCollection && (widgets[0] as any)?.type === "time_series_line") {
            return <TimeSeriesLineChart widget={data as any} title={title} />;
        }
        return renderSingleWidget(widgets[0], options);
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
                            <div className="flex border-b border-gray-100 mb-2">
                                <h4 className="pb-2 border-b-2 border-blue-700 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                    {(data as WidgetCollectionItem[])[idx].sublabel}
                                </h4>
                            </div>
                        )}
                        <div className="min-h-[300px]">{renderSingleWidget(w, options)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
