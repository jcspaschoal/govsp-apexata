import React, { useMemo, useState, useRef } from 'react';
import Highcharts from 'highcharts';
import { Chart } from '@highcharts/react';
import Exporting from 'highcharts/modules/exporting';
import { ImageDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from "@/components/ui/toggle";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { SentimentPolarityThreshold } from "@/widget_types";
import { parseYYYYMMDDToUtcMs, formatPtMonthDay } from "../utils/chartUtils";

// Initialize exporting module
if (typeof Highcharts === 'object' && !Highcharts.Chart.prototype.exportChart) {
    Exporting(Highcharts);
}

interface Props {
    widget: SentimentPolarityThreshold;
    title: string;
}

/**
 * Gráfico de Linha com Threshold de Polaridade de Sentimento.
 * Implementa seleção de série única via dropdown Shadcn e controles consistentes.
 */
export const SentimentPolarityThresholdChart: React.FC<Props> = ({ widget, title }) => {
    const chartRef = useRef<{ chart: Highcharts.Chart }>(null);
    const [period, setPeriod] = useState<'week' | 'month'>('month');
    const [selectedSeriesName, setSelectedSeriesName] = useState<string>(
        widget.series[0]?.name || ''
    );

    // Identifica o timestamp máximo nos dados
    const maxTimestamp = useMemo(() => {
        if (!widget.data || widget.data.length === 0) return Date.now();
        return Math.max(...widget.data.map(d => parseYYYYMMDDToUtcMs(d.timestamp)));
    }, [widget.data]);

    // Filtra e transforma dados para a série selecionada
    const chartData = useMemo(() => {
        return widget.data
            .filter(d => d.series === selectedSeriesName)
            .map(d => ({
                x: parseYYYYMMDDToUtcMs(d.timestamp),
                y: d.value,
                custom: { total: d.total }
            }))
            .sort((a, b) => a.x - b.x);
    }, [widget.data, selectedSeriesName]);

    // Configuração do Highcharts
    const options: Highcharts.Options = useMemo(() => {
        const threshold = widget.threshold;
        const hasThreshold = threshold !== undefined;

        const zones = hasThreshold
            ? [
                { value: threshold, color: widget.below_color || '#ef4444' },
                { color: widget.above_color || '#3b82f6' }
            ]
            : undefined;

        const now = maxTimestamp;
        let min: number;
        if (period === 'week') {
            min = now - 6 * 24 * 3600 * 1000;
        } else {
            min = now - 29 * 24 * 3600 * 1000;
        }

        return {
            chart: {
                backgroundColor: 'transparent',
                style: { fontFamily: 'inherit' },
                height: 350,
                type: 'spline',
            },
            title: {
                text: '',
            },
            credits: { enabled: false },
            exporting: { 
                enabled: true, 
                buttons: { contextButton: { enabled: false } } 
            },
            xAxis: {
                type: 'datetime',
                gridLineWidth: 0,
                lineWidth: 1,
                lineColor: '#e5e7eb',
                tickLength: 5,
                tickWidth: 1,
                min,
                max: now,
                labels: {
                    formatter: function() {
                        return formatPtMonthDay(this.value as number);
                    },
                    style: { color: '#6b7280', fontSize: '11px' }
                }
            },
            yAxis: {
                title: { text: widget.unit },
                gridLineColor: '#f3f4f6',
                plotLines: hasThreshold ? [{
                    value: threshold,
                    color: '#374151',
                    width: 1,
                    dashStyle: 'Dash',
                    zIndex: 2,
                    label: { enabled: false }
                }] : []
            },
            legend: { enabled: false },
            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function() {
                    const point = this.points?.[0]?.point as any;
                    if (!point) return '';
                    
                    let s = `<div style="font-family: inherit; padding: 4px;">`;
                    s += `<b style="color: #374151;">${formatPtMonthDay(this.x as number)}</b><br/>`;
                    s += `<div style="display: flex; align-items: center; margin-top: 4px;">`;
                    s += `<span style="color:${this.points?.[0]?.color}; margin-right: 4px;">\u25CF</span> `;
                    s += `<span style="color: #6b7280; margin-right: 4px;">${selectedSeriesName}:</span> `;
                    s += `<b style="color: #111827;">${point.y.toFixed(2)}${widget.unit}</b>`;
                    if (point.custom?.total !== undefined) {
                        s += ` <span style="color: #9ca3af; font-size: 10px; margin-left: 4px;">(n=${point.custom.total})</span>`;
                    }
                    s += `</div></div>`;
                    return s;
                }
            },
            plotOptions: {
                series: {
                    lineWidth: 2,
                    marker: { 
                        enabled: true,
                        radius: 4
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 1,
                            halo: { size: 0 }
                        }
                    },
                    zoneAxis: 'y',
                    zones: zones
                }
            },
            series: [{
                name: selectedSeriesName,
                type: 'spline',
                data: chartData,
            }]
        };
    }, [widget, title, selectedSeriesName, chartData, period, maxTimestamp]);

    const handleExport = () => {
        chartRef.current?.chart.exportChart({ type: 'image/png' }, {});
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header Controls aligned with ChartWidget style */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h2>
                
                <div className="flex items-center gap-2">
                    {widget.series.length > 1 && (
                        <Select value={selectedSeriesName} onValueChange={setSelectedSeriesName}>
                            <SelectTrigger className="w-auto min-w-[240px] h-auto py-2 [&>span]:line-clamp-none [&>span]:whitespace-normal text-left">
                                <SelectValue placeholder="selecionar série" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Séries</SelectLabel>
                                    {widget.series.map((s) => (
                                        <SelectItem key={s.name} value={s.name}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}

                    <div className="flex items-center gap-2">
                        <Toggle
                            variant="outline"
                            pressed={period === 'week'}
                            onPressedChange={(pressed) => pressed && setPeriod('week')}
                            className="w-12 justify-center"
                        >
                            1w
                        </Toggle>
                        <Toggle
                            variant="outline"
                            pressed={period === 'month'}
                            onPressedChange={(pressed) => pressed && setPeriod('month')}
                            className="w-12 justify-center"
                        >
                            1m
                        </Toggle>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                        aria-label="Exportar gráfico"
                        className="h-9 w-9"
                    >
                        <ImageDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Container do Gráfico */}
            <div className="flex-1 min-h-[350px]">
                <Chart
                    options={options}
                    ref={chartRef}
                />
            </div>
        </div>
    );
};
