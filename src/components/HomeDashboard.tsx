import { useState, useEffect } from 'react';

interface SideRecord {
  id: string; date: string; type: 'income' | 'expense'; category: string; site: string; amount: number; memo: string;
}
interface StockRecord {
  id: string; date: string; pnl: number; memo: string;
}

export default function HomeDashboard() {
  const [sideRecords, setSideRecords] = useState<SideRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);

  useEffect(() => {
    setSideRecords(JSON.parse(localStorage.getItem('fukugyo_side_v1') || '[]'));
    setStockRecords(JSON.parse(localStorage.getItem('fukugyo_stock_v1') || '[]'));
  }, []);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthSide = sideRecords.filter(r => r.date.startsWith(thisMonth));
  const income = monthSide.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = monthSide.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const sideProfit = income - expense;

  const monthStock = stockRecords.filter(r => r.date.startsWith(thisMonth));
  const stockPnl = monthStock.reduce((s, r) => s + r.pnl, 0);

  const totalProfit = sideProfit + stockPnl;

  const fmt = (n: number) => n.toLocaleString('ja-JP');
  const colorClass = (n: number) => n > 0 ? 'text-[#00d4a0]' : n < 0 ? 'text-[#ff4d6d]' : 'text-[#e4e6eb]';

  // 直近5件（副業+株式を日付降順でマージ）
  const allRecords = [
    ...sideRecords.map(r => ({ ...r, _kind: 'side' as const })),
    ...stockRecords.map(r => ({ ...r, _kind: 'stock' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">ダッシュボード</h1>

      <div className="bg-[#161a22] border border-[#2a2f3e] rounded-2xl p-5 mb-4">
        <p className="text-xs text-[#8b8fa3] mb-1">{thisMonth.replace('-', '年')}月 合計損益</p>
        <p className={`text-3xl font-mono font-bold ${colorClass(totalProfit)}`}>
          {totalProfit >= 0 ? '+' : ''}{fmt(totalProfit)}円
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-xs text-[#8b8fa3] mb-1">副業損益</p>
          <p className={`text-lg font-mono font-bold ${colorClass(sideProfit)}`}>
            {sideProfit >= 0 ? '+' : ''}{fmt(sideProfit)}円
          </p>
          <div className="mt-2 text-xs text-[#8b8fa3] space-y-0.5">
            <p>収入: <span className="text-[#00d4a0] font-mono">{fmt(income)}</span></p>
            <p>経費: <span className="text-[#ff4d6d] font-mono">{fmt(expense)}</span></p>
          </div>
        </div>
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-xs text-[#8b8fa3] mb-1">株式損益</p>
          <p className={`text-lg font-mono font-bold ${colorClass(stockPnl)}`}>
            {stockPnl >= 0 ? '+' : ''}{fmt(stockPnl)}円
          </p>
          <p className="mt-2 text-xs text-[#8b8fa3]">記録: <span className="font-mono">{monthStock.length}</span>件</p>
        </div>
      </div>

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
