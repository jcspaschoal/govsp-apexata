import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const BarChart = ({ data, title }) => {
  const options = {
    chart: {
      zoomType: "xy",
    },
    title: {
      text: `Polaridade dos(as) ${title}`,
      align: "left",
    },
    subtitle: {
      text: "Origem: -",
      align: "left",
    },
    xAxis: [
      {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        crosshair: true,
      },
    ],
    yAxis: [
      {
        // Primary yAxis
        labels: {
          format: "{value} %",
          style: {
            color: "#000000",
          },
        },
      },
      {
        // Secondary yAxis
        title: {
          text: "Polaridade",
          style: {
            color: "#000000",
          },
        },
        opposite: false,
      },
    ],
    tooltip: {
      shared: true,
    },
    legend: {
      align: "left",
      x: 80,
      verticalAlign: "top",
      y: 60,
      floating: true,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    series: [
      {
        name: "Positivo",
        type: "column",
        yAxis: 1,
        data: [
          27.6, 28.8, 21.7, 34.1, 29.0, 28.4, 45.6, 51.7, 39.0, 60.0, 28.6,
          32.1,
        ],
        tooltip: {
          valueSuffix: " %",
        },
      },
      {
        name: "Negativo",
        type: "column",
        yAxis: 1,
        data: [
          27.6, 28.8, 21.7, 34.1, 29.0, 28.4, 45.6, 51.7, 39.0, 60.0, 28.6,
          32.1,
        ],
        tooltip: {
          valueSuffix: " %",
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default BarChart;
