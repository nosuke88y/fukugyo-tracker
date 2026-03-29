import { useState } from 'react';

export default function SettingsPage() {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleExport = () => {
    const data = {
      fukugyo_side_v1: JSON.parse(localStorage.getItem('fukugyo_side_v1') || '[]'),
      fukugyo_stock_v1: JSON.parse(localStorage.getItem('fukugyo_stock_v1') || '[]'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fukugyo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.fukugyo_side_v1) localStorage.setItem('fukugyo_side_v1', JSON.stringify(data.fukugyo_side_v1));
          if (data.fukugyo_stock_v1) localStorage.setItem('fukugyo_stock_v1', JSON.stringify(data.fukugyo_stock_v1));
          alert('インポートが完了しました。ページを再読み込みします。');
          location.reload();
        } catch {
          alert('ファイルの読み込みに失敗しました。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = (key: string, label: string) => {
    localStorage.removeItem(key);
    setShowConfirm(null);
    alert(`${label}のデータを削除しました。`);
    location.reload();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">設定</h1>

      <div className="space-y-3">
        {/* データエクスポート */}
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-sm font-bold mb-1">データエクスポート</p>
          <p className="text-xs text-[#8b8fa3] mb-3">全データをJSONファイルとしてダウンロードします</p>
          <button onClick={handleExport} className="bg-[#4d9fff] text-white px-4 py-2 rounded-lg text-sm font-bold w-full">
            バックアップをダウンロード
          </button>
        </div>

        {/* データインポート */}
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-sm font-bold mb-1">データインポート</p>
          <p className="text-xs text-[#8b8fa3] mb-3">バックアップファイルからデータを復元します</p>
          <button onClick={handleImport} className="bg-[#1c2130] border border-[#2a2f3e] text-[#e4e6eb] px-4 py-2 rounded-lg text-sm font-bold w-full">
            ファイルを選択して復元
          </button>
        </div>

        {/* データ削除 */}
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4">
          <p className="text-sm font-bold mb-1 text-[#ff4d6d]">データ削除</p>
          <p className="text-xs text-[#8b8fa3] mb-3">この操作は元に戻せません。先にバックアップを取ることをおすすめします。</p>
          <div className="space-y-2">
            {showConfirm === 'side' ? (
              <div className="flex gap-2">
                <button onClick={() => handleClear('fukugyo_side_v1', '副業収支')} className="flex-1 bg-[#ff4d6d] text-white py-2 rounded-lg text-sm font-bold">本当に削除</button>
                <button onClick={() => setShowConfirm(null)} className="flex-1 bg-[#1c2130] border border-[#2a2f3e] text-[#e4e6eb] py-2 rounded-lg text-sm">キャンセル</button>
              </div>
            ) : (
              <button onClick={() => setShowConfirm('side')} className="w-full bg-[#1c2130] border border-[#ff4d6d33] text-[#ff4d6d] px-4 py-2 rounded-lg text-sm">
                副業収支データを削除
              </button>
            )}
            {showConfirm === 'stock' ? (
              <div className="flex gap-2">
                <button onClick={() => handleClear('fukugyo_stock_v1', '株式損益')} className="flex-1 bg-[#ff4d6d] text-white py-2 rounded-lg text-sm font-bold">本当に削除</button>
                <button onClick={() => setShowConfirm(null)} className="flex-1 bg-[#1c2130] border border-[#2a2f3e] text-[#e4e6eb] py-2 rounded-lg text-sm">キャンセル</button>
              </div>
            ) : (
              <button onClick={() => setShowConfirm('stock')} className="w-full bg-[#1c2130] border border-[#ff4d6d33] text-[#ff4d6d] px-4 py-2 rounded-lg text-sm">
                株式損益データを削除
              </button>
            )}
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="bg-[#161a22] border border-[#2a2f3e] rounded-xl p-4 text-center">
          <p className="text-sm font-bold">副業トラッカー</p>
          <p className="text-xs text-[#8b8fa3] mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
