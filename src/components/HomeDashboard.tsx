import { useState, useEffect } from 'react';

interface SideRecord {
  id: string; date: string; type: 'income' | 'expense'; category: string; site: string; amount: number; memo: string;
}
interface StockRecord {
  id: string; date: string; name: string; code: string; qty: number; cost: number; price: number; pnl: number; memo: string;
}

export default function HomeDashboard() {
  const [sideRecords, setSideRecords] = useState<SideRecord[]>([]);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);

  useEffect(() => {
    const side = JSON.parse(localStorage.getItem('fukugyo_side_v1') || '[]');
    const stock = JSON.parse(localStorage.getItem('fukugyo_stock_v1') || '[]');
    setSideRecords(side);
    setStockRecords(stock);
  }, []);

  // 今月のデータ
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

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">ダッシュボード</h1>

      {/* 今月の合計 */}
      <div className="bg-[#161a22] border border-[#2a2f3e] rounded-2xl p-5 mb-4">
        <p className="text-xs text-[#8b8fa3] mb-1">{thisMonth.replace('-', '年')}月 合計損益</p>
        <p className={`text-3xl font-mono font-bold ${colorClass(totalProfit)}`}>
          {totalProfit >= 0 ? '+' : ''}{fmt(totalProfit)}円
        </p>
      </div>

      {/* 副業・株式サマリー */}
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
          <p className="mt-2 text-xs text-[#8b8fa3]">取引: <span className="font-mono">{monthStock.length}</span>件</p>
        </div>
      </div>

      {/* 直近の記録 */}
      <h2 className="text-sm font-bold text-[#8b8fa3] mb-3">直近の記録</h2>
      {sideRecords.length === 0 && stockRecords.length === 0 ? (
        <p className="text-center text-[#8b8fa3] py-10 text-sm">まだ記録がありません</p>
      ) : (
        <div className="space-y-2">
          {[...sideRecords, ...stockRecords]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5)
            .map((r) => {
              const isSide = 'type' in r;
              if (isSide) {
                const sr = r as SideRecord;
                return (
                  <div key={sr.id} className="bg-[#161a22] border border-[#2a2f3e] rounded-lg px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm">{sr.category}{sr.site ? ` / ${sr.site}` : ''}</p>
                      <p className="text-xs text-[#8b8fa3]">{sr.date}</p>
                    </div>
                    <p className={`font-mono font-bold ${sr.type === 'income' ? 'text-[#00d4a0]' : 'text-[#ff4d6d]'}`}>
                      {sr.type === 'income' ? '+' : '-'}{fmt(sr.amount)}
                    </p>
                  </div>
                );
              } else {
                const st = r as StockRecord;
                return (
                  <div key={st.id} className="bg-[#161a22] border border-[#2a2f3e] rounded-lg px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm">{st.name} ({st.code})</p>
                      <p className="text-xs text-[#8b8fa3]">{st.date}</p>
                    </div>
                    <p className={`font-mono font-bold ${colorClass(st.pnl)}`}>
                      {st.pnl >= 0 ? '+' : ''}{fmt(st.pnl)}
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
