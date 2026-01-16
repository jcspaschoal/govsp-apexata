/* eslint-disable */
// @ts-nocheck


// src/lib/highchartsSetup.ts
import { setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';

// carrega módulos como side-effect (jeito recomendado nos docs)
import 'highcharts/modules/exporting';
// (opcional) se quiser exportar PDF/PNG totalmente client-side:
// import 'highcharts/modules/offline-exporting';

setHighcharts(Highcharts);

export default Highcharts;
