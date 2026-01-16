// src/features/dashboard/components/ChartWidget.tsx
/* eslint-disable */
// @ts-nocheck
import React, { useMemo } from "react";
import Highcharts from "@/lib/highchartsSetup";
import { Chart, XAxis, YAxis } from "@highcharts/react";
import { Column, Line, Pie } from "@highcharts/react/series";

import { SentimentPolarityThresholdChart } from "./charts/SentimentPolarityThresholdChart.tsx";
import { TimeSeriesLineChart } from "./charts/TimeSeriesLineChart.tsx";

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
                style: {
                    fontFamily: "inherit",
                },
                height: 300,
                reflow: true,
            },
            title: {
                text: "",
            },
            credits: {
                enabled: false,
            },
            accessibility: {
                enabled: true,
            },
            colors: ["#1d4ed8", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
            tooltip: {
                shared: true,
                pointFormat: "{series.name}: <b>{point.y:.2f}</b><br/>",
            },
            plotOptions: {
                series: {
                    animation: {
                        duration: 1000,
                    },
                    marker: {
                        enabled: true,
                        radius: 4,
                    },
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

    const renderSingleWidget = (widget: Widget, chartOptions: Highcharts.Options) => {
        switch (widget.type) {
            case "share_of_voice_donut":
                return (
                    <Chart options={chartOptions}>
                        <Pie.Series
                            name={widget.unit}
                            innerSize="60%"
                            data={widget.data.map((item) => ({
                                name: item.category,
                                y: item.value,
                            }))}
                        />
                    </Chart>
                );

            case "time_series_line":
                // ✅ novo chart dedicado (com toggles, legenda lateral e download)
                return <TimeSeriesLineChart widget={widget} title={title} />;

            case "ranking_bar_horizontal":
                return (
                    <Chart options={chartOptions}>
                        <XAxis categories={widget.data.map((item) => item.label)} />
                        <YAxis title={{ text: widget.unit }} />
                        <Column.Series name={widget.unit} data={widget.data.map((item) => item.value)} />
                    </Chart>
                );

            case "sentiment_polarity_threshold_line":
                return <SentimentPolarityThresholdChart widget={widget} title={title} />;

            case "sentiment_emotions_time_series": {
                const timestamps = Array.from(new Set(widget.data.map((item) => item.timestamp))).sort();
                return (
                    <Chart options={chartOptions}>
                        <XAxis categories={timestamps} />
                        <YAxis title={{ text: widget.unit }} />
                        {widget.series.map((s) => (
                            <Line.Series
                                key={s.name}
                                name={s.name}
                                type="spline"
                                color={s.color}
                                data={timestamps.map((t) => {
                                    const entry = widget.data.find((item) => item.timestamp === t && item.series === s.name);
                                    return entry ? entry.value : null;
                                })}
                            />
                        ))}
                    </Chart>
                );
            }

            case "grouped_column_bar": {
                const customOptions: Highcharts.Options = {
                    ...chartOptions,
                    chart: {
                        ...chartOptions.chart,
                        type: "column",
                    },
                    plotOptions: {
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
                        <XAxis categories={widget.periods} />
                        <YAxis title={{ text: widget.unit }} />
                        {widget.categories.map((catName, catIdx) => (
                            <Column.Series
                                key={catName}
                                name={catName}
                                data={widget.values.map((periodValues) => periodValues[catIdx])}
                            />
                        ))}
                    </Chart>
                );
            }

            case "combo_column_line_dual_axis": {
                const periods = Array.from(
                    new Set([...widget.bars_data.map((d) => d.period), ...widget.line_data.map((d) => d.period)])
                ).sort();

                const customOptions: Highcharts.Options = {
                    ...chartOptions,
                    chart: {
                        ...chartOptions.chart,
                        zoomType: "x",
                    },
                    yAxis: [
                        {
                            title: { text: widget.unit_left },
                            gridLineColor: "#f3f4f6",
                            lineColor: "#e5e7eb",
                        },
                        {
                            title: { text: widget.unit_right },
                            labels: { format: "{value}%" },
                            opposite: true,
                            max: 100,
                            gridLineWidth: 0,
                        },
                    ],
                    plotOptions: {
                        column: {
                            grouping: true,
                            pointPadding: 0.1,
                            groupPadding: 0.15,
                            borderWidth: 0,
                        },
                    },
                    tooltip: {
                        shared: true,
                    },
                };

                return (
                    <Chart options={customOptions}>
                        <XAxis categories={periods} />
                        {widget.bars.series.map((sName) => (
                            <Column.Series
                                key={sName}
                                name={sName}
                                yAxis={0}
                                data={periods.map((p) => {
                                    const entry = widget.bars_data.find((d) => d.period === p && d.series === sName);
                                    return entry ? entry.value : null;
                                })}
                            />
                        ))}
                        <Line.Series
                            name={widget.line.series}
                            yAxis={1}
                            dashStyle="ShortDot"
                            marker={{ enabled: true }}
                            data={periods.map((p) => {
                                const entry = widget.line_data.find((d) => d.period === p);
                                return entry ? entry.value : null;
                            })}
                        />
                    </Chart>
                );
            }

            default:
                // Exhaustive check
                const _exhaustiveCheck: never = widget;
                return (
                    <div className="text-red-500">
                        Tipo de widget não suportado: {(_exhaustiveCheck as any).type}
                    </div>
                );
        }
    };

    const widgets = Array.isArray(data) ? data : [data];

    // ✅ “Especiais” renderizam o próprio card + controls, então não usamos o wrapper abaixo
    const isStandaloneSpecial =
        widgets.length === 1 &&
        (widgets[0].type === "sentiment_polarity_threshold_line" || widgets[0].type === "time_series_line");

    if (isStandaloneSpecial) {
        return renderSingleWidget(widgets[0], options);
    }

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h2>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
                {widgets.map((w, idx) => (
                    <div key={idx} className="space-y-3">
                        {Array.isArray(data) && (w as WidgetCollectionItem).sublabel && (
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                                {(w as WidgetCollectionItem).sublabel}
                            </h4>
                        )}
                        <div className="min-h-[300px]">{renderSingleWidget(w, options)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
