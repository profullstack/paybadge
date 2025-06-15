import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { generateBadgeSVG, generateEnhancedBadge, validateBadgeParams } from './badge-generator.js';

/**
 * Creates and configures the Hono application
 * @returns {Hono} - Configured Hono app
 */
export function createApp() {
  const app = new Hono();

  // CORS middleware - essential for README badge display
  app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
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

  // API info endpoint
  app.get('/api', (c) => {
    return c.json({
      name: 'PayBadge API',
      version: '1.0.0',
      description: 'Dynamic SVG badge generator for crypto payments',
      endpoints: {
        '/badge.svg': 'Standard crypto payment badge',
        '/badge-crypto.svg': 'Enhanced crypto payment badge with icon',
        '/health': 'Health check endpoint',
        '/api': 'API information'
      },
      parameters: {
        leftText: 'Left side text (default: paybadge)',
        rightText: 'Right side text (default: crypto)',
        leftColor: 'Left side color (default: #555)',
        rightColor: 'Right side color (default: #4c1)',
        style: 'Badge style (standard|enhanced)'
      },
      examples: [
        '/badge.svg',
        '/badge.svg?leftText=donate&rightText=bitcoin',
        '/badge.svg?leftColor=%23333&rightColor=%23007bff',
        '/badge-crypto.svg?rightText=BTC'
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
            h1 { color: #333; }
            .badge-example { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
            .badge-example img { vertical-align: middle; margin-right: 10px; }
            code { background: #e1e1e1; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>🎯 PayBadge API</h1>
          <p>Dynamic SVG badge generator for crypto payments</p>
          
          <h2>Live Examples:</h2>
          
          <div class="badge-example">
            <h3>Standard Badge</h3>
            <img src="/badge.svg" alt="Standard Badge">
            <br><code>/badge.svg</code>
          </div>
          
          <div class="badge-example">
            <h3>Enhanced Badge</h3>
            <img src="/badge-crypto.svg" alt="Enhanced Badge">
            <br><code>/badge-crypto.svg</code>
          </div>
          
          <div class="badge-example">
            <h3>Custom Text</h3>
            <img src="/badge.svg?leftText=donate&rightText=bitcoin" alt="Custom Badge">
            <br><code>/badge.svg?leftText=donate&rightText=bitcoin</code>
          </div>
          
          <div class="badge-example">
            <h3>Custom Colors</h3>
            <img src="/badge.svg?leftColor=%23333&rightColor=%23007bff" alt="Custom Colors">
            <br><code>/badge.svg?leftColor=%23333&rightColor=%23007bff</code>
          </div>
          
          <h2>Usage in README</h2>
          <p>Add this to your GitHub README.md:</p>
          <code>[![Crypto Payment](https://your-domain.com/badge.svg)](https://your-payment-page.com)</code>
          
          <p><a href="/api">📖 API Documentation</a></p>
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
      availableEndpoints: ['/badge.svg', '/badge-crypto.svg', '/health', '/api']
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