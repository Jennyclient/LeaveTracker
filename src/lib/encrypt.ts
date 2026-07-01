import CryptoJS from "crypto-js";

const ENCRYPTION_KEY1 = CryptoJS.enc.Hex.parse(
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY1 ?? ""
);
const ENCRYPTION_KEY2 = CryptoJS.enc.Hex.parse(
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY2 ?? ""
);

export function encrypt(text: string): string {
  if (typeof text !== "string") {
    throw new Error("Input text must be a string");
  }

  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted1 = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY1, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encrypted2 = CryptoJS.AES.encrypt(encrypted1.toString(), ENCRYPTION_KEY2, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted2.toString()}`;
}
