'use client';

import { useRef, useState } from 'react';
import { cloudPassportEnabled, migrateLocalStamps, recoverPassport, recoveryKey, rotateRecoveryKey } from '../passport-cloud';
import { readRecoveryFile } from '../passport-recovery';

function downloadKey(key: string) {
  const blob = new Blob([JSON.stringify({ format: 'life-passport-recovery-v1', key }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '人生护照恢复密钥.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PassportCloudControls({ onChanged }: { onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [key, setKey] = useState('');
  const [confirmation, setConfirmation] = useState<'rotate' | 'restore' | 'import' | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  async function run(action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : '操作失败，请重试。'); }
    finally { busyRef.current = false; setBusy(false); }
  }

  if (!cloudPassportEnabled) return <p className="mt-4 text-sm text-[#686d68]">当前为本地护照，数据仅保存在此浏览器。云端服务尚未启用。</p>;
  const button = 'min-h-11 border border-[#526b45]/30 px-3 py-2 text-sm text-[#263b35] hover:bg-[#526b45]/10 disabled:opacity-50';
  return (
    <section aria-label="云端保存与恢复" className="my-5 border border-[#aeb3ad] bg-[#f5f1e5] p-4">
      <p className="text-sm leading-6 text-[#526b45]">免注册 · 私密云端护照。请下载恢复密钥，换设备或清理浏览器后凭密钥找回。持有密钥即可访问和修改护照，请勿公开分享。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={button} disabled={busy} onClick={() => void run(async () => {
          const stored = await recoveryKey();
          if (stored) { downloadKey(stored); setMessage('密钥文件已开始下载，请确认已保存在设备上。'); }
          else setConfirmation('rotate');
        })}>下载恢复密钥</button>
        <button className={button} disabled={busy} onClick={() => { setRestoreOpen(!restoreOpen); setConfirmation(null); }}>用密钥恢复护照</button>
        <button className={button} disabled={busy} onClick={() => setConfirmation('import')}>转存本地记录到云端</button>
        <button className={button} disabled={busy} onClick={() => setConfirmation('rotate')}>重新生成密钥</button>
      </div>
      {restoreOpen ? <div className="mt-4 space-y-2">
        <label className="block text-sm" htmlFor="passport-recovery-key">粘贴完整恢复密钥</label>
        <input id="passport-recovery-key" type="password" autoComplete="off" spellCheck={false} value={key} disabled={busy} onChange={(e) => setKey(e.target.value)} className="min-h-11 w-full border border-[#aeb3ad] bg-white/60 px-3" />
        <label className="block text-sm">或选择恢复密钥文件<input type="file" accept="application/json,.json" disabled={busy} className="mt-2 block max-w-full text-sm" onChange={(e) => {
          const file = e.target.files?.[0]; e.target.value = '';
          if (file) void run(async () => {
            if (file.size > 4096) throw new Error('恢复密钥文件过大，请选择正确文件。');
            setKey(readRecoveryFile(await file.text())); setMessage('密钥已读取，请确认恢复。');
          });
        }} /></label>
        <button className={button} disabled={busy || !key.trim()} onClick={() => setConfirmation('restore')}>恢复这本护照</button>
      </div> : null}
      {confirmation ? <div className="mt-4 border-l-2 border-[#8b4b45] pl-3">
        <p className="text-sm leading-6">{confirmation === 'rotate' ? '新密钥会使旧密钥失效，已经授权的设备仍可访问。请妥善保存新文件。' : confirmation === 'restore' ? '将切换到密钥对应的护照，不合并或删除当前记录。若要返回当前护照，请先下载它的恢复密钥。' : '将本浏览器保存的记录和照片上传到当前云端护照，本地原件保留；相同记录不会重复导入或覆盖。最多保存 100 枚，部分失败可再次操作继续。'}</p>
        <div className="mt-2 flex gap-2">
          <button className={button} disabled={busy} onClick={() => void run(async () => {
            if (confirmation === 'rotate') {
              downloadKey(await rotateRecoveryKey()); setMessage('新密钥文件已开始下载，旧密钥已失效。');
            } else if (confirmation === 'restore') {
              await recoverPassport(key); setKey(''); setRestoreOpen(false); setMessage('已恢复护照。'); onChanged();
            } else {
              try {
                const result = await migrateLocalStamps(setMessage);
                setMessage(`转存完成：新增 ${result.imported} 条，跳过 ${result.skipped} 条。本地原件保留。`);
              } finally { onChanged(); }
            }
            setConfirmation(null);
          })}>{busy ? '处理中…' : '确认继续'}</button>
          <button className={button} disabled={busy} onClick={() => setConfirmation(null)}>取消</button>
        </div>
      </div> : null}
      {message ? <p role="status" className="mt-3 text-sm text-[#526b45]">{message}</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-[#a02f28]">{error}</p> : null}
    </section>
  );
}
