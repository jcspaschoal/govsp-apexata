/* eslint-disable */
// @ts-nocheck
import React, { useMemo, useRef, useState } from "react";
import Highcharts from "@/lib/highchartsSetup";
import { Chart } from "@highcharts/react";
import type { HighchartsReactRefObject } from "@highcharts/react";

import { ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

import type { ShareOfVoiceDonut } from "@/widget_types";

type Period = "day" | "week" | "month" | "all";

interface Props {
    widget: ShareOfVoiceDonut;
    title: string;
}

const PERIODS: { key: Period; label: string }[] = [
    { key: "day", label: "1d" },
    { key: "week", label: "1w" },
    { key: "month", label: "1m" },
    { key: "all", label: "All" },
];

export const ShareOfVoiceDonutChart: React.FC<Props> = ({ widget, title }) => {
    const chartRef = useRef<HighchartsReactRefObject>(null);

    const [period, setPeriod] = useState<Period>(() => {
        const hasWeek = widget.data?.some((d) => typeof d.week === "number");
        return hasWeek ? "week" : "day";
    });

    const availablePeriods = useMemo(() => {
        const has = (p: Period) => widget.data?.some((d: any) => typeof d?.[p] === "number");
        return PERIODS.filter((p) => has(p.key));
    }, [widget.data]);

    const seriesData = useMemo(() => {
        const raw =
            (widget.data || [])
                .map((d) => {
                    const y = (d as any)[period] as number | undefined;
                    if (typeof y !== "number") return null;

                    // você disse que já limitou pra 7 letras — então respeitamos como vem.
                    // Se quiser garantir aqui também, descomente:
                    // const short = String(d.category || "").slice(0, 7);

                    return {
                        name: String(d.category || ""),
                        y,
                        color: d.color,
                    };
                })
                .filter(Boolean) as Array<{ name: string; y: number; color?: string }>;

        // Ordem desc ajuda a distribuição dos labels e leitura
        raw.sort((a, b) => b.y - a.y);

        // Se tiver muitos itens, agrupar “Outros” evita caos (opcional)
        const MAX_SLICES = 12;
        if (raw.length > MAX_SLICES) {
            const top = raw.slice(0, MAX_SLICES - 1);
            const rest = raw.slice(MAX_SLICES - 1);
            const restSum = rest.reduce((acc, it) => acc + it.y, 0);
            top.push({ name: "Outros", y: restSum, color: "#9ca3af" });
            return top;
        }

        return raw;
    }, [widget.data, period]);

    const options: Highcharts.Options = useMemo(() => {
        return {
            chart: {
                type: "pie",
                backgroundColor: "#ffffff",
                style: { fontFamily: "inherit" },
                height: 350,

                // ✅ espaço interno pro Highcharts organizar labels externos SEM mexer no container do card
                marginLeft: 50,
                marginRight: 50,
                marginTop: 8,
                marginBottom: 8,

                events: {
                    render: function () {
                        // ✅ Permite que APENAS os labels “vazem” (quando o corte vem do próprio Highcharts)
                        // Isso não muda o tamanho do container/card — só evita clipping do SVG interno.
                        try {
                            const chart = this as any;
                            const container = chart?.container as HTMLElement | undefined;
                            const renderTo = chart?.renderTo as HTMLElement | undefined;

                            if (container) container.style.overflow = "visible";
                            if (renderTo) renderTo.style.overflow = "visible";

                            // às vezes o pai imediato do SVG também corta
                            const parent = renderTo?.parentElement as HTMLElement | null;
                            if (parent) parent.style.overflow = "visible";
                        } catch (e) {
                            // noop
                        }
                    },
                },
            },

            title: { text: "" },
            credits: { enabled: false },
            legend: { enabled: false },

            exporting: {
                enabled: true,
                buttons: { contextButton: { enabled: false } },
            },

            tooltip: {
                // simples e claro
                useHTML: true,
                formatter: function () {
                    const p = this.point as any;
                    const color = p.color || "#111827";
                    return `
            <div style="font-family:inherit; padding:6px 8px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:${color}; font-size:14px;">●</span>
                <b style="color:#111827;">${p.name}</b>
              </div>
              <div style="margin-top:4px; color:#6b7280;">
                ${Highcharts.numberFormat(p.y, 1)}${widget.unit || "%"}
              </div>
            </div>
          `;
                },
            },

            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    borderWidth: 0,

                    // ✅ diminui o pie pra sobrar área para labels externos
                    // (sem “buraco” no meio)
                    size: "80%",

                    // ✅ padrão do exemplo: 2 dataLabels
                    dataLabels: [
                        // 1) EXTERNO: apenas NOME
                        {
                            enabled: true,
                            distance: 20,
                            useHTML: false,

                            // ✅ não “sumir” por colisão
                            allowOverlap: true,

                            // ✅ deixar label sair do plot sem ser recortado
                            crop: false,
                            overflow: "allow",

                            connectorWidth: 1,
                            connectorPadding: 6,
                            connectorColor: "#9ca3af",
                            softConnector: true,

                            style: {
                                color: "#374151",
                                fontSize: "11px",
                                fontWeight: "600",
                                textOutline: "none",
                            },

                            formatter: function () {
                                const p = this.point as any;

                                // ✅ SEM filtros que retornem "" (para não faltar label)
                                // como você já limitou pra 7 letras, só retorna o nome
                                return String(p.name || "");
                            },
                        },

                        // 2) INTERNO: % (igual ao exemplo)
                        {
                            enabled: true,
                            distance: -40,
                            format: "{point.percentage:.1f}%",
                            style: {
                                fontSize: "12px",
                                textOutline: "none",
                                opacity: 0.75,
                            },
                            filter: {
                                operator: ">",
                                property: "percentage",
                                value: 10, // mostra % dentro só quando >10%
                            },
                        },
                    ] as any,
                },
            },

            series: [
                {
                    type: "pie",
                    name: title,
                    colorByPoint: true,
                    data: seriesData.map((p) => ({
                        name: p.name,
                        y: p.y,
                        color: p.color,
                    })),
                },
            ],
        };
    }, [title, seriesData, widget.unit]);

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

    const hasData = seriesData.length > 0;

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4 h-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[rgb(var(--color-text-rgb))] uppercase tracking-wider">
                    {title}
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        {availablePeriods.map((p) => (
                            <Toggle
                                key={p.key}
                                variant="outline"
                                pressed={period === p.key}
                                onPressedChange={(pressed) => pressed && setPeriod(p.key)}
                                className="h-9 px-3 text-xs data-[state=on]:bg-[rgb(var(--color-secondary-rgb))] data-[state=on]:text-[rgb(var(--on-secondary-rgb))] data-[state=on]:border-[rgb(var(--color-secondary-rgb))]"
                            >
                                {p.label}
                            </Toggle>
                        ))}
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
