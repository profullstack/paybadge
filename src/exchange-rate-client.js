/**
 * Exchange Rate API Client
 * Fetches cryptocurrency exchange rates from exchange-rate.profullstack.com
 */

/**
 * Base URL for the exchange rate API
 */
const EXCHANGE_RATE_API_BASE = 'https://exchange-rate.profullstack.com';

/**
 * Fetches current exchange rate for a cryptocurrency
 * @param {string} fromCurrency - Source currency (e.g., 'BTC', 'ETH')
 * @param {string} toCurrency - Target currency (e.g., 'USD', 'EUR')
 * @returns {Promise<number>} Exchange rate
 */
export async function getCurrentRate(fromCurrency, toCurrency = 'USD') {
  try {
    const url = `${EXCHANGE_RATE_API_BASE}/rate/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`;
    
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
    
    if (!data.rate || isNaN(parseFloat(data.rate))) {
      throw new Error('Invalid exchange rate data received');
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
 * @returns {Promise<Array<string>>} Array of supported currency codes
 */
export async function getSupportedCurrencies() {
  try {
    const url = `${EXCHANGE_RATE_API_BASE}/currencies`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      // Fallback to common currencies if API doesn't have this endpoint
      return ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'ADA', 'DOT', 'LINK', 'UNI', 'MATIC'];
    }
    
    const data = await response.json();
    return data.currencies || ['BTC', 'ETH', 'SOL', 'USDC'];
  } catch (error) {
    console.warn('Error getting supported currencies, using fallback:', error.message);
    // Return common cryptocurrencies as fallback
    return ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'ADA', 'DOT', 'LINK', 'UNI', 'MATIC'];
  }
}

/**
 * Checks if the exchange rate API is available
 * @returns {Promise<boolean>} Whether the API is responding
 */
export async function checkApiHealth() {
  try {
    const url = `${EXCHANGE_RATE_API_BASE}/health`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Exchange rate API health check failed:', error.message);
    return false;
  }
}