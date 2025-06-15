import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { generateBadgeSVG, generateEnhancedBadge, validateBadgeParams } from './badge-generator.js';
import { generateBadgeCode, generateAllBadgeFormats, generatePresetBadge, BADGE_PRESETS } from './code-generator.js';

/**
 * Creates and configures the Hono application
 * @returns {Hono} - Configured Hono app
 */
export function createApp() {
  const app = new Hono();

  // CORS middleware - essential for README badge display
  app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    exposeHeaders: ['ETag', 'Cache-Control']
  }));

  // ETag middleware for caching
  app.use('*', etag());

  // Health check endpoint
  app.get('/health', (c) => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    });
  });

  // Standard badge endpoint
  app.get('/badge.svg', (c) => {
    try {
      const query = c.req.query();
      const validation = validateBadgeParams(query);
      
      if (!validation.isValid) {
        return c.json({
          error: validation.error,
          message: 'Invalid badge parameters'
        }, 400);
      }

      const svgContent = generateBadgeSVG(validation.params);
      
      // Set proper headers for SVG
      c.header('Content-Type', 'image/svg+xml');
      c.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      c.header('Vary', 'Accept-Encoding');
      
      return c.body(svgContent);
    } catch (error) {
      console.error('Error generating badge:', error);
      return c.json({
        error: 'Internal server error',
        message: 'Failed to generate badge'
      }, 500);
    }
  });

  // Enhanced crypto badge endpoint
  app.get('/badge-crypto.svg', (c) => {
    try {
      const query = c.req.query();
      const enhancedQuery = { ...query, style: 'enhanced' };
      const validation = validateBadgeParams(enhancedQuery);
      
      if (!validation.isValid) {
        return c.json({
          error: validation.error,
          message: 'Invalid badge parameters'
        }, 400);
      }

      const svgContent = generateEnhancedBadge(validation.params);
      
      // Set proper headers for SVG
      c.header('Content-Type', 'image/svg+xml');
      c.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      c.header('Vary', 'Accept-Encoding');
      
      return c.body(svgContent);
    } catch (error) {
      console.error('Error generating enhanced badge:', error);
      return c.json({
        error: 'Internal server error',
        message: 'Failed to generate enhanced badge'
      }, 500);
    }
  });

  // Code generation endpoint
  app.post('/generate-code', async (c) => {
    try {
      const body = await c.req.json();
      const {
        baseUrl = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host')}`,
        badgeParams = {},
        linkUrl,
        altText = 'Crypto Payment',
        format = 'markdown'
      } = body;

      if (!linkUrl) {
        return c.json({
          error: 'Missing required parameter: linkUrl',
          message: 'linkUrl is required for code generation'
        }, 400);
      }

      const result = generateBadgeCode({
        baseUrl,
        badgeParams,
        linkUrl,
        altText,
        format
      });

      return c.json(result);
    } catch (error) {
      console.error('Error generating code:', error);
      return c.json({
        error: 'Internal server error',
        message: 'Failed to generate code'
      }, 500);
    }
  });

  // Generate both markdown and HTML formats
  app.post('/generate-all-formats', async (c) => {
    try {
      const body = await c.req.json();
      const {
        baseUrl = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host')}`,
        badgeParams = {},
        linkUrl,
        altText = 'Crypto Payment'
      } = body;

      if (!linkUrl) {
        return c.json({
          error: 'Missing required parameter: linkUrl',
          message: 'linkUrl is required for code generation'
        }, 400);
      }

      const result = generateAllBadgeFormats({
        baseUrl,
        badgeParams,
        linkUrl,
        altText
      });

      return c.json(result);
    } catch (error) {
      console.error('Error generating all formats:', error);
      return c.json({
        error: 'Internal server error',
        message: 'Failed to generate code formats'
      }, 500);
    }
  });

  // Preset badge generation
  app.get('/preset/:presetName', (c) => {
    try {
      const presetName = c.req.param('presetName');
      const query = c.req.query();
      const {
        linkUrl = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host')}/`,
        format = 'markdown',
        ...overrides
      } = query;

      const baseUrl = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host')}`;
      
      const result = generatePresetBadge(baseUrl, presetName, linkUrl, format, overrides);
      
      return c.json(result);
    } catch (error) {
      console.error('Error generating preset badge:', error);
      return c.json({
        error: error.message,
        message: 'Failed to generate preset badge'
      }, 400);
    }
  });

  // List available presets
  app.get('/presets', (c) => {
    return c.json({
      presets: Object.keys(BADGE_PRESETS),
      descriptions: Object.entries(BADGE_PRESETS).reduce((acc, [key, preset]) => {
        acc[key] = {
          altText: preset.altText,
          badgeParams: preset.badgeParams
        };
        return acc;
      }, {})
    });
  });

  // API info endpoint
  app.get('/api', (c) => {
    return c.json({
      name: 'PayBadge API',
      version: '1.0.0',
      description: 'Dynamic SVG badge generator for crypto payments',
      endpoints: {
        '/badge.svg': 'Standard crypto payment badge',
        '/badge-crypto.svg': 'Enhanced crypto payment badge with icon',
        '/generate-code': 'POST - Generate markdown/HTML code for badges',
        '/generate-all-formats': 'POST - Generate both markdown and HTML formats',
        '/preset/{name}': 'GET - Generate code using preset configurations',
        '/presets': 'GET - List available preset configurations',
        '/health': 'Health check endpoint',
        '/api': 'API information'
      },
      badgeParameters: {
        leftText: 'Left side text (default: paybadge)',
        rightText: 'Right side text (default: crypto)',
        leftColor: 'Left side color (default: #555)',
        rightColor: 'Right side color (default: #4c1)',
        style: 'Badge style (standard|enhanced)'
      },
      codeGenerationParameters: {
        baseUrl: 'Base URL for badge service (auto-detected)',
        badgeParams: 'Badge customization parameters',
        linkUrl: 'URL to link to when badge is clicked (required)',
        altText: 'Alt text for the badge (default: Crypto Payment)',
        format: 'Output format: markdown or html (default: markdown)'
      },
      examples: [
        '/badge.svg',
        '/badge.svg?leftText=donate&rightText=bitcoin',
        '/badge.svg?leftColor=%23333&rightColor=%23007bff',
        '/badge-crypto.svg?rightText=BTC',
        '/preset/bitcoin?linkUrl=https://example.com&format=html',
        '/presets'
      ]
    });
  });

  // Serve static files (for the web interface)
  app.get('/', async (c) => {
    try {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PayBadge - Crypto Payment Badges</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            .badge-example { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .badge-example img { vertical-align: middle; margin-right: 10px; }
            .code-block { background: #1a202c; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; margin: 10px 0; overflow-x: auto; }
            .format-toggle { margin: 10px 0; }
            .format-toggle button { margin-right: 10px; padding: 5px 15px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; }
            .format-toggle button.active { background: #007bff; color: white; border-color: #007bff; }
            code { background: #e1e1e1; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .copy-btn { float: right; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>🎯 PayBadge API</h1>
          <p>Dynamic SVG badge generator for crypto payments with markdown and HTML code generation</p>
          
          <h2>Live Examples:</h2>
          
          <div class="badge-example">
            <h3>Standard Badge</h3>
            <img src="/badge.svg" alt="Standard Badge">
            <div class="format-toggle">
              <button class="active" onclick="showFormat(this, 'markdown-1')">Markdown</button>
              <button onclick="showFormat(this, 'html-1')">HTML</button>
            </div>
            <div id="markdown-1" class="code-block">[![Crypto Payment](/badge.svg)](/)</div>
            <div id="html-1" class="code-block" style="display:none;">&lt;a href="/" target="_blank" rel="noopener noreferrer"&gt;<br>  &lt;img src="/badge.svg" alt="Crypto Payment" /&gt;<br>&lt;/a&gt;</div>
          </div>
          
          <div class="badge-example">
            <h3>Enhanced Badge</h3>
            <img src="/badge-crypto.svg" alt="Enhanced Badge">
            <div class="format-toggle">
              <button class="active" onclick="showFormat(this, 'markdown-2')">Markdown</button>
              <button onclick="showFormat(this, 'html-2')">HTML</button>
            </div>
            <div id="markdown-2" class="code-block">[![Crypto Payment](/badge-crypto.svg)](/)</div>
            <div id="html-2" class="code-block" style="display:none;">&lt;a href="/" target="_blank" rel="noopener noreferrer"&gt;<br>  &lt;img src="/badge-crypto.svg" alt="Crypto Payment" /&gt;<br>&lt;/a&gt;</div>
          </div>
          
          <div class="badge-example">
            <h3>Custom Text & Colors</h3>
            <img src="/badge.svg?leftText=donate&rightText=bitcoin&leftColor=%23333&rightColor=%23f7931a" alt="Custom Badge">
            <div class="format-toggle">
              <button class="active" onclick="showFormat(this, 'markdown-3')">Markdown</button>
              <button onclick="showFormat(this, 'html-3')">HTML</button>
            </div>
            <div id="markdown-3" class="code-block">[![Bitcoin Donation](/badge.svg?leftText=donate&rightText=bitcoin&leftColor=%23333&rightColor=%23f7931a)](/)</div>
            <div id="html-3" class="code-block" style="display:none;">&lt;a href="/" target="_blank" rel="noopener noreferrer"&gt;<br>  &lt;img src="/badge.svg?leftText=donate&rightText=bitcoin&leftColor=%23333&rightColor=%23f7931a" alt="Bitcoin Donation" /&gt;<br>&lt;/a&gt;</div>
          </div>
          
          <h2>API Endpoints</h2>
          <ul>
            <li><code>POST /generate-code</code> - Generate markdown or HTML code</li>
            <li><code>POST /generate-all-formats</code> - Generate both formats</li>
            <li><code>GET /preset/{name}</code> - Use preset configurations</li>
            <li><code>GET /presets</code> - List available presets</li>
          </ul>
          
          <h2>Usage in README</h2>
          <p>Add this to your GitHub README.md or HTML pages:</p>
          <div class="format-toggle">
            <button class="active" onclick="showFormat(this, 'usage-markdown')">Markdown</button>
            <button onclick="showFormat(this, 'usage-html')">HTML</button>
          </div>
          <div id="usage-markdown" class="code-block">[![Crypto Payment](https://your-domain.com/badge.svg)](https://your-payment-page.com)</div>
          <div id="usage-html" class="code-block" style="display:none;">&lt;a href="https://your-payment-page.com" target="_blank" rel="noopener noreferrer"&gt;<br>  &lt;img src="https://your-domain.com/badge.svg" alt="Crypto Payment" /&gt;<br>&lt;/a&gt;</div>
          
          <p><a href="/api">📖 Full API Documentation</a></p>
          
          <script>
            function showFormat(button, targetId) {
              // Update button states
              const buttons = button.parentElement.querySelectorAll('button');
              buttons.forEach(btn => btn.classList.remove('active'));
              button.classList.add('active');
              
              // Show/hide code blocks
              const container = button.parentElement.parentElement;
              const codeBlocks = container.querySelectorAll('.code-block');
              codeBlocks.forEach(block => block.style.display = 'none');
              document.getElementById(targetId).style.display = 'block';
            }
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error serving homepage:', error);
      return c.text('Error loading homepage', 500);
    }
  });

  // 404 handler
  app.notFound((c) => {
    return c.json({
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      availableEndpoints: [
        '/badge.svg', 
        '/badge-crypto.svg', 
        '/generate-code', 
        '/generate-all-formats',
        '/preset/{name}',
        '/presets',
        '/health', 
        '/api'
      ]
    }, 404);
  });

  // Error handler
  app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }, 500);
  });

  return app;
}

/**
 * Starts the server
 */
export function startServer() {
  const app = createApp();
  const port = parseInt(process.env.PORT || '3000', 10);
  
  console.log(`🚀 PayBadge server starting on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎯 Badge endpoint: http://localhost:${port}/badge.svg`);
  console.log(`✨ Enhanced badge: http://localhost:${port}/badge-crypto.svg`);
  console.log(`🔧 Code generator: POST http://localhost:${port}/generate-code`);
  console.log(`📋 Presets: http://localhost:${port}/presets`);
  console.log(`📖 API docs: http://localhost:${port}/api`);
  
  serve({
    fetch: app.fetch,
    port
  });
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}