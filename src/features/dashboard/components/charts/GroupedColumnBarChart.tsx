/* eslint-disable */
// @ts-nocheck
import React, { useMemo } from "react";
import Highcharts from "@/lib/highchartsSetup";
import { Chart, XAxis, YAxis } from "@highcharts/react";
import { Column } from "@highcharts/react/series";

import type { GroupedColumnBar } from "@/widget_types";

interface Props {
    widget: GroupedColumnBar;
    baseOptions?: Highcharts.Options;
}

export const GroupedColumnBarChart: React.FC<Props> = ({ widget, baseOptions }) => {
    const options: Highcharts.Options = useMemo(() => {
        const chartOptions = baseOptions ?? {};

        return {
            ...chartOptions,

            exporting: { enabled: false },

            chart: {
                ...(chartOptions.chart as any),
                type: "column",
                height: 320,
                spacingTop: 6,
                spacingBottom: 6,
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
            },

            title: { text: "" },
            credits: { enabled: false },

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
                ...(chartOptions.xAxis as any),
                categories: widget.periods,
                labels: { style: { color: "#6b7280", fontSize: "11px" } },
                lineColor: "#e5e7eb",
                tickColor: "#e5e7eb",
            },

            yAxis: {
                ...(chartOptions.yAxis as any),
                title: { text: "" },
                gridLineColor: "#f3f4f6",
                labels: { style: { color: "#6b7280", fontSize: "11px" } },
            },

            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function () {
                    // ✅ header correto (categoria/data), não "0"
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
                        s += `<b style="color:#111827;">${y.toFixed(2)}${widget.unit}</b>`;
                        s += `</div>`;
                    }

                    s += `</div>`;
                    return s;
                },
            },

            plotOptions: {
                ...(chartOptions.plotOptions as any),
                column: {
                    grouping: true,
                    borderWidth: 0,
                    pointPadding: 0.08,
                    groupPadding: 0.18,
                    maxPointWidth: 14,
                },
            },
        };
    }, [widget, baseOptions]);

    return (
        <Chart options={options}>
            <XAxis categories={widget.periods} />
            <YAxis />
            {widget.categories.map((catName, catIdx) => (
                <Column.Series
                    key={catName}
                    name={catName}
                    data={widget.values.map((periodValues) => periodValues[catIdx])}
                />
            ))}
        </Chart>
    );
};
