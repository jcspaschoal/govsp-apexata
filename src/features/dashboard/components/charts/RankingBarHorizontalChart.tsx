/* eslint-disable */
// @ts-nocheck
import React, { useMemo } from "react";
import Highcharts from "@/lib/highchartsSetup";
import { Chart } from "@highcharts/react";

import type { RankingBarHorizontal } from "@/widget_types";

interface Props {
    widget: RankingBarHorizontal;
}

export const RankingBarHorizontalChart: React.FC<Props> = ({ widget }) => {
    const sorted = useMemo(() => {
        const rows = (widget.data || []).map((d) => ({
            label: d.label,
            percent: typeof d.percent === "number" ? d.percent : 0,
        }));
        rows.sort((a, b) => b.percent - a.percent);
        return rows;
    }, [widget.data]);

    const categories = useMemo(() => sorted.map((d) => d.label), [sorted]);
    const data = useMemo(() => sorted.map((d) => Number(d.percent.toFixed(2))), [sorted]);

    const maxX = useMemo(() => {
        const max = data.length ? Math.max(...data) : 0;
        // folga pequena pra caber o dataLabel no fim (como no print)
        return max > 0 ? max + Math.max(0.8, max * 0.08) : undefined;
    }, [data]);

    const options: Highcharts.Options = useMemo(() => {
        return {
            chart: {
                type: "bar",
                backgroundColor: "transparent",
                height: Math.max(320, categories.length * 22 + 40), // dá “respiro” vertical (sem scroll)
                spacingTop: 6,
                spacingBottom: 6,
                spacingLeft: 0,
                spacingRight: 10,
                style: { fontFamily: "inherit" },
            },

            title: { text: "" },
            credits: { enabled: false },

            // ✅ remove o menu/hamburguer
            exporting: { enabled: false },

            legend: { enabled: false },

            xAxis: {
                min: 0,
                max: maxX,
                visible: false, // ✅ no print não aparece eixo X
                gridLineWidth: 0,
                lineWidth: 0,
                tickLength: 0,
            },

            yAxis: {
                categories,
                reversed: true, // ✅ maior fica em cima após ordenar
                title: { text: "" },
                gridLineWidth: 0,
                lineWidth: 0,
                tickLength: 0,
                labels: {
                    style: { color: "#111827", fontSize: "11px", fontWeight: "500" },
                    // sem truncar (no print aparece tudo)
                },
            },

            tooltip: {
                useHTML: true,
                formatter: function () {
                    const p = this.point as any;
                    const label = String(p.category ?? "");
                    const y = typeof p.y === "number" ? p.y : 0;
                    return `
            <div style="font-family:inherit; padding:6px 8px;">
              <div style="color:#374151; font-weight:600;">${label}</div>
              <div style="margin-top:4px; color:#6b7280;">
                <b style="color:#111827;">${y.toFixed(2)}${widget.unit}</b>
              </div>
            </div>
          `;
                },
            },

            plotOptions: {
                series: {
                    animation: { duration: 400 },
                    borderWidth: 0,
                    grouping: false,
                    pointPadding: 0.18,
                    groupPadding: 0.08,
                    // hover discreto
                    states: { hover: { brightness: 0.05 } },
                    dataLabels: {
                        enabled: true,
                        inside: false,
                        align: "right",
                        x: 6,
                        allowOverlap: true,
                        crop: false,
                        overflow: "allow",
                        style: {
                            color: "#111827",
                            fontSize: "11px",
                            fontWeight: "600",
                            textOutline: "none",
                        },
                        formatter: function () {
                            const y = typeof this.y === "number" ? this.y : 0;
                            return `${y.toFixed(2)}${widget.unit}`;
                        },
                    },
                },
                bar: {
                    borderRadius: 2, // discreto, como no print
                },
            },

            series: [
                {
                    type: "bar",
                    name: "",
                    color: "#0B1E3A", // ✅ azul marinho (igual vibe do print)
                    data,
                },
            ],
        };
    }, [categories, data, maxX, widget.unit]);

    return <Chart options={options} />;
};
