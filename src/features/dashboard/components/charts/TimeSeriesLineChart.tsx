/* eslint-disable */
// @ts-nocheck

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Highcharts from "@/lib/highchartsSetup.ts";
import StockChart from "@highcharts/react/Stock";
import type { HighchartsReactRefObject } from "@highcharts/react/Stock";

import type { TimeSeriesLine, WidgetCollectionItem } from "@/widget_types";
import { parseYYYYMMDDToUtcMs, formatPtMonthDay } from "../../utils/chartUtils";

import dayjs from "dayjs";

interface Props {
    widget: TimeSeriesLine | WidgetCollectionItem[]; // ✅ aceita coleção
    title: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

const BASE_MARGIN_BOTTOM = 80;
const EXTRA_LEGEND_PAD = 10;

function isCollection(x: any): x is WidgetCollectionItem[] {
    return Array.isArray(x);
}

export const TimeSeriesLineChart: React.FC<Props> = ({ widget, title }) => {
    const chartRef = useRef<HighchartsReactRefObject>(null);
    const isAdjustingRef = useRef(false);

    // ✅ datas apenas para display (read-only)
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    // ✅ coleção: qual sublabel está ativo
    const [activeOrder, setActiveOrder] = useState<number | null>(null);

    const isColl = isCollection(widget);

    // ✅ coleção ordenada
    const collection = useMemo(() => {
        if (!isColl) return [];
        return [...widget].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [isColl, widget]);

    // ✅ define ativo default como o primeiro (menor order)
    useEffect(() => {
        if (!isColl) return;
        const first = collection[0]?.order ?? 0;
        if (activeOrder == null) setActiveOrder(first);
    }, [isColl, collection, activeOrder]);

    const activeItem = useMemo(() => {
        if (!isColl) return null;
        const ord = activeOrder ?? (collection[0]?.order ?? 0);
        return collection.find((x) => (x.order ?? 0) === ord) ?? collection[0] ?? null;
    }, [isColl, collection, activeOrder]);

    // ---------------------------------------------------------------------------
    // SERIES META + DATA
    // - Normal: usa widget.series/widget.data (idêntico ao original)
    // - Collection: usa SOMENTE activeItem.series/activeItem.data
    // ---------------------------------------------------------------------------
    const seriesMeta = useMemo(() => {
        const w = (isColl ? (activeItem as any) : (widget as any)) as TimeSeriesLine | null;
        if (!w) return [];
        return (w.series || []) as Array<{ name: string; color?: string }>;
    }, [isColl, widget, activeItem]);

    const seriesData = useMemo(() => {
        const w = (isColl ? (activeItem as any) : (widget as any)) as TimeSeriesLine | null;
        if (!w) return [];

        const bySeries = new Map<string, Array<[number, number]>>();

        for (const d of w.data || []) {
            const x = parseYYYYMMDDToUtcMs(d.timestamp);
            if (!bySeries.has(d.series)) bySeries.set(d.series, []);
            bySeries.get(d.series)!.push([x, d.value]);
        }

        for (const [k, pts] of bySeries.entries()) {
            pts.sort((a, b) => a[0] - b[0]);
            bySeries.set(k, pts);
        }

        return seriesMeta.map((s) => ({
            name: s.name,
            color: s.color,
            data: bySeries.get(s.name) ?? [],
        }));
    }, [isColl, widget, activeItem, seriesMeta]);

    const unit = useMemo(() => {
        if (!isColl) return (widget as TimeSeriesLine).unit;
        return ((activeItem as any)?.unit ?? (collection[0] as any)?.unit ?? "") as string;
    }, [isColl, widget, activeItem, collection]);

    // ---------------------------------------------------------------------------
    // Y-axis autoscale (igual ao original)
    // ---------------------------------------------------------------------------
    const computePaddedExtremes = useCallback((values: number[], xRangeMs: number) => {
        if (values.length === 0) return null;

        const isLong = xRangeMs >= 20 * DAY_MS;
        const padPercent = isLong ? 0.3 : 0.15;
        const minPad = isLong ? 8 : 2;

        const minY = Math.min(...values);
        const maxY = Math.max(...values);
        const range = maxY - minY;

        const pad = Math.max(range * padPercent, minPad);
        return { yMin: minY - pad, yMax: maxY + pad };
    }, []);

    const recomputeYAxis = useCallback(() => {
        const chart = chartRef.current?.chart as any;
        if (!chart?.xAxis?.[0] || !chart?.yAxis?.[0]) return;

        const { min, max } = chart.xAxis[0].getExtremes();
        const xMin = typeof min === "number" ? min : undefined;
        const xMax = typeof max === "number" ? max : undefined;
        if (xMin == null || xMax == null) return;

        const ys: number[] = [];

        chart.series.forEach((s: any) => {
            if (!s.visible) return;
            s.points?.forEach((p: any) => {
                const x = p.x as number;
                const y = p.y as number | null | undefined;
                if (x >= xMin && x <= xMax && typeof y === "number" && Number.isFinite(y)) {
                    ys.push(y);
                }
            });
        });

        const extremes = computePaddedExtremes(ys, xMax - xMin);
        if (!extremes) return;

        chart.yAxis[0].setExtremes(extremes.yMin, extremes.yMax, true, false);
    }, [computePaddedExtremes]);

    const adjustBottomForLegend = useCallback(() => {
        const chart = chartRef.current?.chart as any;
        if (!chart || isAdjustingRef.current) return;

        let legendH = 0;
        try {
            legendH = chart.legend?.group?.getBBox?.().height ?? 0;
        } catch {
            legendH = 0;
        }

        const neededBottom = Math.max(
            BASE_MARGIN_BOTTOM,
            Math.min(170, Math.ceil(legendH + 26 + EXTRA_LEGEND_PAD))
        );

        const current = chart.options?.chart?.marginBottom ?? 0;
        if (Math.abs(current - neededBottom) < 2) return;

        isAdjustingRef.current = true;
        chart.update({ chart: { marginBottom: neededBottom } }, false, false, false);
        chart.redraw();
        isAdjustingRef.current = false;
    }, []);

    const syncDatesFromAxis = useCallback((minMs?: number, maxMs?: number) => {
        if (typeof minMs === "number") setFromDate(new Date(minMs));
        if (typeof maxMs === "number") setToDate(new Date(maxMs));
    }, []);

    // ✅ quando troca sublabel, recalcula yAxis/legend/datas no chart atual (sem mexer no visual)
    useEffect(() => {
        if (!isColl) return;
        const chart = chartRef.current?.chart as any;
        if (!chart?.xAxis?.[0]) return;

        setTimeout(() => {
            adjustBottomForLegend();
            recomputeYAxis();
            const ex = chart?.xAxis?.[0]?.getExtremes?.();
            syncDatesFromAxis(ex?.min, ex?.max);
        }, 0);
    }, [isColl, activeOrder, adjustBottomForLegend, recomputeYAxis, syncDatesFromAxis]);

    // ---------------------------------------------------------------------------
    // Options — mantém original ao máximo.
    // A ÚNICA diferença visual: em coleção => markers DESLIGADOS (como você pediu antes)
    // ---------------------------------------------------------------------------
    const options: Highcharts.Options = useMemo(() => {
        const palette = (Highcharts.getOptions()?.colors || []) as string[];

        const finalSeries = seriesData.map((s, idx) => ({
            name: s.name,
            type: "spline",
            data: s.data,

            // ✅ suporte a color (com fallback para palette)
            color: s.color || palette[idx % (palette.length || 1)],

            // ✅ apenas em coleção mudamos markers (sem marcadores)
            marker: isColl ? { enabled: false } : { enabled: true, radius: 4 },

            // mantém sua espessura padrão
            lineWidth: 2,
            clip: true,
        })) as Highcharts.SeriesOptionsType[];

        return {
            chart: {
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
                height: 350,
                zoomType: "x",
                marginBottom: BASE_MARGIN_BOTTOM,
                spacingBottom: 10,
                events: {
                    load: function () {
                        const chart = this as any;
                        setTimeout(() => {
                            adjustBottomForLegend();
                            recomputeYAxis();
                            const ex = chart?.xAxis?.[0]?.getExtremes?.();
                            syncDatesFromAxis(ex?.min, ex?.max);
                        }, 0);
                    },
                    redraw: function () {
                        setTimeout(() => adjustBottomForLegend(), 0);
                    },
                },
            },

            title: { text: "" },
            credits: { enabled: false },

            navigator: { enabled: false },
            scrollbar: { enabled: false },

            // ✅ mantém rangeSelector original (visual)
            rangeSelector: {
                verticalAlign: "top",
                inputEnabled: false,
                allButtonsEnabled: false,
                selected: 1,
                buttons: [
                    { type: "week", count: 1, text: "1w" },
                    { type: "month", count: 1, text: "1m" },
                ],
            },

            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        menuItems: ["downloadPNG", "printChart"],
                    },
                },
            },

            xAxis: {
                type: "datetime",
                lineWidth: 1,
                lineColor: "#e5e7eb",
                tickLength: 5,
                tickWidth: 1,
                minPadding: 0.06,
                maxPadding: 0.03,
                labels: {
                    formatter: function () {
                        return formatPtMonthDay(this.value as number);
                    },
                    style: { color: "#6b7280", fontSize: "11px" },
                },

                events: {
                    afterSetExtremes: function (e: any) {
                        const min = typeof e.min === "number" ? e.min : undefined;
                        const max = typeof e.max === "number" ? e.max : undefined;

                        // clamp de 1 mês (original)
                        if (min != null && max != null) {
                            const range = max - min;
                            if (range > MONTH_MS) {
                                const newMin = max - MONTH_MS;
                                const chart = chartRef.current?.chart as any;
                                chart?.xAxis?.[0]?.setExtremes(newMin, max, true, false);
                                return;
                            }
                        }

                        setTimeout(() => {
                            adjustBottomForLegend();
                            recomputeYAxis();
                            syncDatesFromAxis(min, max);
                        }, 0);
                    },
                },
            },

            yAxis: {
                title: { text: unit },
                gridLineColor: "#f3f4f6",
                tickAmount: 6,
                startOnTick: true,
                endOnTick: true,
                labels: {
                    reserveSpace: true,
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

            // ✅ tooltip IGUAL ao normal (como você pediu)
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
                        s += `<b style="color: #111827;">${y.toFixed(2)}${unit}</b>`;
                        s += `</div>`;
                    }

                    s += `</div>`;
                    return s;
                },
            },

            plotOptions: {
                series: {
                    type: "spline",
                    lineWidth: 2,
                    clip: true,
                    marker: { enabled: true, radius: 4 }, // (séries sobrescrevem em coleção)
                    states: { hover: { lineWidthPlus: 1, halo: { size: 0 } } },
                    events: {
                        hide: function () {
                            setTimeout(() => {
                                adjustBottomForLegend();
                                recomputeYAxis();
                            }, 0);
                        },
                        show: function () {
                            setTimeout(() => {
                                adjustBottomForLegend();
                                recomputeYAxis();
                            }, 0);
                        },
                    },
                },
            },

            series: finalSeries,
        };
    }, [
        isColl,
        unit,
        seriesData,
        recomputeYAxis,
        adjustBottomForLegend,
        syncDatesFromAxis,
    ]);

    const formatShort = (d: Date | null) => (d ? dayjs(d).format("DD/MM/YY") : "dd/mm/yy");

    // ✅ tabs acima (apenas coleção)
    const sublabelTabs = useMemo(() => {
        if (!isColl) return [];
        return collection.map((it) => ({
            order: it.order ?? 0,
            sublabel: it.sublabel,
            active: (it.order ?? 0) === (activeOrder ?? (collection[0]?.order ?? 0)),
        }));
    }, [isColl, collection, activeOrder]);

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-3 h-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[rgb(var(--color-text-rgb))] uppercase tracking-wider">
                    {title}
                </h2>
            </div>

            {/* ✅ SUBLABELS acima do gráfico (isolam o ambiente) */}
            {isColl && sublabelTabs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 -mt-1">
                    {sublabelTabs.map((t) => (
                        <button
                            key={t.order}
                            type="button"
                            onClick={() => setActiveOrder(t.order)}
                            className={[
                                "relative px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
                                t.active
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                            ].join(" ")}
                            title={t.sublabel}
                            aria-pressed={t.active}
                        >
              <span
                  className={[
                      "absolute left-2 right-2 -bottom-[3px] h-0.5 rounded-full",
                      t.active ? "bg-blue-600" : "bg-transparent",
                  ].join(" ")}
              />
                            {t.sublabel}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative flex-1 min-h-[350px]">
                {/* ✅ display das datas (original) */}
                <div className="absolute right-3 top-2 z-20 flex items-center gap-2">
                    <div
                        className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold rounded-lg text-gray-700 select-none"
                        aria-label="Data inicial"
                        title="Data inicial"
                    >
                        <span className="leading-none tracking-wide">{formatShort(fromDate)}</span>
                    </div>

                    <span className="text-xs text-gray-400 select-none">→</span>

                    <div
                        className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold rounded-lg text-gray-700 select-none"
                        aria-label="Data final"
                        title="Data final"
                    >
                        <span className="leading-none tracking-wide">{formatShort(toDate)}</span>
                    </div>
                </div>

                <StockChart options={options} ref={chartRef} />
            </div>
        </div>
    );
};
