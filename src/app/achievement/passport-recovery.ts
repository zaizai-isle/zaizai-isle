export interface RecoveryKey { passportId: string; secret: string }
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const KEY_PATTERN = new RegExp(`^LP1\\.(${UUID})\\.([0-9a-f]{64})$`);

export function newRecoveryKey(passportId: string) {
  const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `LP1.${passportId}.${secret}`;
}

export function parseRecoveryKey(value: string): RecoveryKey {
  const match = KEY_PATTERN.exec(value.trim());
  if (!match) throw new Error('恢复密钥格式不正确，请粘贴完整的 LP1 开头密钥。');
  return { passportId: match[1], secret: match[2] };
}

export function readRecoveryFile(text: string) {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || !('format' in value) || value.format !== 'life-passport-recovery-v1' || !('key' in value) || typeof value.key !== 'string') {
    throw new Error('这不是人生护照恢复密钥文件。');
  }
  parseRecoveryKey(value.key);
  return value.key;
}
