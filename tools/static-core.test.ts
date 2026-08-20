import { describe, expect, it } from 'vitest';
import { safeStaticPath, staticContentType, staticResponseHeaders } from './static-core';

describe('production static serving core', () => {
  it('resolves files inside the configured root and rejects traversal or malformed paths', () => {
    expect(safeStaticPath('/srv/companyscope/dist', '/assets/app.js')).toBe('/srv/companyscope/dist/assets/app.js');
    expect(safeStaticPath('/srv/companyscope/dist', '/')).toBe('/srv/companyscope/dist/index.html');
    expect(safeStaticPath('/srv/companyscope/dist', '/.')).toBe('/srv/companyscope/dist');
    expect(safeStaticPath('/srv/companyscope/dist', '/../secret.txt')).toBeNull();
    expect(safeStaticPath('/srv/companyscope/dist', '/%2e%2e/secret.txt')).toBeNull();
    expect(safeStaticPath('/srv/companyscope/dist', '/%00secret.txt')).toBeNull();
    expect(safeStaticPath('/srv/companyscope/dist', '/bad%encoding')).toBeNull();
  });

  it('uses explicit content types and conservative fallback behavior', () => {
    expect(staticContentType('/app/index.html')).toBe('text/html; charset=utf-8');
    expect(staticContentType('/app/assets/app.js')).toBe('text/javascript; charset=utf-8');
    expect(staticContentType('/app/file.bin')).toBe('application/octet-stream');
  });

  it('emits hardened document headers and immutable caching only for hashed assets', () => {
    const documentHeaders = staticResponseHeaders('/app/index.html', true, false);
    expect(documentHeaders['cache-control']).toBe('no-cache');
    expect(documentHeaders['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(documentHeaders['strict-transport-security']).toContain('max-age=31536000');

    const developmentHeaders = staticResponseHeaders('/app/index.html', false, false);
    expect('strict-transport-security' in developmentHeaders).toBe(false);

    const assetHeaders = staticResponseHeaders('/app/assets/app.js', true, true);
    expect(assetHeaders['cache-control']).toContain('immutable');
  });
});
