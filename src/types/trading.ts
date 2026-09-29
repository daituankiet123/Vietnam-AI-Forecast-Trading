export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  value?: number;
}

export interface StockMetadata {
  symbol: string;
  name: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
  industry: string;
  listingDate: string;
  delistingDate?: string;
  dataPoints: StockDataPoint[];
}

export interface CorporateAction {
  id: string;
  symbol: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
  announcementDate: string;
  exDate: string;
  actionType: 'SPLIT' | 'CASH_DIVIDEND' | 'STOCK_DIVIDEND' | 'RIGHTS';
  adjustmentFactor: number;
  cashAmount?: number;
  source: string;
  description: string;
}

export interface TradingCalendarDay {
  date: string;
  dayOfWeek: string;
  isTradingDay: boolean;
  reason?: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
}

export interface CalculatedFeature {
  name: string;
  category: 'return' | 'trend' | 'volatility' | 'volume' | 'market' | 'relative';
  description: string;
  formula: string;
  sampleValue: number;
  importanceRank: number;
}

export interface WalkForwardFold {
  year: number;
  trainRange: string;
  valRange: string;
  purgeDays: number;
  testRange: string;
  trainSamples: number;
  testSamples: number;
  rocAuc: number;
  accuracy: number;
  brierScore: number;
  logLoss: number;
  rmse: number;
  mae: number;
  r2: number;
  strategyReturn: number;
  benchmarkReturn: number;
  alpha: number;
  sharpe: number;
  maxDrawdown: number;
  turnoverPct: number;
}

export interface BacktestPosition {
  symbol: string;
  weight: number;
  entryPrice: number;
  currentPrice: number;
  entryDate: string;
  exitDate: string;
  pUp: number;
  expectedReturn: number;
  actualReturn: number;
  pnl: number;
}

export interface EquityCurvePoint {
  date: string;
  strategyEquity: number;
  benchmarkEquity: number;
  drawdown: number;
  turnover: number;
}

export interface BacktestConfig {
  topK: number;
  minProbability: number;
  commissionBps: number;
  slippageBps: number;
  maxPositionWeight: number;
  initialCapital: number;
  horizonSessions: number;
}

export interface SourceFile {
  path: string;
  title: string;
  category: 'data' | 'features' | 'labels' | 'models' | 'training' | 'backtest' | 'cli' | 'config' | 'test';
  language: string;
  code: string;
}

export interface MultiHorizonSignal {
  symbol: string;
  name: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
  industry: string;
  currentPrice: number;
  // Multi-horizon P(up)
  pUp1d: number;
  pUp5d: number;
  pUp10d: number;
  pUp20d: number;
  // Multi-horizon Expected Return
  expReturn1d: number;
  expReturn5d: number;
  expReturn10d: number;
  expReturn20d: number;
  // Factor scores
  regimeConfidence: number;
  relativeStrengthRank: number;
  volatilityNormalizedWeight: number;
  signalRecommendation: 'STRONG_BUY' | 'ACCUMULATE' | 'HOLD' | 'REDUCE';
  reasoning: string;
}

export interface MarketRegime2026 {
  asOfDate: string;
  vnindexLevel: number;
  vnindexSma50: number;
  vnindexSma200: number;
  regimeType: 'BULL_ACCUMULATION' | 'BREAKOUT_EXPANSION' | 'RANGE_BOUND' | 'DEFENSIVE';
  regimeDescription: string;
  foreignFlowState: string;
  marketBreadthPct: number;
  liquidityAvgVndTrillion: number;
  krxPreFundingStatus: string;
  targetHorizonDays: number;
}

export interface ScenarioProjection {
  id: string;
  title: string;
  probabilityPct: number;
  vnindexTarget: number;
  projectedReturnPct: number;
  recommendedEquityPct: number;
  recommendedCashPct: number;
  topSectors: string[];
  keyDrivers: string[];
}

export type ForecastYear = '2026' | '2027' | '2028' | '2029' | '2030';

export interface YearlyForecastProfile {
  year: ForecastYear;
  title: string;
  cycleTheme: string;
  macroContext: string;
  vnindexTargetRange: string;
  expectedMarketReturn: number;
  projectedEpsGrowth: number;
  marketCapToGdpPct: number;
  ftseMsciMilestone: string;
  keyCatalysts: string[];
  signals: MultiHorizonSignal[];
  scenarios: ScenarioProjection[];
}

export interface ModelOptimizationMetrics {
  baselineAccuracy: number;
  optimizedAccuracy: number;
  baselineRocAuc: number;
  optimizedRocAuc: number;
  baselineBrier: number;
  optimizedBrier: number;
  highConvictionAccuracy: number;
  highConvictionWinRate: number;
  falsePositiveReductionPct: number;
  calibratedExpectedValue: number;
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  source: 'HOSE_CBTT' | 'CAFEF' | 'VIETSTOCK' | 'SBV_GOV' | 'REUTERS' | 'BLOOMBERG';
  publishedAt: string;
  relatedSymbols: string[];
  category: 'REGULATORY' | 'EARNINGS' | 'MACRO' | 'EXPANSION' | 'FOREIGN_FLOW';
  sentimentScore: number; // -1.0 to +1.0
  impactMagnitude: number; // 0.0 to 1.0
  summary: string;
  isRealtimeUpdate?: boolean;
}

export interface HybridPrediction {
  symbol: string;
  name: string;
  currentPrice: number;
  quantitativePUp: number; // Tri-Ensemble ML P(up)
  newsSentimentScore: number; // News NLP Sentiment
  newsImpactScore: number; // News Impact
  combinedHybridPUp: number; // Blended High-Probability Signal
  expectedReturn20d: number;
  confidenceLevel: number;
  predictedAccuracy: number; // > 75%
  signalRecommendation: 'STRONG_BUY_75' | 'ACCUMULATE' | 'HOLD' | 'AVOID';
  dualAgreementStatus: 'PERFECT_AGREEMENT' | 'QUANT_DRIVEN' | 'NEWS_DRIVEN' | 'CONFLICT';
  keyNewsEvidence: string;
  quantitativeFactors: string;
}

export interface HybridEnsembleConfig {
  quantWeight: number; // e.g. 0.65
  newsWeight: number; // e.g. 0.35
  minDualAgreementThreshold: number; // e.g. 0.65
  filterConflictSignals: boolean;
  targetAccuracy: number; // 0.75 (75%)
}

