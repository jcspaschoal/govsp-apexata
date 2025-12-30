// src/features/dashboard/components/ChartWidget.tsx
import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import { Chart, XAxis, YAxis } from '@highcharts/react';
import { Line, Column, Pie } from '@highcharts/react/series';

interface ChartWidgetProps {
    title: string;
    type: string;
    data: {
        unit?: string;
        data?: Array<{
            category?: string;
            label?: string;
            value: number;
            timestamp?: string;
            series?: string;
        }>;
        series?: Array<{ name: string }>;
        result?: unknown;
    };
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ title, type, data }) => {
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

    const renderChart = () => {
        if (!data || !data.data) {
            return <div className="text-gray-400 italic text-center py-12">Dados não disponíveis</div>;
        }

        switch (type) {
            case 'share_of_voice_donut':
                return (
                    <Chart options={options}>
                        <Pie.Series
                            name={data.unit}
                            innerSize="60%"
                            data={data.data.map((item) => ({
                                name: item.category,
                                y: item.value
                            }))}
                        />
                    </Chart>
                );
            case 'time_series_line':
                if (!data.series) {
                    return <div className="text-gray-400 italic text-center py-12">Séries não disponíveis</div>;
                }
                return (
                    <Chart options={options}>
                        <XAxis categories={data.data.map((item) => item.timestamp || '')} />
                        <YAxis title={{ text: data.unit }} />
                        {data.series.map((s) => (
                            <Line.Series
                                key={s.name}
                                name={s.name}
                                data={data.data!
                                    .filter((item) => item.series === s.name)
                                    .map((item) => item.value)}
                            />
                        ))}
                    </Chart>
                );
            case 'ranking_bar_horizontal':
                return (
                    <Chart options={options}>
                        <XAxis categories={data.data.map((item) => item.label || '')} />
                        <YAxis title={{ text: data.unit }} />
                        <Column.Series
                            name={data.unit}
                            data={data.data.map((item) => item.value)}
                        />
                    </Chart>
                );
            default:
                return <div className="text-gray-400 italic text-center py-12">Tipo de gráfico não suportado: {type}</div>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h3>
            <div className="flex-1 min-h-[300px]">
                {renderChart()}
            </div>
        </div>
    );
};
