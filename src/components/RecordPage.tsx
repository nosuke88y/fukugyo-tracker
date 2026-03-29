import { useState, useEffect } from 'react';

interface SideRecord {
  id: string; date: string; type: 'income' | 'expense'; category: string; site: string; amount: number; memo: string;
}

const STORAGE_KEY = 'fukugyo_side_v1';

export default function RecordPage() {
  const [records, setRecords] = useState<SideRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), type: 'income' as 'income' | 'expense', category: '', site: '', amount: '', memo: '' });

  useEffect(() => {
    setRecords(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  }, []);

  const save = (data: SideRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setRecords(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SideRecord = {
      id: crypto.randomUUID(),
      date: form.date,
      type: form.type,
      category: form.category,
      site: form.site,
      amount: Number(form.amount),
      memo: form.memo,
    };
    save([newRecord, ...records]);
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'income', category: '', site: '', amount: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    save(records.filter(r => r.id !== id));
  };

  const fmt = (n: number) => n.toLocaleString('ja-JP');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">副業 収支記録</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#00d4a0] text-[#0d0f14] px-4 py-2 rounded-lg text-sm font-bold">
          {showForm ? '閉じる' : '+ 追加'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4 mb-6 space-y-3">
          <div>
            <label className="text-xs text-[#8b8fa3] block mb-1">日付</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full max-w-[160px] bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb]" required />
          </div>
          <div>
            <label className="text-xs text-[#8b8fa3] block mb-1">種別</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({...form, type: 'income'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${form.type === 'income' ? 'bg-[#00d4a0] text-[#0d0f14]' : 'bg-[#1c2130] border border-[#2a2f3e] text-[#8b8fa3]'}`}>収入</button>
              <button type="button" onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${form.type === 'expense' ? 'bg-[#ff4d6d] text-white' : 'bg-[#1c2130] border border-[#2a2f3e] text-[#8b8fa3]'}`}>経費</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">カテゴリ</label>
              <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="例: ライティング" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] placeholder-[#555]" required />
            </div>
            <div>
              <label className="text-xs text-[#8b8fa3] block mb-1">サイト/サービス</label>
              <input type="text" value={form.site} onChange={e => setForm({...form, site: e.target.value})} placeholder="例: ランサーズ" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] placeholder-[#555]" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8b8fa3] block mb-1">金額（円）</label>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] font-mono placeholder-[#555]" required />
          </div>
          <div>
            <label className="text-xs text-[#8b8fa3] block mb-1">メモ</label>
            <input type="text" value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} placeholder="任意" className="w-full bg-[#1c2130] border border-[#2a2f3e] rounded-lg px-3 py-2 text-sm text-[#e4e6eb] placeholder-[#555]" />
          </div>
          <button type="submit" className="w-full bg-[#00d4a0] text-[#0d0f14] py-2.5 rounded-lg font-bold text-sm">保存</button>
        </form>
      )}

      {records.length === 0 ? (
        <p className="text-center text-[#8b8fa3] py-16 text-sm">まだ記録がありません</p>
      ) : (
        <div className="space-y-2">
          {records.sort((a, b) => b.date.localeCompare(a.date)).map(r => (
            <div key={r.id} className="bg-[#161a22] border border-[#2a2f3e] rounded-lg px-4 py-3 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{r.category}{r.site ? ` / ${r.site}` : ''}</p>
                <p className="text-xs text-[#8b8fa3]">{r.date}{r.memo ? ` · ${r.memo}` : ''}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className={`font-mono font-bold text-sm ${r.type === 'income' ? 'text-[#00d4a0]' : 'text-[#ff4d6d]'}`}>
                  {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
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
