/* eslint-disable */
// @ts-nocheck

import React, { useMemo, useState, useRef } from "react";
import Highcharts from "@/lib/highchartsSetup.ts";
import { Chart } from "@highcharts/react";
import type { HighchartsReactRefObject } from "@highcharts/react";

import { ImageDown, Menu, Check } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import type { SentimentPolarityThreshold } from "@/widget_types.ts";
import { parseYYYYMMDDToUtcMs, formatPtMonthDay } from "../../utils/chartUtils.ts";

interface Props {
    widget: SentimentPolarityThreshold;
    title: string;
}

/**
 * Gráfico de Linha com Threshold de Polaridade de Sentimento.
 * Implementa seleção de série única via dropdown Shadcn e controles consistentes.
 */
export const SentimentPolarityThresholdChart: React.FC<Props> = ({
                                                                     widget,
                                                                     title,
                                                                 }) => {
    const chartRef = useRef<HighchartsReactRefObject>(null);

    const [period, setPeriod] = useState<"week" | "month">("month");
    const [selectedSeriesName, setSelectedSeriesName] = useState<string>(
        widget.series[0]?.name || ""
    );

    // Identifica o timestamp máximo nos dados
    const maxTimestamp = useMemo(() => {
        if (!widget.data || widget.data.length === 0) return Date.now();
        return Math.max(...widget.data.map((d) => parseYYYYMMDDToUtcMs(d.timestamp)));
    }, [widget.data]);

    // Filtra e transforma dados para a série selecionada
    const chartData = useMemo(() => {
        return widget.data
            .filter((d) => d.series === selectedSeriesName)
            .map((d) => ({
                x: parseYYYYMMDDToUtcMs(d.timestamp),
                y: d.value,
                custom: { total: d.total },
            }))
            .sort((a, b) => a.x - b.x);
    }, [widget.data, selectedSeriesName]);

    // Configuração do Highcharts
    const options: Highcharts.Options = useMemo(() => {
        const threshold = widget.threshold;
        const hasThreshold = threshold !== undefined;

        const zones = hasThreshold
            ? [
                { value: threshold, color: widget.below_color || "#ef4444" },
                { color: widget.above_color || "#3b82f6" },
            ]
            : undefined;

        const now = maxTimestamp;
        let min: number;
        if (period === "week") {
            min = now - 6 * 24 * 3600 * 1000;
        } else {
            min = now - 29 * 24 * 3600 * 1000;
        }

        // Suavizar escala Y: calcular padding dinâmico
        const values = chartData.map((d) => d.y);
        const minYData = values.length > 0 ? Math.min(...values) : 0;
        const maxYData = values.length > 0 ? Math.max(...values) : 100;
        const dataRange = maxYData - minYData;

        const isMonth = period === "month";
        const padPercent = isMonth ? 0.3 : 0.15;
        const minPad = isMonth ? 8 : 2;

        const pad = Math.max(dataRange * padPercent, minPad);
        let yMin = minYData - pad;
        let yMax = maxYData + pad;

        if (hasThreshold) {
            yMin = Math.min(yMin, threshold - minPad);
            yMax = Math.max(yMax, threshold + minPad);
        }

        return {
            chart: {
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
                height: 350,
                type: "spline",
            },
            // mantém como você tinha: NÃO mostra título dentro do chart na tela
            title: { text: "" },

            credits: { enabled: false },
            exporting: {
                enabled: true,
                buttons: { contextButton: { enabled: false } },
            },
            xAxis: {
                type: "datetime",
                gridLineWidth: 0,
                lineWidth: 1,
                lineColor: "#e5e7eb",
                tickLength: 5,
                tickWidth: 1,
                min,
                max: now,
                labels: {
                    formatter: function () {
                        return formatPtMonthDay(this.value as number);
                    },
                    style: { color: "#6b7280", fontSize: "11px" },
                },
            },
            yAxis: {
                title: { text: widget.unit },
                gridLineColor: "#f3f4f6",
                min: yMin,
                max: yMax,
                tickAmount: 6,
                startOnTick: true,
                endOnTick: true,
                plotLines: hasThreshold
                    ? [
                        {
                            value: threshold,
                            color: "#374151",
                            width: 1,
                            dashStyle: "Dash",
                            zIndex: 2,
                            label: { enabled: false },
                        },
                    ]
                    : [],
            },
            legend: { enabled: false },
            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                    const point = this.points?.[0]?.point as any;
                    if (!point) return "";

                    let s = `<div style="font-family: inherit; padding: 4px;">`;
                    s += `<b style="color: #374151;">${Highcharts.dateFormat(
                        "%d-%m-%Y",
                        this.x as number
                    )}</b><br/>`;
                    s += `<div style="display: flex; align-items: center; margin-top: 4px;">`;
                    s += `<span style="color:${this.points?.[0]?.color}; margin-right: 4px;">\u25CF</span> `;
                    s += `<span style="color: #6b7280; margin-right: 4px;">${selectedSeriesName}:</span> `;
                    s += `<b style="color: #111827;">${point.y.toFixed(2)}${
                        widget.unit
                    }</b>`;
                    s += `</div></div>`;
                    return s;
                },
            },
            plotOptions: {
                series: {
                    lineWidth: 2,
                    marker: {
                        enabled: true,
                        radius: 4,
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 1,
                            halo: { size: 0 },
                        },
                    },
                    zoneAxis: "y",
                    zones: zones,
                },
            },
            series: [
                {
                    name: selectedSeriesName,
                    type: "spline",
                    data: chartData,
                },
            ],
        };
    }, [widget, selectedSeriesName, chartData, period, maxTimestamp]);

    const handleExport = () => {
        // ✅ título só no EXPORT, sem mexer no visual da tela
        const exportChartOptions: Highcharts.Options = {
            chart: {
                // cria espaço suficiente para o título NÃO sobrepor o plot
                spacingTop: 18,
            },
            title: {
                text: title,
                align: "left",
                margin: 14,
                style: {
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: "600",
                },
            },
        };

        chartRef.current?.chart?.exportChart({ type: "image/png" }, exportChartOptions);
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4 h-full">
            {/* Header Controls aligned with ChartWidget style */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[rgb(var(--color-text-rgb))] uppercase tracking-wider">
                    {title}
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                    {widget.series.length > 1 && (
                        <>
                            {/* Desktop Select */}
                            <div className="hidden sm:block">
                                <Select value={selectedSeriesName} onValueChange={setSelectedSeriesName}>
                                    <SelectTrigger className="h-9 w-auto min-w-[120px] md:min-w-[160px] px-2 text-left justify-start gap-2 [&>span]:line-clamp-none">
                                        <SelectValue placeholder="selecionar série" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {widget.series.map((s) => (
                                                <SelectItem
                                                    key={s.name}
                                                    value={s.name}
                                                    className="whitespace-normal break-words"
                                                >
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mobile Hamburger Menu */}
                            <div className="sm:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9"
                                            aria-label="Selecionar série"
                                        >
                                            <Menu className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[260px]">
                                        {widget.series.map((s) => (
                                            <DropdownMenuItem
                                                key={s.name}
                                                onSelect={() => setSelectedSeriesName(s.name)}
                                                className="flex items-center justify-between gap-2 whitespace-normal break-words"
                                            >
                                                {s.name}
                                                {selectedSeriesName === s.name && (
                                                    <Check className="h-4 w-4 opacity-50" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-2">
                        <Toggle
                            variant="outline"
                            pressed={period === "week"}
                            onPressedChange={(pressed) => pressed && setPeriod("week")}
                            className="h-9 px-3 text-xs data-[state=on]:bg-[rgb(var(--color-secondary-rgb))] data-[state=on]:text-[rgb(var(--on-secondary-rgb))] data-[state=on]:border-[rgb(var(--color-secondary-rgb))]"
                        >
                            1w
                        </Toggle>
                        <Toggle
                            variant="outline"
                            pressed={period === "month"}
                            onPressedChange={(pressed) => pressed && setPeriod("month")}
                            className="h-9 px-3 text-xs data-[state=on]:bg-[rgb(var(--color-secondary-rgb))] data-[state=on]:text-[rgb(var(--on-secondary-rgb))] data-[state=on]:border-[rgb(var(--color-secondary-rgb))]"
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
                <Chart options={options} ref={chartRef} />
            </div>
        </div>
    );
};
