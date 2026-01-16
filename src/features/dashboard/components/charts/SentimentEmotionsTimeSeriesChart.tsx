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
import { parseYYYYMMDDToUtcMs } from "../../utils/chartUtils.ts";

interface Props {
    widget: SentimentEmotionsTimeSeries;
    title: string;
}

export const SentimentEmotionsTimeSeriesChart: React.FC<Props> = ({ widget, title }) => {
    const chartRef = useRef<HighchartsReactRefObject>(null);
    const [period, setPeriod] = useState<"week" | "month">("month");

    const allTimestamps = useMemo(() => {
        return Array.from(new Set((widget.data || []).map((d) => d.timestamp))).sort();
    }, [widget.data]);

    const maxTsMs = useMemo(() => {
        if (!allTimestamps.length) return Date.now();
        return Math.max(...allTimestamps.map((t) => parseYYYYMMDDToUtcMs(t)));
    }, [allTimestamps]);

    const range = useMemo(() => {
        const days = period === "week" ? 6 : 29;
        const min = maxTsMs - days * 24 * 3600 * 1000;
        const max = maxTsMs;
        return { min, max };
    }, [period, maxTsMs]);

    const visibleTimestamps = useMemo(() => {
        return allTimestamps.filter((t) => {
            const ms = parseYYYYMMDDToUtcMs(t);
            return ms >= range.min && ms <= range.max;
        });
    }, [allTimestamps, range.min, range.max]);

    // lookup rápido por timestamp+serie
    const valueMap = useMemo(() => {
        const m = new Map<string, number>();
        for (const d of widget.data || []) {
            const ms = parseYYYYMMDDToUtcMs(d.timestamp);
            if (ms < range.min || ms > range.max) continue;
            m.set(`${d.timestamp}__${d.series}`, d.value);
        }
        return m;
    }, [widget.data, range.min, range.max]);

    const seriesData = useMemo(() => {
        const meta = widget.series || [];
        return meta.map((s) => {
            const data = visibleTimestamps.map((t) => {
                const v = valueMap.get(`${t}__${s.name}`);
                return typeof v === "number" ? v : null;
            });
            return { name: s.name, color: s.color, data };
        });
    }, [widget.series, visibleTimestamps, valueMap]);

    const yExtremes = useMemo(() => {
        const values: number[] = [];
        for (const s of seriesData) {
            for (const v of s.data) {
                if (typeof v === "number" && Number.isFinite(v)) values.push(v);
            }
        }

        if (!values.length) return { yMin: 0, yMax: widget.unit === "%" ? 100 : 10 };

        const minY = Math.min(...values);
        const maxY = Math.max(...values);
        const rangeY = maxY - minY;

        const isMonth = period === "month";
        const padPercent = isMonth ? 0.3 : 0.15;
        const minPad = isMonth ? 3 : 1;

        const pad = Math.max(rangeY * padPercent, minPad);
        let yMin = minY - pad;
        let yMax = maxY + pad;

        if (widget.unit === "%") {
            yMin = Math.max(0, yMin);
            yMax = Math.min(100, yMax);

            // se ficou muito “colado”, garante uma folga mínima
            if (yMax - yMin < 10) {
                yMin = Math.max(0, yMin - 3);
                yMax = Math.min(100, yMax + 3);
            }
        }

        return { yMin, yMax };
    }, [seriesData, period, widget.unit]);

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
                buttons: { contextButton: { enabled: false } },
            },

            xAxis: {
                categories: visibleTimestamps,
                lineWidth: 1,
                lineColor: "#e5e7eb",
                tickLength: 5,
                tickWidth: 1,
                labels: {
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
                labels: { style: { color: "#6b7280", fontSize: "11px" } },
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
                    // ✅ header correto (categoria/data), não índice
                    const points = this.points || [];
                    const header =
                        (points?.[0] as any)?.key ??
                        (points?.[0] as any)?.category ??
                        (points?.[0] as any)?.point?.category ??
                        String(this.x ?? "");

                    let s = `<div style="font-family: inherit; padding: 4px;">`;
                    s += `<b style="color: #374151;">${header}</b><br/>`;

                    for (const p of points) {
                        const y = typeof p.y === "number" ? p.y : null;
                        if (y === null) continue;

                        s += `<div style="display:flex; align-items:center; margin-top:4px;">`;
                        s += `<span style="color:${p.color}; margin-right:6px;">\u25CF</span>`;
                        s += `<span style="color:#6b7280; margin-right:6px;">${p.series.name}:</span>`;
                        s += `<b style="color:#111827;">${y.toFixed(2)}${widget.unit}</b>`;
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
                        hover: { lineWidthPlus: 1, halo: { size: 0 } },
                    },
                },
            },

            series: seriesData.map((s) => ({
                name: s.name,
                type: "spline",
                data: s.data,
                color: s.color,
            })) as Highcharts.SeriesOptionsType[],
        };
    }, [visibleTimestamps, widget.unit, yExtremes.yMin, yExtremes.yMax, seriesData]);

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

    const hasData = visibleTimestamps.length > 0 && seriesData.some((s) => s.data.some((v) => v != null));

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
                {hasData ? (
                    <Chart options={options} ref={chartRef} />
                ) : (
                    <div className="h-[350px] flex items-center justify-center text-sm text-gray-500">
                        Sem dados para o período selecionado.
                    </div>
                )}
            </div>
        </div>
    );
};
