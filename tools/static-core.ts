import { extname, resolve, sep } from 'node:path';

const contentTypes: Readonly<Record<string, string>> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export function staticContentType(filePath: string): string {
  return contentTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

export function safeStaticPath(root: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decoded.includes('\0')) return null;

  const normalizedRoot = resolve(root);
  const relativePath = decoded.replace(/^\/+/, '') || 'index.html';
  const candidate = resolve(normalizedRoot, relativePath);
  if (candidate !== normalizedRoot && !candidate.startsWith(`${normalizedRoot}${sep}`)) return null;
  return candidate;
}

export function staticResponseHeaders(filePath: string, production: boolean, immutable = false) {
  return {
    'content-type': staticContentType(filePath),
    'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'content-security-policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.tile.openstreetmap.org",
      "connect-src 'self'",
      "form-action 'self'",
    ].join('; '),
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-site',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    ...(production ? { 'strict-transport-security': 'max-age=31536000; includeSubDomains' } : {}),
  } as const;
}
