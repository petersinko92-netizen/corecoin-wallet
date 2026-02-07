import crypto from 'crypto';

// Use the key from .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; 
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is missing in .env file");
  }
  // If the key is in Hex format (64 chars), convert to Buffer
  if (ENCRYPTION_KEY.length === 64) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  // Otherwise, ensure it is exactly 32 chars
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 characters string or 64 hex characters.");
  }
  return Buffer.from(ENCRYPTION_KEY);
}

export function encrypt(text: string) {
  if (!text) return '';
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
}

export function decrypt(text: string) {
  if (!text) return null;
  try {
    const key = getKey();
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    const contentHex = textParts.join(':');

    if (!ivHex || !contentHex) return null;

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(contentHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}