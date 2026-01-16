/* eslint-disable */
// @ts-nocheck

import React, { useMemo, useRef, useState } from "react";
import Highcharts from "@/lib/highchartsSetup.ts";
import { Chart } from "@highcharts/react";
import type { HighchartsReactRefObject } from "@highcharts/react";

import { ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";

import type { SentimentEmotionsTimeSeries } from "@/widget_types.ts";
import { parseYYYYMMDDToUtcMs, formatPtMonthDay } from "../../utils/chartUtils.ts";

interface Props {
    widget: SentimentEmotionsTimeSeries;
    title: string;
}

/**
 * Série temporal de emoções/sentimentos (multi-séries).
 * - Layout semelhante ao SentimentPolarityThresholdChart (header + toggles + export)
 * - Sem select/dropdown: mostra todas as séries
 * - Sem marcadores (marker disabled)
 * - Toggle 1w / 1m com range automático
 * - Y-axis com padding dinâmico (inteligente)
 */
export const SentimentEmotionsTimeSeriesChart: React.FC<Props> = ({ widget, title }) => {
    const chartRef = useRef<HighchartsReactRefObject>(null);

    const [period, setPeriod] = useState<"week" | "month">("month");

    const seriesMeta = useMemo(
        () => (widget.series || []) as Array<{ name: string; color?: string }>,
        [widget.series]
    );

    const maxTimestamp = useMemo(() => {
        if (!widget.data || widget.data.length === 0) return Date.now();
        return Math.max(...widget.data.map((d) => parseYYYYMMDDToUtcMs(d.timestamp)));
    }, [widget.data]);

    const range = useMemo(() => {
        const now = maxTimestamp;
        const days = period === "week" ? 6 : 29;
        const min = now - days * 24 * 3600 * 1000;
        return { min, max: now };
    }, [period, maxTimestamp]);

    // Monta timestamps únicos e mapa de valores por (timestamp, série)
    const { timestamps, seriesPoints, allVisibleValues } = useMemo(() => {
        const ts = Array.from(new Set((widget.data || []).map((d) => d.timestamp))).sort();
        const tsMs = ts.map((t) => parseYYYYMMDDToUtcMs(t));

        const inRangeIdx = tsMs
            .map((ms, idx) => ({ ms, idx }))
            .filter(({ ms }) => ms >= range.min && ms <= range.max)
            .map(({ idx }) => idx);

        const visibleMs = inRangeIdx.map((i) => tsMs[i]);

        // Index por timestamp+series -> value
        const map = new Map<string, number>();
        for (const d of widget.data || []) {
            const x = parseYYYYMMDDToUtcMs(d.timestamp);
            if (x < range.min || x > range.max) continue;
            map.set(`${x}__${d.series}`, d.value);
        }

        // Série -> points no range (com null quando faltar)
        const sPoints = seriesMeta.map((s) => {
            const data = visibleMs.map((x) => {
                const v = map.get(`${x}__${s.name}`);
                return v == null ? null : v;
            });
            return { name: s.name, color: s.color, data };
        });

        // valores visíveis (para autoscale do eixo Y)
        const values: number[] = [];
        for (const s of sPoints) {
            for (const v of s.data) {
                if (typeof v === "number" && Number.isFinite(v)) values.push(v);
            }
        }

        return { timestamps: visibleMs, seriesPoints: sPoints, allVisibleValues: values };
    }, [widget.data, seriesMeta, range.min, range.max]);

    const yExtremes = useMemo(() => {
        // padding inteligente semelhante ao seu outro chart
        if (!allVisibleValues.length) return { yMin: 0, yMax: 100 };

        const minY = Math.min(...allVisibleValues);
        const maxY = Math.max(...allVisibleValues);
        const dataRange = maxY - minY;

        const isMonth = period === "month";
        const padPercent = isMonth ? 0.3 : 0.15;
        const minPad = isMonth ? 8 : 2;

        const pad = Math.max(dataRange * padPercent, minPad);
        let yMin = minY - pad;
        let yMax = maxY + pad;

        // se percentuais, limita um pouco melhor
        if (widget.unit === "%") {
            yMin = Math.max(-5, yMin);
            yMax = Math.min(105, yMax);
        }

        return { yMin, yMax };
    }, [allVisibleValues, period, widget.unit]);

    const options: Highcharts.Options = useMemo(() => {
        return {
            chart: {
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
                height: 350,
                type: "spline",
            },
            title: { text: "" },
            credits: { enabled: false },
            exporting: {
                enabled: true,
                buttons: { contextButton: { enabled: false } }, // mantém consistente com os outros
            },

            xAxis: {
                type: "datetime",
                gridLineWidth: 0,
                lineWidth: 1,
                lineColor: "#e5e7eb",
                tickLength: 5,
                tickWidth: 1,
                min: range.min,
                max: range.max,
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
                min: yExtremes.yMin,
                max: yExtremes.yMax,
                tickAmount: 6,
                startOnTick: true,
                endOnTick: true,
                labels: {
                    style: { color: "#6b7280", fontSize: "11px" },
                },
            },

            legend: {
                enabled: true,
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
                floating: false,
                margin: 12,
                itemDistance: 14,
                itemMarginTop: 2,
                itemMarginBottom: 2,
                symbolRadius: 2,
                symbolWidth: 10,
                itemStyle: { color: "#374151", fontSize: "11px", fontWeight: "500" },
                itemHiddenStyle: { color: "#9ca3af", textDecoration: "line-through" },
                navigation: { enabled: true },
            },

            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                    const x = this.x as number;
                    const points = this.points || [];

                    let s = `<div style="font-family: inherit; padding: 4px;">`;
                    s += `<b style="color: #374151;">${Highcharts.dateFormat("%d-%m-%Y", x)}</b><br/>`;

                    for (const p of points) {
                        const y = typeof p.y === "number" ? p.y : null;
                        if (y === null) continue;

                        s += `<div style="display: flex; align-items: center; margin-top: 4px;">`;
                        s += `<span style="color:${p.color}; margin-right: 6px;">\u25CF</span>`;
                        s += `<span style="color: #6b7280; margin-right: 6px;">${p.series.name}:</span>`;
                        s += `<b style="color: #111827;">${y.toFixed(2)}${widget.unit}</b>`;
                        s += `</div>`;
                    }

                    s += `</div>`;
                    return s;
                },
            },

            plotOptions: {
                series: {
                    lineWidth: 2,
                    // ✅ sem ícones/markers
                    marker: { enabled: false },
                    states: {
                        hover: {
                            lineWidthPlus: 1,
                            halo: { size: 0 },
                        },
                    },
                },
            },

            series: seriesPoints.map((s) => ({
                name: s.name,
                type: "spline",
                data: s.data,
                color: s.color,
            })) as Highcharts.SeriesOptionsType[],
        };
    }, [widget.unit, seriesPoints, range.min, range.max, yExtremes.yMin, yExtremes.yMax]);

    const handleExport = () => {
        const exportChartOptions: Highcharts.Options = {
            chart: { spacingTop: 18 },
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
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[rgb(var(--color-text-rgb))] uppercase tracking-wider">
                    {title}
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
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

            <div className="flex-1 min-h-[350px]">
                <Chart options={options} ref={chartRef} />
            </div>
        </div>
    );
};
