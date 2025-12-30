/**
 * ==============================================================================================
 * WIDGET TYPES DEFINITIONS (TypeScript)
 * ==============================================================================================
 * Mapeamento fiel das estruturas Go definidas no backend (Go 1.25 standards).
 * Reflete os schemas de validação e regras de negócio de coleções.
 * ==============================================================================================
 */

export type Granularity = 'day' | 'week' | 'month' | 'year';

/**
 * Base para todos os widgets.
 */
export interface BaseWidget {
  type: string;
}

/**
 * Widget: Share of Voice (Donut Chart)
 */
export interface ShareOfVoiceDonut extends BaseWidget {
  type: 'share_of_voice_donut';
  unit: string;
  total: number;
  data: {
    category: string;
    value: number;
  }[];
}

/**
 * Widget: Time Series (Line Chart)
 */
export interface TimeSeriesLine extends BaseWidget {
  type: 'time_series_line';
  granularity: Granularity;
  unit: string;
  series: {
    name: string;
  }[];
  data: {
    timestamp: string; // Formato: YYYY-MM-DD
    series: string;
    value: number;
  }[];
}

/**
 * Widget: Ranking Bar (Horizontal)
 */
export interface RankingBarHorizontal extends BaseWidget {
  type: 'ranking_bar_horizontal';
  unit: string;
  data: {
    label: string;
    value: number;
    percent: number;
  }[];
}

/**
 * Widget: Grouped Column Bar
 */
export interface GroupedColumnBar extends BaseWidget {
  type: 'grouped_column_bar';
  granularity: Extract<Granularity, 'day' | 'week' | 'month'>;
  unit: string;
  categories: string[];
  periods: string[];
  values: number[][]; // Matriz [periodo][categoria]
}

/**
 * Widget: Combo Column Line (Dual Axis)
 */
export interface ComboColumnLineDualAxis extends BaseWidget {
  type: 'combo_column_line_dual_axis';
  unit_left: string;
  unit_right: string;
  bars: {
    series: string[];
  };
  line: {
    series: string;
  };
  bars_data: {
    period: string;
    series: string;
    value: number;
  }[];
  line_data: {
    period: string;
    value: number;
  }[];
}

/**
 * Widget: Sentiment Polarity Threshold Line
 */
export interface SentimentPolarityThreshold extends BaseWidget {
  type: 'sentiment_polarity_threshold_line';
  unit: string;
  threshold?: number;
  above_color?: string; // Hexadecimal
  below_color?: string; // Hexadecimal
  series: {
    name: string;
  }[];
  data: {
    timestamp: string; // Formato: YYYY-MM-DD
    series: string;
    value: number;
    total?: number;
  }[];
}

/**
 * Widget: Sentiment Emotions Time Series
 */
export interface SentimentEmotionsTimeSeries extends BaseWidget {
  type: 'sentiment_emotions_time_series';
  unit: string;
  series: {
    name: string;
    color?: string; // Hexadecimal
  }[];
  data: {
    timestamp: string; // Formato: YYYY-MM-DD
    series: string;
    value: number;
    total?: number;
  }[];
}

/**
 * União de todos os tipos de widgets disponíveis.
 */
export type Widget =
  | ShareOfVoiceDonut
  | TimeSeriesLine
  | RankingBarHorizontal
  | GroupedColumnBar
  | ComboColumnLineDualAxis
  | SentimentPolarityThreshold
  | SentimentEmotionsTimeSeries;

/**
 * Metadados obrigatórios quando o widget faz parte de uma coleção.
 */
export interface CollectionMetadata {
  order: number;
  sublabel: string;
}

/**
 * Representa um widget dentro de uma coleção.
 */
export type WidgetCollectionItem = Widget & CollectionMetadata;

/**
 * O resultado final de um Subject pode ser um widget isolado ou uma coleção.
 */
export type SubjectResult = Widget | WidgetCollectionItem[];
