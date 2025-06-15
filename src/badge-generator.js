import crypto from 'crypto';

/**
 * Default configuration for badge generation
 */
const DEFAULT_CONFIG = {
  leftText: 'paybadge',
  rightText: 'crypto',
  leftColor: '#555',
  rightColor: '#4c1',
  style: 'standard',
  icon: null,
  width: 110,
  height: 20,
  fontSize: 11,
  fontFamily: 'Verdana,Geneva,DejaVu Sans,sans-serif'
};

/**
 * Maximum allowed text length to prevent abuse
 */
const MAX_TEXT_LENGTH = 50;

/**
 * Sanitizes input text to prevent XSS and other security issues
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  // First decode URL encoding, then sanitize
  let decoded;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    decoded = text; // If decoding fails, use original
  }
  
  // Remove dangerous patterns completely
  let sanitized = decoded
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/script|alert|eval|prompt|confirm/gi, '') // Remove dangerous keywords
    .replace(/[<>&"']/g, (match) => {
      const entities = {
        '<': '',
        '>': '',
        '&': '',
        '"': '',
        "'": ''
      };
      return entities[match];
    })
    .trim()
    .substring(0, MAX_TEXT_LENGTH);
  
  // If sanitization removed everything, return empty string
  return sanitized || '';
}

/**
 * Validates and sanitizes badge parameters
 * @param {Object} params - Raw parameters from request
 * @returns {Object} - Validation result with sanitized parameters
 */
export function validateBadgeParams(params = {}) {
  try {
    // Validate text length BEFORE sanitization to catch long inputs
    const originalLeftText = params.leftText || '';
    const originalRightText = params.rightText || '';
    
    if (originalLeftText.length > MAX_TEXT_LENGTH || originalRightText.length > MAX_TEXT_LENGTH) {
      return {
        isValid: false,
        error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`,
        params: null
      };
    }

    const sanitized = {
      leftText: sanitizeText(params.leftText) || DEFAULT_CONFIG.leftText,
      rightText: sanitizeText(params.rightText) || DEFAULT_CONFIG.rightText,
      leftColor: sanitizeText(params.leftColor) || DEFAULT_CONFIG.leftColor,
      rightColor: sanitizeText(params.rightColor) || DEFAULT_CONFIG.rightColor,
      style: sanitizeText(params.style) || DEFAULT_CONFIG.style,
      icon: sanitizeText(params.icon) || DEFAULT_CONFIG.icon
    };

    // Validate color format (basic hex color validation)
    const colorRegex = /^#[0-9A-Fa-f]{3,6}$/;
    if (!colorRegex.test(sanitized.leftColor) || !colorRegex.test(sanitized.rightColor)) {
      // If invalid colors, use defaults
      sanitized.leftColor = DEFAULT_CONFIG.leftColor;
      sanitized.rightColor = DEFAULT_CONFIG.rightColor;
    }

    return {
      isValid: true,
      params: sanitized,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Parameter validation failed: ${error.message}`,
      params: null
    };
  }
}

/**
 * Calculates text width for proper badge sizing
 * @param {string} text - Text to measure
 * @param {number} fontSize - Font size
 * @returns {number} - Estimated text width
 */
function calculateTextWidth(text, fontSize = DEFAULT_CONFIG.fontSize) {
  // Approximate character width calculation
  // This is a simplified calculation; in production, you might want to use a more accurate method
  const avgCharWidth = fontSize * 0.6;
  return text.length * avgCharWidth;
}

/**
 * Generates crypto icon SVG path
 * @param {string} iconType - Type of icon to generate
 * @returns {string} - SVG path for the icon
 */
function generateCryptoIcon(iconType) {
  const icons = {
    crypto: `<g transform="translate(8, 4)">
      <circle cx="6" cy="6" r="6" fill="#f7931a"/>
      <path d="M8.5 4.5c.1-.8-.5-1.2-1.3-1.5l.3-1.1-.7-.2-.3 1.1c-.2 0-.3-.1-.5-.1l.3-1.1-.7-.2-.3 1.1c-.1 0-.3-.1-.4-.1l-.9-.2-.2.7s.5.1.5.1c.3.1.3.2.3.4l-.3 1.3c0 0 0 0 .1 0l-.1 0-.7 1.7c-.1.1-.2.3-.5.2 0 0-.5-.1-.5-.1l-.3.8.9.2.5.1-.3 1.1.7.2.3-1.1c.2 0 .4.1.5.1l-.3 1.1.7.2.3-1.1c1.1.2 2-.1 2.3-.9.3-.8 0-1.3-.6-1.6.4-.1.8-.4.8-1zm-1.5 2.1c-.2.8-1.6.4-2 .3l.4-1.5c.4.1 1.9.3 1.6 1.2zm.2-2.2c-.2.7-1.3.4-1.7.3l.3-1.3c.4.1 1.6.3 1.4 1z" fill="white"/>
    </g>`,
    bitcoin: `<g transform="translate(8, 4)">
      <circle cx="6" cy="6" r="6" fill="#f7931a"/>
      <path d="M8.5 4.5c.1-.8-.5-1.2-1.3-1.5l.3-1.1-.7-.2-.3 1.1c-.2 0-.3-.1-.5-.1l.3-1.1-.7-.2-.3 1.1c-.1 0-.3-.1-.4-.1l-.9-.2-.2.7s.5.1.5.1c.3.1.3.2.3.4l-.3 1.3c0 0 0 0 .1 0l-.1 0-.7 1.7c-.1.1-.2.3-.5.2 0 0-.5-.1-.5-.1l-.3.8.9.2.5.1-.3 1.1.7.2.3-1.1c.2 0 .4.1.5.1l-.3 1.1.7.2.3-1.1c1.1.2 2-.1 2.3-.9.3-.8 0-1.3-.6-1.6.4-.1.8-.4.8-1zm-1.5 2.1c-.2.8-1.6.4-2 .3l.4-1.5c.4.1 1.9.3 1.6 1.2zm.2-2.2c-.2.7-1.3.4-1.7.3l.3-1.3c.4.1 1.6.3 1.4 1z" fill="white"/>
    </g>`
  };
  
  return icons[iconType] || '';
}

/**
 * Generates SVG badge with specified parameters
 * @param {Object} options - Badge generation options
 * @returns {string} - Complete SVG markup
 */
export function generateBadgeSVG(options = {}) {
  // Handle direct text parameter for backward compatibility
  if (options.text) {
    options.rightText = options.text;
  }
  
  const validation = validateBadgeParams(options);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  const params = validation.params;
  
  // Calculate dimensions
  const leftTextWidth = calculateTextWidth(params.leftText);
  const rightTextWidth = calculateTextWidth(params.rightText);
  const iconWidth = params.icon ? 16 : 0;
  const padding = 12;
  
  const leftWidth = Math.max(leftTextWidth + padding, 55);
  const rightWidth = Math.max(rightTextWidth + padding + iconWidth, 55);
  const totalWidth = leftWidth + rightWidth;
  
  // Generate icon if specified
  const iconSvg = params.icon ? generateCryptoIcon(params.icon) : '';
  
  // Calculate text positions
  const leftTextX = leftWidth / 2;
  const rightTextX = leftWidth + (rightWidth / 2);
  const textY = 14;
  
  // Generate SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${DEFAULT_CONFIG.height}" role="img" aria-label="${params.leftText}: ${params.rightText}">
  <title>${params.leftText}: ${params.rightText}</title>
  <linearGradient id="gradient" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity="0.1"/>
    <stop offset="1" stop-opacity="0.1"/>
  </linearGradient>
  <clipPath id="round">
    <rect width="${totalWidth}" height="${DEFAULT_CONFIG.height}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#round)">
    <rect width="${leftWidth}" height="${DEFAULT_CONFIG.height}" fill="${params.leftColor}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${DEFAULT_CONFIG.height}" fill="${params.rightColor}"/>
    <rect width="${totalWidth}" height="${DEFAULT_CONFIG.height}" fill="url(#gradient)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="${DEFAULT_CONFIG.fontFamily}" font-size="${DEFAULT_CONFIG.fontSize}">
    <text x="${leftTextX}" y="${textY}" fill="#010101" fill-opacity=".3">${params.leftText}</text>
    <text x="${leftTextX}" y="${textY - 1}">${params.leftText}</text>
    <text x="${rightTextX}" y="${textY}" fill="#010101" fill-opacity=".3">${params.rightText}</text>
    <text x="${rightTextX}" y="${textY - 1}">${params.rightText}</text>
  </g>
  ${iconSvg}
</svg>`;

  return svg;
}

/**
 * Creates HTTP response object with proper headers for SVG
 * @param {string} svgContent - SVG content to serve
 * @returns {Object} - Response object with headers and body
 */
export function createSVGResponse(svgContent) {
  // Generate ETag for caching
  const etag = crypto.createHash('md5').update(svgContent).digest('hex');
  
  return {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'ETag': `"${etag}"`,
      'Vary': 'Accept-Encoding'
    },
    body: svgContent
  };
}

/**
 * Generates enhanced badge with crypto styling
 * @param {Object} options - Badge generation options
 * @returns {string} - Enhanced SVG markup
 */
export function generateEnhancedBadge(options = {}) {
  const enhancedOptions = {
    ...options,
    style: 'enhanced',
    icon: options.icon || 'crypto',
    rightColor: options.rightColor || '#f7931a'
  };
  
  return generateBadgeSVG(enhancedOptions);
}