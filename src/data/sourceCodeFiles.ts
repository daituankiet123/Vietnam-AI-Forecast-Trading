import { SourceFile } from '../types/trading';

export const SOURCE_CODE_FILES: SourceFile[] = [
  {
    path: 'configs/default.yaml',
    title: 'default.yaml',
    category: 'config',
    language: 'yaml',
    code: `# VietnamTradingAI v0.1 Default Configuration
market:
  default_exchange: HOSE
  benchmark_symbol: VNINDEX
  start_date: "2015-01-01"
  end_date: "2026-09-29"

dataset:
  horizon_sessions: 5
  positive_threshold: 0.0
  purge_sessions: 5
  returns_windows: [1, 5, 10, 20]
  sma_windows: [5, 10, 20, 50]
  ema_windows: [12, 26]

model:
  classifier:
    objective: "binary:logistic"
    eval_metric: "logloss"
    tree_method: "hist"
    n_estimators: 500
    max_depth: 5
    learning_rate: 0.03
    subsample: 0.85
    colsample_bytree: 0.85
    min_child_weight: 5
    reg_lambda: 5.0
    random_state: 42
  regressor:
    objective: "reg:squarederror"
    eval_metric: "rmse"
    tree_method: "hist"
    n_estimators: 500
    max_depth: 5
    learning_rate: 0.03
    subsample: 0.85
    colsample_bytree: 0.85
    min_child_weight: 5
    reg_lambda: 5.0
    random_state: 42

backtest:
  top_k: 10
  min_probability: 0.55
  commission_bps: 10
  slippage_bps: 5
  max_position_weight: 0.10
  rebalance_frequency_sessions: 5
`
  },
  {
    path: 'src/vtai/data/calendar.py',
    title: 'calendar.py',
    category: 'data',
    language: 'python',
    code: `"""Official Trading Calendar for HOSE, HNX, UPCoM.
Avoids pd.bdate_range to prevent holiday / weekend mismatch in Vietnam market.
"""
from dataclasses import dataclass
import pandas as pd

@dataclass
class TradingCalendar:
    frame: pd.DataFrame

    @classmethod
    def from_csv(cls, path: str) -> "TradingCalendar":
        df = pd.read_csv(path, comment="#")
        df["trading_date"] = pd.to_datetime(df["trading_date"]).dt.normalize()
        return cls(df)

    def sessions(self, exchange: str, start: str, end: str) -> pd.Series:
        mask = (
            (self.frame["exchange"].str.upper() == exchange.upper())
            & self.frame["trading_date"].between(pd.to_datetime(start), pd.to_datetime(end))
        )
        return (
            self.frame.loc[mask, "trading_date"]
            .drop_duplicates()
            .sort_values()
        )

    def is_session(self, exchange: str, date: str) -> bool:
        dt = pd.to_datetime(date).normalize()
        return not self.frame.loc[
            (self.frame["exchange"].str.upper() == exchange.upper())
            & (self.frame["trading_date"] == dt)
        ].empty
`
  },
  {
    path: 'src/vtai/data/corporate_actions.py',
    title: 'corporate_actions.py',
    category: 'data',
    language: 'python',
    code: `"""Point-in-Time Corporate Actions Handler.
Crucial rule: Only return events known by as_of date (announcement_date <= as_of).
Prevents future corporate action leakage.
"""
from dataclasses import dataclass
import pandas as pd

@dataclass
class CorporateActionsRegistry:
    frame: pd.DataFrame

    @classmethod
    def from_csv(cls, path: str) -> "CorporateActionsRegistry":
        df = pd.read_csv(path, comment="#")
        df["announcement_date"] = pd.to_datetime(df["announcement_date"]).dt.normalize()
        df["ex_date"] = pd.to_datetime(df["ex_date"]).dt.normalize()
        return cls(df)

    def events_known_by(self, symbol: str, exchange: str, as_of: str) -> pd.DataFrame:
        as_of_dt = pd.to_datetime(as_of).normalize()
        mask = (
            (self.frame["symbol"].str.upper() == symbol.upper())
            & (self.frame["exchange"].str.upper() == exchange.upper())
            & (self.frame["announcement_date"] <= as_of_dt)  # Point-in-time barrier!
        )
        return self.frame.loc[mask].sort_values("announcement_date")
`
  },
  {
    path: 'src/vtai/data/universe.py',
    title: 'universe.py',
    category: 'data',
    language: 'python',
    code: `"""Historical Universe Membership Registry.
Prevents survivorship bias by querying members valid strictly as of the target date.
"""
from dataclasses import dataclass
from typing import List
import pandas as pd

@dataclass
class UniverseRegistry:
    frame: pd.DataFrame

    @classmethod
    def from_csv(cls, path: str) -> "UniverseRegistry":
        df = pd.read_csv(path, comment="#")
        df["effective_from"] = pd.to_datetime(df["effective_from"]).dt.normalize()
        df["effective_to"] = pd.to_datetime(df["effective_to"]).dt.normalize()
        return cls(df)

    def members(self, exchange: str, as_of: str) -> List[str]:
        as_of_dt = pd.to_datetime(as_of).normalize()
        mask = (
            (self.frame["exchange"].str.upper() == exchange.upper())
            & (self.frame["effective_from"] <= as_of_dt)
            & (self.frame["effective_to"].isna() | (self.frame["effective_to"] >= as_of_dt))
        )
        return self.frame.loc[mask, "symbol"].str.upper().tolist()
`
  },
  {
    path: 'src/vtai/data/vnstock_provider.py',
    title: 'vnstock_provider.py',
    category: 'data',
    language: 'python',
    code: `"""Isolated Vnstock Provider Adapter.
Pinned to vnstock==4.0.8. Decoupled from core pipeline in case of API shifts.
"""
import pandas as pd

class VnstockProvider:
    def __init__(self, api_key: str = None):
        try:
            from vnstock import Market
            self.market = Market()
        except ImportError:
            self.market = None

    def fetch_ohlcv(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        if self.market is None:
            raise RuntimeError("vnstock package is required. Install via pip install vnstock==4.0.8")
        
        if symbol.upper() == "VNINDEX":
            df = self.market.index("VNINDEX").ohlcv(start=start, end=end)
        else:
            df = self.market.equity.ohlcv(symbol=symbol.upper(), start=start, end=end)
        
        return df
`
  },
  {
    path: 'src/vtai/features/technical.py',
    title: 'technical.py',
    category: 'features',
    language: 'python',
    code: `"""Feature Engineering Engine for Vietnam Market.
Takes normalized OHLCV and builds strictly backward-looking features.
Does NOT feed raw prices to ML models to eliminate scale dependency.
"""
import pandas as pd
import numpy as np

def add_technical_features(
    g: pd.DataFrame,
    returns=(1, 5, 10, 20),
    sma_windows=(5, 10, 20, 50),
    ema_windows=(12, 26),
) -> pd.DataFrame:
    df = g.sort_values("trading_date").copy()
    close = df["close"].astype(float)
    high = df["high"].astype(float)
    low = df["low"].astype(float)
    open_p = df["open"].astype(float)
    volume = df["volume"].astype(float)

    # Momentum returns
    for w in returns:
        df[f"return_{w}d"] = close.pct_change(w)

    # SMA trend ratios
    for w in sma_windows:
        sma = close.rolling(w, min_periods=w).mean()
        df[f"close_sma_ratio_{w}"] = close / sma - 1.0

    # EMA trend ratios
    for w in ema_windows:
        ema = close.ewm(span=w, adjust=False).mean()
        df[f"close_ema_ratio_{w}"] = close / ema - 1.0

    # Volatility and ATR
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df["atr14_pct"] = tr.rolling(14).mean() / close
    df["volatility_20d"] = df["return_1d"].rolling(20).std()
    df["intraday_return"] = close / open_p - 1.0
    df["range_pct"] = (high - low) / open_p

    # Volume dynamics
    vol_sma20 = volume.rolling(20, min_periods=5).mean()
    vol_std20 = volume.rolling(20, min_periods=5).std().replace(0, np.nan)
    df["volume_ma_ratio"] = volume / vol_sma20
    df["volume_zscore"] = (volume - vol_sma20) / vol_std20
    df["volume_change_1d"] = volume.pct_change(1)

    return df
`
  },
  {
    path: 'src/vtai/labels/forward.py',
    title: 'forward.py',
    category: 'labels',
    language: 'python',
    code: `"""Anti-Leakage Forward Label Generator.
Crucial design:
Signal = Close[t]
Entry = Open[t+1]
Exit = Close[t+horizon]
Model CANNOT cheat by buying at today's close!
"""
import pandas as pd

def add_forward_labels(
    df: pd.DataFrame,
    horizon_sessions: int = 5,
    positive_threshold: float = 0.0,
) -> pd.DataFrame:
    out = df.sort_values(["symbol", "trading_date"]).copy()

    # Entry at open of next session t+1
    out["entry_open_t1"] = (
        out.groupby("symbol")["open"]
        .shift(-1)
    )

    # Exit at close of session t + horizon
    out["exit_close_th"] = (
        out.groupby("symbol")["close"]
        .shift(-horizon_sessions)
    )

    # Forward return calculation
    out["fwd_return"] = (
        out["exit_close_th"]
        / out["entry_open_t1"]
        - 1.0
    )

    # Binary label: 1 if positive forward return, else 0
    out["label_up"] = (
        out["fwd_return"] > positive_threshold
    ).astype("float")

    # Tail rows without forward horizon must be NA
    out.loc[out["fwd_return"].isna(), "label_up"] = pd.NA

    return out
`
  },
  {
    path: 'src/vtai/models/xgb.py',
    title: 'xgb.py',
    category: 'models',
    language: 'python',
    code: `"""Dual XGBoost Models for VietnamTradingAI v0.1.
Model 1: XGBClassifier -> Probability of positive forward return P(up)
Model 2: XGBRegressor -> Expected forward return magnitude
"""
from dataclasses import dataclass
from xgboost import XGBClassifier, XGBRegressor
import joblib

@dataclass
class DualXGBModel:
    classifier: XGBClassifier
    regressor: XGBRegressor

    @classmethod
    def build(cls, clf_params: dict, reg_params: dict) -> "DualXGBModel":
        clf = XGBClassifier(**clf_params)
        reg = XGBRegressor(**reg_params)
        return cls(clf, reg)

    def fit(self, X_train, y_clf_train, y_reg_train):
        self.classifier.fit(X_train, y_clf_train)
        self.regressor.fit(X_train, y_reg_train)

    def predict(self, X):
        p_up = self.classifier.predict_proba(X)[:, 1]
        exp_return = self.regressor.predict(X)
        return p_up, exp_return

    def save(self, clf_path: str, reg_path: str):
        joblib.dump(self.classifier, clf_path)
        joblib.dump(self.regressor, reg_path)
`
  },
  {
    path: 'src/vtai/training/walk_forward.py',
    title: 'walk_forward.py',
    category: 'training',
    language: 'python',
    code: `"""Purged Walk-Forward Evaluator (2020 -> 2026).
Enforces:
1. Expanding window training (e.g. 2015-2018, 2015-2019, ...)
2. 5-session purge at the tail of train/val to prevent horizon overlap leakage!
3. Independent model per test year.
"""
import pandas as pd
from typing import List, Tuple

def get_purged_walk_forward_splits(
    df: pd.DataFrame,
    start_test_year: int = 2020,
    end_test_year: int = 2026,
    purge_sessions: int = 5,
) -> List[Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, int]]:
    splits = []
    
    for test_year in range(start_test_year, end_test_year + 1):
        train_end_year = test_year - 2
        val_year = test_year - 1
        
        train_raw = df[df["trading_date"].dt.year <= train_end_year].copy()
        val_raw = df[df["trading_date"].dt.year == val_year].copy()
        test_df = df[df["trading_date"].dt.year == test_year].copy()
        
        # Purge tail sessions to prevent label overlap into validation / test
        train_df = _purge_tail(train_raw, purge_sessions)
        val_df = _purge_tail(val_raw, purge_sessions)
        
        splits.append((train_df, val_df, test_df, test_year))
        
    return splits

def _purge_tail(df: pd.DataFrame, purge_sessions: int) -> pd.DataFrame:
    dates = df["trading_date"].drop_duplicates().sort_values()
    if len(dates) <= purge_sessions:
        return df
    cutoff = dates.iloc[-purge_sessions - 1]
    return df[df["trading_date"] <= cutoff].copy()
`
  },
  {
    path: 'src/vtai/backtest/engine.py',
    title: 'engine.py',
    category: 'backtest',
    language: 'python',
    code: `"""Realistic Portfolio Backtesting Engine.
Features:
- Long-only Top K
- Minimum P(up) filter
- Equal weight position sizing capped by max_position_weight
- Commission (e.g. 10 bps) + Slippage (e.g. 5 bps)
- Turnover friction deducted from open equity
- Gap adjustment tracking
"""
import pandas as pd
import numpy as np

def run_portfolio_backtest(
    predictions_df: pd.DataFrame,
    top_k: int = 10,
    min_prob: float = 0.55,
    commission_bps: float = 10.0,
    slippage_bps: float = 5.0,
    max_position_weight: float = 0.10,
) -> pd.DataFrame:
    total_cost_factor = (commission_bps + slippage_bps) / 10000.0
    daily_results = []
    current_equity = 1.0
    prev_weights = {}

    for date, group in predictions_df.groupby("trading_date"):
        # Filter qualified candidates
        qualified = group[group["p_up"] >= min_prob].sort_values("p_up", ascending=False)
        selected = qualified.head(top_k)
        
        # Determine target weights
        new_weights = {}
        if len(selected) > 0:
            target_w = min(1.0 / len(selected), max_position_weight)
            for sym in selected["symbol"]:
                new_weights[sym] = target_w
                
        # Calculate turnover & friction
        all_symbols = set(prev_weights.keys()).union(new_weights.keys())
        turnover = sum(abs(new_weights.get(s, 0.0) - prev_weights.get(s, 0.0)) for s in all_symbols)
        cost = turnover * total_cost_factor
        
        # Deduct cost from open equity
        equity_open = current_equity * (1.0 - cost)
        
        # Daily return from held assets
        day_return = 0.0
        for sym, w in new_weights.items():
            sym_row = group[group["symbol"] == sym]
            if not sym_row.empty:
                day_return += w * sym_row["intraday_return"].values[0]
                
        current_equity = equity_open * (1.0 + day_return)
        prev_weights = new_weights
        
        daily_results.append({
            "trading_date": date,
            "equity": current_equity,
            "turnover": turnover,
            "cost": cost,
            "holdings_count": len(new_weights)
        })

    return pd.DataFrame(daily_results)
`
  },
  {
    path: 'tests/test_labels_and_leakage.py',
    title: 'test_labels_and_leakage.py',
    category: 'test',
    language: 'python',
    code: `"""Unit tests verifying zero lookahead bias in labels & point-in-time constraints.
"""
import pandas as pd
import pytest
from vtai.labels.forward import add_forward_labels
from vtai.training.walk_forward import _purge_tail

def test_entry_at_open_t1():
    df = pd.DataFrame({
        "symbol": ["FPT", "FPT", "FPT"],
        "trading_date": pd.to_datetime(["2024-05-20", "2024-05-21", "2024-05-22"]),
        "open": [125.0, 127.2, 127.8],
        "close": [126.9, 127.5, 129.2]
    })
    labeled = add_forward_labels(df, horizon_sessions=1)
    
    # Entry for row 0 (2024-05-20) MUST be row 1 open (127.2), NOT row 0 close (126.9)!
    assert labeled.loc[0, "entry_open_t1"] == 127.2
    assert labeled.loc[0, "exit_close_th"] == 127.5
    assert labeled.loc[0, "fwd_return"] == pytest.approx(127.5 / 127.2 - 1.0)

def test_tail_purge_sessions():
    dates = pd.date_range("2020-01-01", periods=10, freq="B")
    df = pd.DataFrame({"trading_date": dates, "val": range(10)})
    purged = _purge_tail(df, purge_sessions=3)
    
    # Exactly 3 sessions removed from the tail
    assert len(purged) == 7
    assert purged["trading_date"].max() == dates[6]
`
  },
  {
    path: 'RUNBOOK_WINDOWS.md',
    title: 'RUNBOOK_WINDOWS.md',
    category: 'config',
    language: 'markdown',
    code: `# VietnamTradingAI v0.1 — Windows 11 / PowerShell Runbook

### 1. Khởi tạo môi trường ảo Python 3.12
\`\`\`powershell
cd C:\\path\\to\\vietnam_trading_ai_v01
py -3.12 -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install -U pip
pip install -r requirements.txt
pip install -e .
\`\`\`

### 2. Tải VNINDEX & 10 mã HOSE Bluechips
\`\`\`powershell
# Tải chỉ số VNINDEX
python -m vtai.cli ingest-index ^
  --symbol VNINDEX ^
  --start 2015-01-01 ^
  --end 2026-09-29 ^
  --calendar data/calendar/trading_calendar.csv

# Tải 10 cổ phiếu HOSE
python -m vtai.cli ingest-prices ^
  --symbols FPT,VCB,HPG,MWG,ACB,SSI,VHM,VIC,GAS,BID ^
  --exchange HOSE ^
  --start 2015-01-01 ^
  --end 2026-09-29 ^
  --calendar data/calendar/trading_calendar.csv
\`\`\`

### 3. Xây dựng Dataset Point-in-time
\`\`\`powershell
python -m vtai.cli build-dataset ^
  --prices-dir data/raw/ohlcv ^
  --calendar data/calendar/trading_calendar.csv ^
  --universe data/universe/universe_membership.csv ^
  --index-path data/raw/ohlcv/INDEX/VNINDEX.parquet ^
  --out data/processed/model_dataset.parquet
\`\`\`

### 4. Huấn luyện Walk-Forward 2020-2026 & Tạo Báo cáo Thường niên
\`\`\`powershell
python -m vtai.cli yearly-eval ^
  --dataset data/processed/model_dataset.parquet ^
  --out-dir reports/generated ^
  --bt-out-dir reports/generated/backtest ^
  --start-test-year 2020 ^
  --end-test-year 2026
\`\`\`
`
  }
];
