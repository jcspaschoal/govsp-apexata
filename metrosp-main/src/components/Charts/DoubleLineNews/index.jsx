/* eslint-disable no-unsafe-optional-chaining */
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useState } from "react";

const DoubleLineNews = ({ data, title, analise }) => {
  let lastDay = {
    date: new Date().toISOString().split("T")[0],
    isLastDay: true,
  };

  const dataAtual = new Date(analise?.result.results[0]?.data);
  const [
    alegria,
    antecipacao,
    confianca,
    desgosto,
    medo,
    raiva,
    surpresa,
    tristeza,
    polaridade,
  ] = analise?.result?.results?.reduce(
    (acc, item, index, array) => {
      acc[0].push(item.daily.sentimentos.alegria);
      acc[1].push(item.daily.sentimentos.antecipacao);
      acc[2].push(item.daily.sentimentos.confianca);
      acc[3].push(item.daily.sentimentos.desgosto);
      acc[4].push(item.daily.sentimentos.medo);
      acc[5].push(item.daily.sentimentos.raiva);
      acc[6].push(item.daily.sentimentos.surpresa);
      acc[7].push(item.daily.sentimentos.tristeza);
      acc[8].push(item.daily.poolaridade);

      if (index === array.length - 1 && item?.data !== lastDay.date) {
        lastDay = { isLastDay: false };
        acc[0].push(item.daily.sentimentos.alegria);
        acc[1].push(item.daily.sentimentos.antecipacao);
        acc[2].push(item.daily.sentimentos.confianca);
        acc[3].push(item.daily.sentimentos.desgosto);
        acc[4].push(item.daily.sentimentos.medo);
        acc[5].push(item.daily.sentimentos.raiva);
        acc[6].push(item.daily.sentimentos.surpresa);
        acc[7].push(item.daily.sentimentos.tristeza);
        acc[8].push(item.daily.poolaridade);
      } else if (
        index === array.length - 1 &&
        item?.data == lastDay.date &&
        item.daily.poolaridade == 0
      ) {
        acc[8][array.length - 1] = acc[8][array.length - 2];
      } else if (
        index === array.length - 1 &&
        item?.data == lastDay.date &&
        item.daily.sentimentos.alegria == 0 &&
        item.daily.sentimentos.antecipacao == 0 &&
        item.daily.sentimentos.confianca == 0 &&
        item.daily.sentimentos.desgosto == 0 &&
        item.daily.sentimentos.medo == 0 &&
        item.daily.sentimentos.raiva == 0 &&
        item.daily.sentimentos.surpresa == 0 &&
        item.daily.sentimentos.tristeza == 0
      ) {
        acc[0][array.length - 1] = acc[0][array.length - 2];
        acc[1][array.length - 1] = acc[1][array.length - 2];
        acc[2][array.length - 1] = acc[2][array.length - 2];
        acc[3][array.length - 1] = acc[3][array.length - 2];
        acc[4][array.length - 1] = acc[4][array.length - 2];
        acc[5][array.length - 1] = acc[5][array.length - 2];
        acc[6][array.length - 1] = acc[6][array.length - 2];
        acc[7][array.length - 1] = acc[7][array.length - 2];
      }
      return acc;
    },
    [[], [], [], [], [], [], [], [], []]
  );
  const options1 = {
    title: {
      text: `${title} polaridade de Sentimentos`,
    },

    subtitle: {
      text: `${title} últimos ${
        lastDay.isLastDay
          ? analise?.result?.results?.length
          : analise?.result?.results?.length + 1
      } dias desde a última atualização`,
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: " ",
      },
      plotLines: [
        {
          color: "black",
          value: "50", // Insert your average here
          width: "3",
          dashStyle: "Dash",
          zIndex: 10, // To not get stuck below the regular plot lines
        },
      ],
      allowDecimals: false,
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
        label: {
          connectorAllowed: true,
        },

        pointStart: Date.UTC(
          dataAtual.getUTCFullYear(),
          dataAtual.getUTCMonth(),
          dataAtual.getUTCDate()
        ),
        pointInterval: 24 * 3600 * 1000, // one day
      },
    },
    series: [
      {
        type: "spline",
        showInLegend: false,
        name: "Polaridade",
        data: polaridade,
        zoneAxis: "y",
        zones: [
          {
            value: 50,
            color: "#F44336",
          },
          {
            color: "#3180F8",
          },
        ],
      },
    ],
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y:.2f}</b><br/>",
    },
  };

  const options2 = {
    title: {
      text: `${title} últimos ${
        lastDay.isLastDay
          ? analise?.result?.results?.length
          : analise?.result?.results?.length + 1
      } dias desde a última atualização`,
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: "Sentimentos",
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    plotOptions: {
      series: {
        type: "spline",
        marker: {
          enabled: false,
        },
        label: {
          connectorAllowed: false,
        },
        pointStart: Date.UTC(
          dataAtual.getUTCFullYear(),
          dataAtual.getUTCMonth(),
          dataAtual.getUTCDate()
        ),
        pointInterval: 24 * 3600 * 1000, // one day
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
    },
    series: [
      {
        type: "spline",
        name: "Alegria",
        data: alegria,
      },
      {
        type: "spline",
        name: "Antecipação",
        data: antecipacao,
      },
      {
        type: "spline",
        name: "Confiança",
        data: confianca,
      },
      {
        type: "spline",
        name: "Desgosto",
        data: desgosto,
      },
      {
        type: "spline",
        name: "Medo",
        data: medo,
      },
      {
        type: "spline",
        name: "Raiva",
        data: raiva,
      },
      {
        type: "spline",
        name: "Surpresa",
        data: surpresa,
      },
      {
        type: "spline",
        name: "Tristeza",
        data: tristeza,
      },
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y:.2f}</b><br/>",
    },
  };

  return (
    <>
      {analise ? (
        <div className="grid grid-rows-2 gap-4">
          <div>
            <HighchartsReact highcharts={Highcharts} options={options1} />
          </div>
          <div>
            <HighchartsReact highcharts={Highcharts} options={options2} />
          </div>
        </div>
      ) : (
        <svg
          className="animate-spin h-5 w-5 mr-3 ..."
          viewBox="0 0 24 24"
        ></svg>
      )}
    </>
  );
};

export default DoubleLineNews;
