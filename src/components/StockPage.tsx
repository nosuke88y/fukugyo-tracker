import { useState, useEffect } from 'react';

interface StockRecord {
  id: string; date: string; name: string; code: string; qty: number; cost: number; price: number; pnl: number; memo: string;
}

const STORAGE_KEY = 'fukugyo_stock_v1';

export default function StockPage() {
  const [records, setRecords] = useState<StockRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), name: '', code: '', qty: '', cost: '', price: '', memo: '' });

  useEffect(() => {
    setRecords(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  }, []);

  const save = (data: StockRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setRecords(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.qty);
    const cost = Number(form.cost);
    const price = Number(form.price);
    const pnl = (price - cost) * qty;
    const newRecord: StockRecord = {
      id: crypto.randomUUID(),
      date: form.date, name: form.name, code: form.code,
      qty, cost, price, pnl, memo: form.memo,
    };
    save([newRecord, ...records]);
    setForm({ date: new Date().toISOString().slice(0, 10), name: '', code: '', qty: '', cost: '', price: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    save(records.filter(r => r.id !== id));
  };

  const fmt = (n: number) => n.toLocaleString('ja-JP');
  const colorClass = (n: number) => n > 0 ? 'text-[#00d4a0]' : n < 0 ? 'text-[#ff4d6d]' : 'text-[#e4e6eb]';

  const totalPnl = records.reduce((s, r) => s + r.pnl, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">株式損益</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#4d9fff] text-white px-4 py-2 rounded-lg text-sm font-bold">
          {showForm ? '閉じる' : '+ 追加'}
        </button>
      </div>

      {/* 合計 */}
      <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4 mb-6">
        <p className="text-xs text-[#8b8fa3] mb-1">累計損益</p>
        <p className={`text-2xl font-mono font-bold ${colorClass(totalPnl)}`}>
          {totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}円
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">日付</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb]" required />
            </div>
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">銘柄コード</label>
              <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="例: 7203" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] font-mono placeholder-[#555]" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8b8fa3] block mb-1">銘柄名</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="例: トヨタ自動車" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] placeholder-[#555]" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">数量</label>
              <input type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} placeholder="100" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] font-mono placeholder-[#555]" required />
            </div>
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">取得単価</label>
              <input type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} placeholder="0" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] font-mono placeholder-[#555]" required />
            </div>
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">売却単価</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] font-mono placeholder-[#555]" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8b8fa3] block mb-1">メモ</label>
            <input type="text" value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} placeholder="任意" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] placeholder-[#555]" />
          </div>
          <button type="submit" className="w-full bg-[#4d9fff] text-white py-2.5 rounded-lg font-bold text-sm">保存</button>
        </form>
      )}

      {records.length === 0 ? (
        <p className="text-center text-[#8b8fa3] py-16 text-sm">まだ記録がありません</p>
      ) : (
        <div className="space-y-2">
          {records.sort((a, b) => b.date.localeCompare(a.date)).map(r => (
            <div key={r.id} className="bg-[#161a22] border border-[#2a2f3e] rounded-lg px-4 py-3 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{r.name} <span className="text-[#8b8fa3] font-mono">({r.code})</span></p>
                <p className="text-xs text-[#8b8fa3]">{r.date} · {r.qty}株 · {fmt(r.cost)}→{fmt(r.price)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className={`font-mono font-bold text-sm ${colorClass(r.pnl)}`}>
                  {r.pnl >= 0 ? '+' : ''}{fmt(r.pnl)}
                </p>
                <button onClick={() => handleDelete(r.id)} className="text-[#8b8fa3] hover:text-[#ff4d6d] text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
