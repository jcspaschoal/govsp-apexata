/* eslint-disable */
// @ts-nocheck
import React, { useMemo } from "react";
import Highcharts from "@/lib/highchartsSetup";
import { Chart } from "@highcharts/react";
import type { GroupedColumnBar } from "@/widget_types";

interface Props {
    widget: GroupedColumnBar;
    baseOptions?: Highcharts.Options;
}

export const GroupedColumnBarChart: React.FC<Props> = ({ widget, baseOptions }) => {
    const options: Highcharts.Options = useMemo(() => {
        const unit = widget.unit || "%";
        const periods = widget.periods || [];
        const categories = widget.categories || [];
        const values = widget.values || [];

        // ✅ series construídas como objeto (não JSX)
        const series = categories.map((catName, catIdx) => ({
            type: "column" as const,
            name: catName, // ✅ aqui NÃO tem como “sumir”
            data: values.map((periodValues) => periodValues?.[catIdx] ?? null),
        }));

        // baseOptions por último costuma sobrescrever o que você quer; então aplicamos base primeiro e sobrescrevemos depois
        const base = baseOptions ?? {};

        return {
            ...base,

            exporting: { enabled: false }, // ✅ sem hamburguer
            credits: { enabled: false },
            title: { text: "" },

            chart: {
                ...(base.chart as any),
                type: "column",
                height: 320,
                spacingTop: 6,
                spacingBottom: 6,
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
            },

            legend: {
                enabled: true,
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
                floating: false,
                itemDistance: 14,
                itemMarginTop: 2,
                itemMarginBottom: 2,
                symbolRadius: 2,
                symbolWidth: 10,
                itemStyle: { color: "#374151", fontSize: "11px", fontWeight: "500" },
                itemHiddenStyle: { color: "#9ca3af", textDecoration: "line-through" },
                navigation: { enabled: true },
            },

            xAxis: {
                ...(base.xAxis as any),
                categories: periods,
                labels: { style: { color: "#6b7280", fontSize: "11px" } },
                lineColor: "#e5e7eb",
                tickColor: "#e5e7eb",
            },

            yAxis: {
                ...(base.yAxis as any),
                title: { text: "" },
                gridLineColor: "#f3f4f6",
                labels: { style: { color: "#6b7280", fontSize: "11px" } },
            },

            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                    const points = this.points || [];
                    const header =
                        (points?.[0] as any)?.key ??
                        (points?.[0] as any)?.category ??
                        (points?.[0] as any)?.point?.category ??
                        this.x;

                    let s = `<div style="font-family: inherit; padding: 6px 8px;">`;
                    s += `<b style="color:#374151;">${header}</b><br/>`;

                    for (const p of points) {
                        const y = typeof p.y === "number" ? p.y : null;
                        if (y === null) continue;

                        s += `<div style="display:flex; align-items:center; margin-top:4px;">`;
                        s += `<span style="color:${p.color}; margin-right:6px;">●</span>`;
                        s += `<span style="color:#6b7280; margin-right:6px;">${p.series.name}:</span>`;
                        s += `<b style="color:#111827;">${y.toFixed(2)}${unit}</b>`;
                        s += `</div>`;
                    }

                    s += `</div>`;
                    return s;
                },
            },

            plotOptions: {
                ...(base.plotOptions as any),
                column: {
                    grouping: true,
                    borderWidth: 0,
                    pointPadding: 0.08,
                    groupPadding: 0.18,
                    maxPointWidth: 14,
                },
            },

            series: series as any,
        };
    }, [widget, baseOptions]);

    return <Chart options={options} />;
};
