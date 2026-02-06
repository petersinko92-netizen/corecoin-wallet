import crypto from 'crypto';

// ⚠️ TEMP FIX: Hardcoding the key to ensure it NEVER changes during testing.
// Once everything works, we can move this back to .env
const SECRET_KEY = "my-super-secret-dev-key-that-is-consistent"; 

// Create a static 32-byte key from your secret
const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const algorithm = 'aes-256-cbc';

export function encrypt(text: string) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string) {
  try {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    const contentHex = textParts.join(':');

    if (!ivHex || !contentHex) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(contentHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    return null;
  }
}