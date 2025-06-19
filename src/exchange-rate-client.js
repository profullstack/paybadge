/**
 * Exchange Rate API Client
 * Fetches cryptocurrency exchange rates from api.profullstack.com
 */

/**
 * Base URL for the exchange rate API
 */
const EXCHANGE_RATE_API_BASE = 'https://api.profullstack.com/api/exchange-rates';

/**
 * Fetches current exchange rate for a cryptocurrency
 * @param {string} fromCurrency - Source currency (e.g., 'BTC', 'ETH')
 * @param {string} toCurrency - Target currency (e.g., 'USD', 'EUR')
 * @param {Object} options - Optional parameters
 * @param {boolean} options.includeMetadata - Whether to return full response with metadata
 * @returns {Promise<number|Object>} Exchange rate or full response object
 */
export async function getCurrentRate(fromCurrency, toCurrency = 'USD', options = {}) {
  try {
    const url = `${EXCHANGE_RATE_API_BASE}/${fromCurrency.toLowerCase()}/${toCurrency.toLowerCase()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response format: {"crypto":"BTC","fiat":"USD","rate":104684.262648,"timestamp":"2025-06-19T01:19:32.994Z"}
    if (!data.rate || isNaN(parseFloat(data.rate))) {
      throw new Error('Invalid exchange rate data received');
    }
    
    if (!data.crypto || !data.fiat || !data.timestamp) {
      throw new Error('Incomplete exchange rate response received');
    }
    
    // Return full response if metadata requested, otherwise just the rate
    if (options.includeMetadata) {
      return {
        rate: parseFloat(data.rate),
        crypto: data.crypto,
        fiat: data.fiat,
        timestamp: data.timestamp
      };
    }
    
    return parseFloat(data.rate);
  } catch (error) {
    console.error(`Error fetching ${fromCurrency}/${toCurrency} rate:`, error);
    throw new Error(`Failed to fetch exchange rate for ${fromCurrency}/${toCurrency}: ${error.message}`);
  }
}

/**
 * Fetches multiple exchange rates in parallel
 * @param {Array<string>} currencies - Array of currency codes
 * @param {string} baseCurrency - Base currency (default: 'USD')
 * @returns {Promise<Object>} Object with currency codes as keys and rates as values
 */
export async function getMultipleRates(currencies, baseCurrency = 'USD') {
  try {
    const ratePromises = currencies.map(async (currency) => {
      try {
        const rate = await getCurrentRate(currency, baseCurrency);
        return { currency, rate, success: true };
      } catch (error) {
        console.warn(`Failed to fetch rate for ${currency}:`, error.message);
        return { currency, rate: null, success: false, error: error.message };
      }
    });
    
    const results = await Promise.allSettled(ratePromises);
    const rates = {};
    
    results.forEach((result, index) => {
      const currency = currencies[index];
      if (result.status === 'fulfilled' && result.value.success) {
        rates[currency] = result.value.rate;
      } else {
        rates[currency] = null;
      }
    });
    
    return rates;
  } catch (error) {
    console.error('Error fetching multiple rates:', error);
    throw error;
  }
}

/**
 * Converts amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<number>} Converted amount
 */
export async function convertCurrency(amount, fromCurrency, toCurrency = 'USD') {
  try {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return amount;
    }
    
    const rate = await getCurrentRate(fromCurrency, toCurrency);
    return amount * rate;
  } catch (error) {
    console.error(`Error converting ${amount} ${fromCurrency} to ${toCurrency}:`, error);
    throw error;
  }
}

/**
 * Gets supported currencies from the API
 * @returns {Promise<{cryptos: Array<string>, fiats: Array<string>}>} Object with supported crypto and fiat currencies
 */
export async function getSupportedCurrencies() {
  // We only support these 4 cryptocurrencies (we have wallet addresses for them)
  const SUPPORTED_CRYPTOS = ['BTC', 'ETH', 'SOL', 'USDC'];
  
  try {
    const url = `${EXCHANGE_RATE_API_BASE}/supported`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.fiats || !Array.isArray(data.fiats)) {
      throw new Error('Invalid supported currencies response format - missing fiats array');
    }
    
    return {
      cryptos: SUPPORTED_CRYPTOS, // Always return our fixed list of supported cryptos
      fiats: data.fiats // Return all fiat currencies from the API
    };
  } catch (error) {
    console.warn('Error getting supported currencies, using fallback:', error.message);
    // Return fallback currencies
    return {
      cryptos: SUPPORTED_CRYPTOS,
      fiats: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD']
    };
  }
}

/**
 * Gets supported cryptocurrencies only (for backward compatibility)
 * @returns {Promise<Array<string>>} Array of supported cryptocurrency codes
 */
export async function getSupportedCryptos() {
  try {
    const { cryptos } = await getSupportedCurrencies();
    return cryptos;
  } catch (error) {
    console.warn('Error getting supported cryptos, using fallback:', error.message);
    return ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'ADA', 'DOT', 'LINK', 'UNI', 'MATIC'];
  }
}

/**
 * Gets supported fiat currencies only
 * @returns {Promise<Array<string>>} Array of supported fiat currency codes
 */
export async function getSupportedFiats() {
  try {
    const { fiats } = await getSupportedCurrencies();
    return fiats;
  } catch (error) {
    console.warn('Error getting supported fiats, using fallback:', error.message);
    return ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  }
}

/**
 * Checks if the exchange rate API is available
 * @returns {Promise<boolean>} Whether the API is responding
 */
export async function checkApiHealth() {
  try {
    // Test the API by making a simple BTC/USD request
    await getCurrentRate('BTC', 'USD');
    return true;
  } catch (error) {
    console.warn('Exchange rate API health check failed:', error.message);
    return false;
  }
}