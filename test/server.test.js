import { expect } from 'chai';
import { createApp } from '../src/server.js';

describe('Badge Server (Hono)', () => {
  let app;

  before(() => {
    app = createApp();
  });

  describe('GET /badge.svg', () => {
    it('should return SVG with correct headers', async () => {
      const req = new Request('http://localhost/badge.svg');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      expect(res.headers.get('content-type')).to.equal('image/svg+xml');
      expect(res.headers.get('cache-control')).to.include('public');
      expect(res.headers.get('access-control-allow-origin')).to.equal('*');
      
      const text = await res.text();
      expect(text).to.include('<svg');
      expect(text).to.include('xmlns="http://www.w3.org/2000/svg"');
      expect(text).to.include('paybadge');
      expect(text).to.include('crypto');
    });

    it('should handle custom text parameters', async () => {
      const req = new Request('http://localhost/badge.svg?leftText=donate&rightText=bitcoin');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const text = await res.text();
      expect(text).to.include('donate');
      expect(text).to.include('bitcoin');
    });

    it('should handle color customization', async () => {
      const req = new Request('http://localhost/badge.svg?leftColor=%23333&rightColor=%23007bff');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const text = await res.text();
      expect(text).to.include('#333');
      expect(text).to.include('#007bff');
    });

    it('should sanitize malicious input', async () => {
      const req = new Request('http://localhost/badge.svg?leftText=%3Cscript%3Ealert%28%22xss%22%29%3C%2Fscript%3E');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const text = await res.text();
      expect(text).to.not.include('<script>');
      expect(text).to.not.include('alert');
    });

    it('should reject excessively long parameters', async () => {
      const longText = 'a'.repeat(100);
      const req = new Request(`http://localhost/badge.svg?leftText=${longText}`);
      const res = await app.fetch(req);

      expect(res.status).to.equal(400);
      const json = await res.json();
      expect(json).to.have.property('error');
    });
  });

  describe('GET /badge-crypto.svg', () => {
    it('should return enhanced badge with crypto styling', async () => {
      const req = new Request('http://localhost/badge-crypto.svg');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      expect(res.headers.get('content-type')).to.equal('image/svg+xml');
      
      const text = await res.text();
      expect(text).to.include('<svg');
      expect(text).to.include('crypto');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const req = new Request('http://localhost/health');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('status', 'healthy');
      expect(json).to.have.property('timestamp');
      expect(json).to.have.property('uptime');
    });
  });

  describe('GET /api', () => {
    it('should return API documentation', async () => {
      const req = new Request('http://localhost/api');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('name', 'PayBadge API');
      expect(json).to.have.property('endpoints');
      expect(json).to.have.property('badgeParameters');
      expect(json).to.have.property('codeGenerationParameters');
      expect(json).to.have.property('examples');
    });
  });

  describe('GET /presets', () => {
    it('should return available presets', async () => {
      const req = new Request('http://localhost/presets');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('presets');
      expect(json).to.have.property('descriptions');
      expect(json.presets).to.be.an('array');
      expect(json.presets).to.include('bitcoin');
      expect(json.presets).to.include('ethereum');
    });
  });

  describe('POST /generate-code', () => {
    it('should generate markdown code', async () => {
      const req = new Request('http://localhost/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeParams: { leftText: 'donate', rightText: 'bitcoin' },
          linkUrl: 'https://example.com',
          altText: 'Bitcoin Donation',
          format: 'markdown'
        })
      });
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('format', 'markdown');
      expect(json).to.have.property('code');
      expect(json.code).to.include('[![Bitcoin Donation]');
      expect(json.code).to.include('leftText=donate');
      expect(json.code).to.include('rightText=bitcoin');
    });

    it('should generate HTML code', async () => {
      const req = new Request('http://localhost/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeParams: { leftText: 'support', rightText: 'project' },
          linkUrl: 'https://example.com',
          altText: 'Support Project',
          format: 'html'
        })
      });
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('format', 'html');
      expect(json).to.have.property('code');
      expect(json.code).to.include('<a href="https://example.com"');
      expect(json.code).to.include('<img src=');
      expect(json.code).to.include('alt="Support Project"');
    });

    it('should require linkUrl parameter', async () => {
      const req = new Request('http://localhost/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeParams: { leftText: 'test' }
        })
      });
      const res = await app.fetch(req);

      expect(res.status).to.equal(400);
      const json = await res.json();
      expect(json).to.have.property('error');
    });
  });

  describe('POST /generate-all-formats', () => {
    it('should generate both markdown and HTML formats', async () => {
      const req = new Request('http://localhost/generate-all-formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeParams: { leftText: 'crypto', rightText: 'payment' },
          linkUrl: 'https://example.com',
          altText: 'Crypto Payment'
        })
      });
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('markdown');
      expect(json).to.have.property('html');
      expect(json.markdown).to.have.property('format', 'markdown');
      expect(json.html).to.have.property('format', 'html');
      expect(json.markdown.code).to.include('[![');
      expect(json.html.code).to.include('<a href=');
    });
  });

  describe('GET /preset/:presetName', () => {
    it('should generate code using bitcoin preset', async () => {
      const req = new Request('http://localhost/preset/bitcoin?linkUrl=https://example.com&format=markdown');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.have.property('format', 'markdown');
      expect(json).to.have.property('code');
      expect(json.code).to.include('Bitcoin Payment');
    });

    it('should return error for unknown preset', async () => {
      const req = new Request('http://localhost/preset/unknown?linkUrl=https://example.com');
      const res = await app.fetch(req);

      expect(res.status).to.equal(400);
      const json = await res.json();
      expect(json).to.have.property('error');
      expect(json.error).to.include('Unknown preset');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const req = new Request('http://localhost/unknown-route');
      const res = await app.fetch(req);

      expect(res.status).to.equal(404);
      const json = await res.json();
      expect(json).to.have.property('error', 'Not Found');
    });

    it('should handle CORS preflight requests', async () => {
      const req = new Request('http://localhost/badge.svg', {
        method: 'OPTIONS'
      });
      const res = await app.fetch(req);

      // Hono correctly returns 204 for OPTIONS requests
      expect(res.status).to.equal(204);
      expect(res.headers.get('access-control-allow-origin')).to.equal('*');
      expect(res.headers.get('access-control-allow-methods')).to.include('GET');
    });
  });

  describe('Performance and caching', () => {
    it('should set appropriate cache headers', async () => {
      const req = new Request('http://localhost/badge.svg');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      expect(res.headers.get('cache-control')).to.include('max-age');
    });

    it('should include ETag header for caching', async () => {
      const req = new Request('http://localhost/badge.svg');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      expect(res.headers.get('etag')).to.exist;
    });

    it('should return 304 for conditional requests with matching ETag', async () => {
      // First request to get ETag
      const firstReq = new Request('http://localhost/badge.svg');
      const firstRes = await app.fetch(firstReq);
      const etag = firstRes.headers.get('etag');

      // Second request with If-None-Match header
      const secondReq = new Request('http://localhost/badge.svg', {
        headers: {
          'If-None-Match': etag
        }
      });
      const secondRes = await app.fetch(secondReq);

      expect(secondRes.status).to.equal(304);
    });
  });

  describe('Homepage', () => {
    it('should serve homepage with badge examples', async () => {
      const req = new Request('http://localhost/');
      const res = await app.fetch(req);

      expect(res.status).to.equal(200);
      expect(res.headers.get('content-type')).to.include('text/html');
      
      const html = await res.text();
      expect(html).to.include('PayBadge');
      expect(html).to.include('/badge.svg');
      expect(html).to.include('/badge-crypto.svg');
      expect(html).to.include('Markdown');
      expect(html).to.include('HTML');
    });
  });
});