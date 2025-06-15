/**
 * Code Generator for Badge Markdown and HTML
 * Generates both markdown and HTML code for embedding badges
 */

/**
 * Escapes HTML entities in text
 * @param {string} text - Text to escape
 * @returns {string} - HTML-escaped text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds query string from parameters object
 * @param {Object} params - Parameters object
 * @returns {string} - URL-encoded query string
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Builds the complete badge URL with parameters
 * @param {string} baseUrl - Base URL for the badge service
 * @param {Object} badgeParams - Badge customization parameters
 * @returns {string} - Complete badge URL
 */
function buildBadgeUrl(baseUrl, badgeParams = {}) {
  // Determine badge endpoint based on style
  const isEnhanced = badgeParams.style === 'enhanced';
  const endpoint = isEnhanced ? '/badge-crypto.svg' : '/badge.svg';
  
  // Remove style from query params since it's handled by endpoint
  const queryParams = { ...badgeParams };
  delete queryParams.style;
  
  const queryString = buildQueryString(queryParams);
  return `${baseUrl}${endpoint}${queryString}`;
}

/**
 * Generates markdown badge code
 * @param {string} baseUrl - Base URL for the badge service
 * @param {string} badgePath - Badge path with query parameters
 * @param {string} linkUrl - URL to link to when badge is clicked
 * @param {string} altText - Alt text for the badge image
 * @returns {string} - Markdown badge code
 */
export function generateMarkdownBadge(baseUrl, badgePath, linkUrl, altText) {
  const badgeUrl = badgePath.startsWith('http') ? badgePath : `${baseUrl}${badgePath}`;
  return `[![${altText}](${badgeUrl})](${linkUrl})`;
}

/**
 * Generates HTML badge code
 * @param {string} baseUrl - Base URL for the badge service
 * @param {string} badgePath - Badge path with query parameters
 * @param {string} linkUrl - URL to link to when badge is clicked
 * @param {string} altText - Alt text for the badge image
 * @returns {string} - HTML badge code
 */
export function generateHTMLBadge(baseUrl, badgePath, linkUrl, altText) {
  const badgeUrl = badgePath.startsWith('http') ? badgePath : `${baseUrl}${badgePath}`;
  const escapedAltText = escapeHtml(altText);
  
  return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">
  <img src="${badgeUrl}" alt="${escapedAltText}" />
</a>`;
}

/**
 * Generates badge code in specified format with all options
 * @param {Object} options - Badge generation options
 * @param {string} options.baseUrl - Base URL for the badge service
 * @param {Object} options.badgeParams - Badge customization parameters
 * @param {string} options.linkUrl - URL to link to when badge is clicked
 * @param {string} options.altText - Alt text for the badge image
 * @param {string} options.format - Output format ('markdown' or 'html')
 * @returns {Object} - Generated code with metadata
 */
export function generateBadgeCode(options) {
  const {
    baseUrl,
    badgeParams = {},
    linkUrl,
    altText,
    format = 'markdown'
  } = options;

  // Build the complete badge URL
  const badgeUrl = buildBadgeUrl(baseUrl, badgeParams);
  
  // Extract path from URL for the generator functions
  const url = new URL(badgeUrl);
  const badgePath = `${url.pathname}${url.search}`;
  
  let code;
  
  switch (format.toLowerCase()) {
    case 'html':
      code = generateHTMLBadge(baseUrl, badgePath, linkUrl, altText);
      break;
    case 'markdown':
    default:
      code = generateMarkdownBadge(baseUrl, badgePath, linkUrl, altText);
      break;
  }
  
  return {
    format: format.toLowerCase(),
    code,
    badgeUrl,
    linkUrl,
    altText
  };
}

/**
 * Generates both markdown and HTML versions of badge code
 * @param {Object} options - Badge generation options
 * @returns {Object} - Both markdown and HTML versions
 */
export function generateAllBadgeFormats(options) {
  const markdownResult = generateBadgeCode({ ...options, format: 'markdown' });
  const htmlResult = generateBadgeCode({ ...options, format: 'html' });
  
  return {
    markdown: markdownResult,
    html: htmlResult,
    badgeUrl: markdownResult.badgeUrl,
    linkUrl: options.linkUrl,
    altText: options.altText
  };
}

/**
 * Generates badge code for common cryptocurrency configurations
 * @param {string} baseUrl - Base URL for the badge service
 * @param {Array<string>} cryptos - Array of cryptocurrency codes
 * @param {Object} addresses - Optional custom addresses
 * @param {string} format - Output format ('markdown' or 'html')
 * @returns {Object} - Generated badge code
 */
export function generateCryptoBadge(baseUrl, cryptos = ['btc', 'eth'], addresses = {}, format = 'markdown') {
  const badgeParams = {};
  
  // Handle single vs multiple cryptocurrencies
  if (cryptos.length === 1) {
    badgeParams.ticker = cryptos[0];
    if (addresses[cryptos[0]]) {
      badgeParams.recipient_address = addresses[cryptos[0]];
    }
  } else {
    badgeParams.tickers = cryptos.join(',');
    
    // Build recipient_addresses parameter if custom addresses provided
    const addressPairs = [];
    cryptos.forEach(crypto => {
      if (addresses[crypto]) {
        addressPairs.push(`${crypto}:${addresses[crypto]}`);
      }
    });
    
    if (addressPairs.length > 0) {
      badgeParams.recipient_addresses = addressPairs.join(',');
    }
  }
  
  // Build payment URL with same parameters
  const paymentUrl = `${baseUrl}/${buildQueryString(badgeParams)}`;
  
  return generateBadgeCode({
    baseUrl,
    badgeParams,
    linkUrl: paymentUrl,
    altText: 'Crypto Payment',
    format
  });
}

/**
 * Predefined badge configurations for common use cases
 */
export const BADGE_PRESETS = {
  bitcoin: {
    badgeParams: { ticker: 'btc', rightText: 'bitcoin', rightColor: '#f7931a' },
    altText: 'Bitcoin Payment'
  },
  ethereum: {
    badgeParams: { ticker: 'eth', rightText: 'ethereum', rightColor: '#627eea' },
    altText: 'Ethereum Payment'
  },
  solana: {
    badgeParams: { ticker: 'sol', rightText: 'solana', rightColor: '#00ffa3' },
    altText: 'Solana Payment'
  },
  usdc: {
    badgeParams: { ticker: 'usdc', rightText: 'USDC', rightColor: '#2775ca' },
    altText: 'USDC Payment'
  },
  multiCrypto: {
    badgeParams: { tickers: 'btc,eth,sol,usdc', style: 'enhanced' },
    altText: 'Crypto Payment'
  },
  donation: {
    badgeParams: { leftText: 'donate', rightText: 'crypto', rightColor: '#28a745' },
    altText: 'Donate with Crypto'
  },
  support: {
    badgeParams: { leftText: 'support', rightText: 'project', rightColor: '#17a2b8' },
    altText: 'Support this Project'
  }
};

/**
 * Generates badge code using a preset configuration
 * @param {string} baseUrl - Base URL for the badge service
 * @param {string} presetName - Name of the preset to use
 * @param {string} linkUrl - URL to link to when badge is clicked
 * @param {string} format - Output format ('markdown' or 'html')
 * @param {Object} overrides - Optional parameter overrides
 * @returns {Object} - Generated badge code
 */
export function generatePresetBadge(baseUrl, presetName, linkUrl, format = 'markdown', overrides = {}) {
  const preset = BADGE_PRESETS[presetName];
  
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}. Available presets: ${Object.keys(BADGE_PRESETS).join(', ')}`);
  }
  
  const badgeParams = { ...preset.badgeParams, ...overrides };
  const altText = overrides.altText || preset.altText;
  
  return generateBadgeCode({
    baseUrl,
    badgeParams,
    linkUrl,
    altText,
    format
  });
}