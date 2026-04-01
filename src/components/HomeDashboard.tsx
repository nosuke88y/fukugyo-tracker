import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SideRecord {
  id: string; date: string; type: 'income' | 'expense'; category: string; site: string; amount: number; memo: string;
}
interface StockRecord {
  id: string; date: string; pnl: number; memo: string;
}

const fmt = (n: number) => n.toLocaleString('ja-JP');
const sign = (n: number) => n > 0 ? '+' : n < 0 ? '' : '±';
const colorClass = (n: number) => n > 0 ? 'text-[#00d4a0]' : n < 0 ? 'text-[#ff4d6d]' : 'text-[#e4e6eb]';

export default function HomeDashboard() {
  const [sideRecords, setSideRecords] = useState<SideRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [tab, setTab] = useState<'month' | 'total'>('total');
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [chartMode, setChartMode] = useState<'monthly' | 'daily'>('monthly');
  const [dailyYear, setDailyYear] = useState(new Date().getFullYear());
  const [dailyMonth, setDailyMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    setSideRecords(JSON.parse(localStorage.getItem('fukugyo_side_v1') || '[]'));
    setStockRecords(JSON.parse(localStorage.getItem('fukugyo_stock_v1') || '[]'));
  }, []);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 今月
  const monthSide = sideRecords.filter(r => r.date.startsWith(thisMonth));
  const mIncome = monthSide.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const mExpense = monthSide.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const mSideProfit = mIncome - mExpense;
  const mStockPnl = stockRecords.filter(r => r.date.startsWith(thisMonth)).reduce((s, r) => s + r.pnl, 0);
  const mTotal = mSideProfit + mStockPnl;

  // 通算
  const tIncome = sideRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const tExpense = sideRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const tSideProfit = tIncome - tExpense;
  const tStockPnl = stockRecords.reduce((s, r) => s + r.pnl, 0);
  const tTotal = tSideProfit + tStockPnl;

  // 表示切替
  const isMonth = tab === 'month';
  const dispTotal = isMonth ? mTotal : tTotal;
  const dispSide = isMonth ? mSideProfit : tSideProfit;
  const dispIncome = isMonth ? mIncome : tIncome;
  const dispExpense = isMonth ? mExpense : tExpense;
  const dispStock = isMonth ? mStockPnl : tStockPnl;
  const dispLabel = isMonth ? `${thisMonth.replace('-', '年')}月` : '通算';

  // 月別グラフデータ
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = `${chartYear}-${String(i + 1).padStart(2, '0')}`;
      const ms = sideRecords.filter(r => r.date.startsWith(m));
      const side = ms.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
                 - ms.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
      const stock = stockRecords.filter(r => r.date.startsWith(m)).reduce((s, r) => s + r.pnl, 0);
      return { month: `${i + 1}月`, side, stock };
    });
  }, [sideRecords, stockRecords, chartYear]);

  // 日次グラフデータ
  const dailyData = useMemo(() => {
    const prefix = `${dailyYear}-${String(dailyMonth).padStart(2, '0')}`;
    const daysInMonth = new Date(dailyYear, dailyMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${prefix}-${String(day).padStart(2, '0')}`;
      const ds = sideRecords.filter(r => r.date === dateStr);
      const side = ds.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
                 - ds.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
      const stock = stockRecords.filter(r => r.date === dateStr).reduce((s, r) => s + r.pnl, 0);
      // データがない日はnullにして非表示
      const hasSide = ds.length > 0;
      const hasStock = stockRecords.some(r => r.date === dateStr);
      return {
        day: `${day}日`,
        side: hasSide ? side : null,
        stock: hasStock ? stock : null,
      };
    });
  }, [sideRecords, stockRecords, dailyYear, dailyMonth]);

  const moveDailyMonth = (delta: number) => {
    let m = dailyMonth + delta;
    let y = dailyYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setDailyMonth(m);
    setDailyYear(y);
  };

  // 直近5件
  const allRecords = [
    ...sideRecords.map(r => ({ ...r, _kind: 'side' as const })),
    ...stockRecords.map(r => ({ ...r, _kind: 'stock' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ダッシュボード</h1>

      {/* タブ切替 */}
      <div className="flex gap-1 mb-4 bg-[#161a22] rounded-lg p-1">
        <button onClick={() => setTab('month')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${isMonth ? 'bg-[#00d4a0] text-[#0d0f14]' : 'text-[#8b8fa3]'}`}>今月</button>
        <button onClick={() => setTab('total')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${!isMonth ? 'bg-[#00d4a0] text-[#0d0f14]' : 'text-[#8b8fa3]'}`}>通算</button>
      </div>

      {/* 合計サマリー */}
      <div className="bg-[#161a22] border border-[#2a2f3e] rounded-2xl p-5 mb-4">
        <p className="text-xs text-[#8b8fa3] mb-1">{dispLabel} 合計損益</p>
        <p className={`text-4xl font-mono font-bold tracking-tight ${colorClass(dispTotal)}`}>
          {sign(dispTotal)}{fmt(dispTotal)}<span className="text-2xl ml-0.5">円</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-xs text-[#8b8fa3] mb-1">副業損益</p>
          <p className={`text-2xl font-mono font-bold ${colorClass(dispSide)}`}>
            {sign(dispSide)}{fmt(dispSide)}<span className="text-base ml-0.5">円</span>
          </p>
          <div className="mt-2 text-xs text-[#8b8fa3] space-y-0.5">
            <p>収入: <span className="text-[#00d4a0] font-mono">+{fmt(dispIncome)}</span></p>
            <p>経費: <span className="text-[#ff4d6d] font-mono">-{fmt(dispExpense)}</span></p>
          </div>
        </div>
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-xs text-[#8b8fa3] mb-1">株式損益</p>
          <p className={`text-2xl font-mono font-bold ${colorClass(dispStock)}`}>
            {sign(dispStock)}{fmt(dispStock)}<span className="text-base ml-0.5">円</span>
          </p>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4 mb-6">
        {/* 月別 / 日次 タブ */}
        <div className="flex gap-1 mb-3 bg-[#0d0f14] rounded-lg p-1">
          <button onClick={() => setChartMode('monthly')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${chartMode === 'monthly' ? 'bg-[#2a2f3e] text-[#e4e6eb]' : 'text-[#8b8fa3]'}`}>月別</button>
          <button onClick={() => setChartMode('daily')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${chartMode === 'daily' ? 'bg-[#2a2f3e] text-[#e4e6eb]' : 'text-[#8b8fa3]'}`}>日次</button>
        </div>

        {chartMode === 'monthly' ? (
          <>
            {/* 月別グラフ */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setChartYear(y => y - 1)} className="text-[#8b8fa3] hover:text-[#e4e6eb] text-sm px-2">◀</button>
              <p className="text-sm font-bold font-mono">{chartYear}年</p>
              <button onClick={() => setChartYear(y => y + 1)} className="text-[#8b8fa3] hover:text-[#e4e6eb] text-sm px-2">▶</button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8b8fa3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8b8fa3' }} axisLine={false} tickLine={false} tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2130', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#8b8fa3' }}
                  formatter={(value: number, name: string) => [
                    `${value >= 0 ? '+' : ''}${fmt(value)}円`,
                    name === 'side' ? '副業' : '株式',
                  ]}
                />
                <Bar dataKey="side" name="副業" radius={[3, 3, 0, 0]} maxBarSize={14}>
                  {chartData.map((d, i) => <Cell key={`side-${i}`} fill={d.side >= 0 ? '#00d4a0' : '#ff4d6d'} />)}
                </Bar>
                <Bar dataKey="stock" name="株式" radius={[3, 3, 0, 0]} maxBarSize={14}>
                  {chartData.map((d, i) => <Cell key={`stock-${i}`} fill={d.stock >= 0 ? '#4d9fff' : '#ff4d6d'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <>
            {/* 日次推移グラフ */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => moveDailyMonth(-1)} className="text-[#8b8fa3] hover:text-[#e4e6eb] text-sm px-2">◀</button>
              <p className="text-sm font-bold font-mono">{dailyYear}年{dailyMonth}月</p>
              <button onClick={() => moveDailyMonth(1)} className="text-[#8b8fa3] hover:text-[#e4e6eb] text-sm px-2">▶</button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#8b8fa3' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#8b8fa3' }} axisLine={false} tickLine={false} tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2130', border: '1px solid #2a2f3e', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#8b8fa3' }}
                  formatter={(value: number, name: string) => [
                    `${value >= 0 ? '+' : ''}${fmt(value)}円`,
                    name === 'side' ? '副業' : '株式',
                  ]}
                />
                <Line type="monotone" dataKey="side" name="副業" stroke="#00d4a0" strokeWidth={2} dot={{ r: 3, fill: '#00d4a0' }} connectNulls={false} />
                <Line type="monotone" dataKey="stock" name="株式" stroke="#4d9fff" strokeWidth={2} dot={{ r: 3, fill: '#4d9fff' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {/* 凡例 */}
        <div className="flex justify-center gap-4 mt-2 text-xs text-[#8b8fa3]">
          <span><span className="inline-block w-2 h-2 rounded-sm bg-[#00d4a0] mr-1" />副業</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-[#4d9fff] mr-1" />株式</span>
        </div>
      </div>

      {/* 直近の記録 */}
      <h2 className="text-sm font-bold text-[#8b8fa3] mb-3">直近の記録</h2>
      {allRecords.length === 0 ? (
        <p className="text-center text-[#8b8fa3] py-10 text-sm">まだ記録がありません</p>
      ) : (
        <div className="space-y-2">
          {allRecords.map((r) => {
            if (r._kind === 'side') {
              return (
                <div key={r.id} className="bg-[#161a22] border border-[#2a2f3e] rounded-lg px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm">{r.category}{r.site ? ` / ${r.site}` : ''}</p>
                    <p className="text-xs text-[#8b8fa3]">{r.date}</p>
                  </div>
                  <p className={`font-mono font-bold ${r.type === 'income' ? 'text-[#00d4a0]' : 'text-[#ff4d6d]'}`}>
                    {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                  </p>
                </div>
              );
            } else {
              return (
                <div key={r.id} className="bg-[#161a22] border border-[#2a2f3e] rounded-lg px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#4d9fff]">株式{r.memo ? ` · ${r.memo}` : ''}</p>
                    <p className="text-xs text-[#8b8fa3]">{r.date}</p>
                  </div>
                  <p className={`font-mono font-bold ${colorClass(r.pnl)}`}>
                    {r.pnl >= 0 ? '+' : ''}{fmt(r.pnl)}
                  </p>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
