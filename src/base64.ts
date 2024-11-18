export function encode(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const base64String = btoa(String.fromCharCode(...utf8Bytes));
  return base64String.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function decode(encoded: string): string {
  const padded = encoded.padEnd(encoded.length + (4 - (encoded.length % 4)) % 4, '=');
  const base64String = padded.replace(/-/g, '+').replace(/_/g, '/');
  const utf8Bytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
  return new TextDecoder().decode(utf8Bytes);
}