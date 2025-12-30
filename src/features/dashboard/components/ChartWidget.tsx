// src/features/dashboard/components/ChartWidget.tsx
import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import { Chart, XAxis, YAxis } from '@highcharts/react';
import { Line, Column, Pie } from '@highcharts/react/series';
import type { 
    SubjectResult, 
    Widget, 
    WidgetType, 
    WidgetCollectionItem 
} from "@/widget_types";

interface ChartWidgetProps {
    title: string;
    type: WidgetType;
    data: SubjectResult;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ title, data }) => {
    // Basic shared options
    const options: Highcharts.Options = useMemo(() => ({
        chart: {
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'inherit'
            },
            height: 300,
            reflow: true
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        accessibility: {
            enabled: true
        },
        colors: ['#1d4ed8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        tooltip: {
            shared: true,
            pointFormat: '{series.name}: <b>{point.y:.2f}</b><br/>',
        },
        plotOptions: {
            series: {
                animation: {
                    duration: 1000
                },
                marker: {
                    enabled: true,
                    radius: 4
                }
            }
        },
        xAxis: {
            gridLineColor: '#f3f4f6',
            lineColor: '#e5e7eb'
        },
        yAxis: {
            gridLineColor: '#f3f4f6',
            lineColor: '#e5e7eb'
        }
    }), []);

    const renderSingleWidget = (widget: Widget, chartOptions: Highcharts.Options) => {
        switch (widget.type) {
            case 'share_of_voice_donut':
                return (
                    <Chart options={chartOptions}>
                        <Pie.Series
                            name={widget.unit}
                            innerSize="60%"
                            data={widget.data.map((item) => ({
                                name: item.category,
                                y: item.value
                            }))}
                        />
                    </Chart>
                );
            case 'time_series_line':
                // Ensure unique and sorted timestamps for the X axis
                const timestamps = Array.from(new Set(widget.data.map(item => item.timestamp))).sort();
                return (
                    <Chart options={chartOptions}>
                        <XAxis categories={timestamps} />
                        <YAxis title={{ text: widget.unit }} />
                        {widget.series.map((s) => (
                            <Line.Series
                                key={s.name}
                                name={s.name}
                                data={timestamps.map(t => {
                                    const entry = widget.data.find(item => item.timestamp === t && item.series === s.name);
                                    return entry ? entry.value : null;
                                })}
                            />
                        ))}
                    </Chart>
                );
            case 'ranking_bar_horizontal':
                return (
                    <Chart options={chartOptions}>
                        <XAxis categories={widget.data.map((item) => item.label)} />
                        <YAxis title={{ text: widget.unit }} />
                        <Column.Series
                            name={widget.unit}
                            data={widget.data.map((item) => item.value)}
                        />
                    </Chart>
                );
            case 'sentiment_polarity_threshold_line': {
                const threshold = widget.threshold ?? 50;
                const timestamps = Array.from(new Set(widget.data.map(item => item.timestamp))).sort();
                
                const customOptions: Highcharts.Options = {
                    ...chartOptions,
                    yAxis: {
                        ...chartOptions.yAxis,
                        title: { text: widget.unit },
                        plotLines: [{
                            color: '#374151',
                            value: threshold,
                            width: 2,
                            dashStyle: 'Dash',
                            zIndex: 5,
                            label: {
                                text: `Threshold: ${threshold}`,
                                align: 'right',
                                style: { color: '#9ca3af', fontSize: '10px' }
                            }
                        }]
                    }
                };

                return (
                    <Chart options={customOptions}>
                        <XAxis categories={timestamps} />
                        {widget.series.map((s) => (
                            <Line.Series
                                key={s.name}
                                name={s.name}
                                type="spline"
                                data={timestamps.map(t => {
                                    const entry = widget.data.find(item => item.timestamp === t && item.series === s.name);
                                    return entry ? entry.value : null;
                                })}
                                // @ts-ignore - Highcharts-React types might be restrictive, but Highcharts supports zones on series
                                zoneAxis="y"
                                zones={[
                                    {
                                        value: threshold,
                                        color: widget.below_color ?? '#ef4444', // Default red
                                    },
                                    {
                                        color: widget.above_color ?? '#3b82f6', // Default blue
                                    },
                                ]}
                            />
                        ))}
                    </Chart>
                );
            }
            case 'sentiment_emotions_time_series': {
                const timestamps = Array.from(new Set(widget.data.map(item => item.timestamp))).sort();
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
                                data={timestamps.map(t => {
                                    const entry = widget.data.find(item => item.timestamp === t && item.series === s.name);
                                    return entry ? entry.value : null;
                                })}
                            />
                        ))}
                    </Chart>
                );
            }
            case 'grouped_column_bar':
            case 'combo_column_line_dual_axis':
                return (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 space-y-2 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100">
                            <span className="text-lg">📊</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-600">Widget: {widget.type}</p>
                            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                                TODO: Implementar visualização específica para este tipo de widget analítico.
                            </p>
                        </div>
                    </div>
                );
            default:
                // Exhaustive check
                const _exhaustiveCheck: never = widget;
                return <div className="text-red-500">Tipo de widget não suportado: {(_exhaustiveCheck as any).type}</div>;
        }
    };

    const widgets = Array.isArray(data) ? data : [data];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4 h-full">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h3>
            <div className="flex-1 flex flex-col space-y-8">
                {widgets.map((w, idx) => (
                    <div key={idx} className="space-y-3">
                        {Array.isArray(data) && (w as WidgetCollectionItem).sublabel && (
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                                {(w as WidgetCollectionItem).sublabel}
                            </h4>
                        )}
                        <div className="min-h-[300px]">
                            {renderSingleWidget(w, options)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
