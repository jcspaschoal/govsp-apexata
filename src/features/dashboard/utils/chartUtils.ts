/**
 * Utilitários para configuração e transformação de dados do Highcharts.
 */
import Highcharts from 'highcharts';

const monthsShortPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ag', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Converte uma string YYYY-MM-DD para timestamp UTC em milissegundos.
 * Evita problemas de timezone.
 */
export function parseYYYYMMDDToUtcMs(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Formata um timestamp para o padrão pt-BR curto: "Mês Dia" (ex: "Ag 11").
 */
export function formatPtMonthDay(ts: number): string {
  const d = new Date(ts);
  // Usamos getUTC para consistência com o parse
  return `${monthsShortPT[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * Lógica para isolar/restaurar séries ao clicar na legenda.
 * 1º clique em uma série -> oculta todas as outras.
 * 2º clique (com apenas uma visível) -> restaura todas.
 */
export function isolateOnLegendClick(chart: Highcharts.Chart, clickedSeries: Highcharts.Series): boolean {
  const allSeries = chart.series;
  const visibleSeries = allSeries.filter(s => s.visible);
  
  const isOnlyOneVisible = visibleSeries.length === 1 && visibleSeries[0] === clickedSeries;

  if (isOnlyOneVisible) {
    // Se só ela está visível, mostra todas
    allSeries.forEach(s => s.show());
  } else {
    // Caso contrário, isola a clicada
    allSeries.forEach(s => (s === clickedSeries ? s.show() : s.hide()));
  }
  
  // Retorna false para impedir o comportamento padrão do Highcharts
  return false;
}
