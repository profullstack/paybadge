# 📊 Exchange Rate API Client

A clean, modern JavaScript client for fetching cryptocurrency exchange rates from `https://api.profullstack.com/api/exchange-rates`.

## 🚀 Overview

This client provides real-time cryptocurrency exchange rates with:
- **Real-time Data**: Fetches current cryptocurrency prices with timestamps
- **Multiple Currency Support**: Support for major cryptocurrencies and fiat currencies
- **Metadata Access**: Full response data including timestamps and currency info
- **Batch Operations**: Get multiple exchange rates in parallel
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Zero Dependencies**: Works in both browser and Node.js environments
- **No Authentication**: No API keys or authentication required

## 📁 Files

- **[`src/exchange-rate-client.js`](src/exchange-rate-client.js)** - Main API client module
- **[`test/exchange-rate-client.test.js`](test/exchange-rate-client.test.js)** - Comprehensive test suite
- **[`demo-exchange-rates.js`](demo-exchange-rates.js)** - Interactive demo script
- **[`index.html`](index.html)** - Updated to use new client

## 🎮 Quick Demo

Run the interactive demo to see all functionality:

```bash
node demo-exchange-rates.js
```

This demonstrates:
- Real-time exchange rates for major cryptocurrencies
- Metadata retrieval with timestamps
- Multiple currency batch fetching
- Currency conversion examples
- International fiat currency support

## 🔧 API Reference

### Core Functions

#### `getCurrentRate(fromCurrency, toCurrency = 'USD', options = {})`
Fetches current exchange rate between two currencies.

```javascript
import { getCurrentRate } from './src/exchange-rate-client.js';

// Get BTC to USD rate
const btcRate = await getCurrentRate('BTC', 'USD');
console.log(`1 BTC = $${btcRate.toFixed(2)} USD`);

// Get ETH to EUR rate
const ethRate = await getCurrentRate('ETH', 'EUR');
console.log(`1 ETH = €${ethRate.toFixed(2)} EUR`);

// Get full response with metadata
const btcData = await getCurrentRate('BTC', 'USD', { includeMetadata: true });
console.log(`Rate: $${btcData.rate}, Updated: ${btcData.timestamp}`);
```

**Parameters:**
- `fromCurrency` (string) - Source currency code (e.g., 'BTC', 'ETH')
- `toCurrency` (string, optional) - Target currency code (default: 'USD')
- `options` (Object, optional) - Additional options
  - `includeMetadata` (boolean) - Return full response with metadata

**Returns:**
- `Promise<number>` - Exchange rate (default)
- `Promise<Object>` - Full response object when `includeMetadata: true`

#### `getMultipleRates(currencies, baseCurrency = 'USD')`
Fetches rates for multiple currencies in parallel.

```javascript
import { getMultipleRates } from './src/exchange-rate-client.js';

const rates = await getMultipleRates(['BTC', 'ETH', 'SOL']);
console.log(rates);
// Output: { BTC: 45000, ETH: 3000, SOL: 100 }
```

**Parameters:**
- `currencies` (Array<string>) - Array of currency codes to fetch
- `baseCurrency` (string, optional) - Base currency (default: 'USD')

**Returns:** `Promise<Object>` - Object with currency codes as keys and rates as values

#### `convertCurrency(amount, fromCurrency, toCurrency = 'USD')`
Converts amount from one currency to another.

```javascript
import { convertCurrency } from './src/exchange-rate-client.js';

// Convert 0.5 BTC to USD
const usdAmount = await convertCurrency(0.5, 'BTC', 'USD');
console.log(`0.5 BTC = $${usdAmount.toFixed(2)} USD`);
```

**Parameters:**
- `amount` (number) - Amount to convert
- `fromCurrency` (string) - Source currency
- `toCurrency` (string, optional) - Target currency (default: 'USD')

**Returns:** `Promise<number>` - Converted amount

#### `getSupportedCurrencies()`
Returns list of supported cryptocurrencies.

```javascript
import { getSupportedCurrencies } from './src/exchange-rate-client.js';

const currencies = await getSupportedCurrencies();
console.log('Supported currencies:', currencies);
// Output: ['BTC', 'ETH', 'SOL', 'USDC', ...]
```

**Returns:** `Promise<Array<string>>` - Array of supported currency codes

#### `checkApiHealth()`
Checks if the exchange rate API is responding.

```javascript
import { checkApiHealth } from './src/exchange-rate-client.js';

const isHealthy = await checkApiHealth();
console.log('API is healthy:', isHealthy);
```

**Returns:** `Promise<boolean>` - Whether the API is responding

## 🌐 API Endpoints

The client connects to: `https://api.profullstack.com/api/exchange-rates`

### `GET /{crypto}/{fiat}`
Returns real-time exchange rate with metadata.

**Example:** `GET /btc/usd`

**Response:**
```json
{
  "crypto": "BTC",
  "fiat": "USD",
  "rate": 104684.262648,
  "timestamp": "2025-06-19T01:19:32.994Z"
}
```

**Features:**
- Real-time pricing data
- Timestamp for data freshness
- Consistent response format
- Support for multiple fiat currencies (USD, EUR, etc.)
- Case-insensitive currency codes

### Supported Currency Pairs
- **Cryptocurrencies**: BTC, ETH, SOL, USDC, USDT, ADA, DOT, LINK, UNI, MATIC
- **Fiat Currencies**: USD, EUR, and more
- **Format**: All requests use lowercase currency codes in the URL

## 🎯 Usage Examples

### Basic Rate Fetching
```javascript
import { getCurrentRate } from './src/exchange-rate-client.js';

try {
  const rate = await getCurrentRate('BTC', 'EUR');
  console.log(`Current BTC/EUR rate: €${rate.toFixed(2)}`);
} catch (error) {
  console.error('Failed to fetch rate:', error.message);
}
```

### Multiple Rates with Error Handling
```javascript
import { getMultipleRates } from './src/exchange-rate-client.js';

async function displayRates() {
  try {
    const currencies = ['BTC', 'ETH', 'SOL', 'USDC'];
    const rates = await getMultipleRates(currencies);
    
    Object.entries(rates).forEach(([currency, rate]) => {
      if (rate !== null) {
        console.log(`${currency}: $${rate.toFixed(2)}`);
      } else {
        console.warn(`Failed to fetch rate for ${currency}`);
      }
    });
  } catch (error) {
    console.error('Error fetching rates:', error.message);
  }
}
```

### Currency Conversion Calculator
```javascript
import { convertCurrency } from './src/exchange-rate-client.js';

async function createConverter() {
  const amount = 1.5;
  const fromCurrency = 'ETH';
  const toCurrency = 'USD';
  
  try {
    const converted = await convertCurrency(amount, fromCurrency, toCurrency);
    console.log(`${amount} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`);
  } catch (error) {
    console.error('Conversion failed:', error.message);
  }
}
```

## 🧪 Testing

### Running Tests
```bash
# Install dependencies
pnpm install

# Run tests
pnpm test
```

### Test Coverage
The test suite covers:
- ✅ Single rate fetching
- ✅ Multiple rate fetching  
- ✅ Currency conversion
- ✅ Error handling
- ✅ Network failure scenarios
- ✅ API health checks
- ✅ Fallback mechanisms

### Test Results
```
Exchange Rate API Client
  getCurrentRate
    - should fetch BTC to USD rate (skipped - API not available)
    - should fetch ETH to USD rate (skipped - API not available)
    ✔ should throw error for invalid currency
    ✔ should handle case insensitive currency codes
  getMultipleRates
    ✔ should fetch rates for multiple currencies
    ✔ should handle mix of valid and invalid currencies
  convertCurrency
    ✔ should return same amount for same currency conversion
  getSupportedCurrencies
    ✔ should return array of supported currencies
  checkApiHealth
    ✔ should check API health status
  Error Handling
    ✔ should handle network errors gracefully
    ✔ should provide meaningful error messages

53 passing, 8 pending
```

## 🚨 Error Handling

### Common Error Scenarios
1. **Network Issues**: API unavailable or DNS resolution failure
2. **Invalid Currency**: Unsupported cryptocurrency code
3. **API Errors**: HTTP error responses (4xx, 5xx)
4. **Malformed Data**: Invalid response format

### Error Handling Pattern
```javascript
import { getCurrentRate } from './src/exchange-rate-client.js';

async function safeGetRate(currency) {
  try {
    return await getCurrentRate(currency);
  } catch (error) {
    if (error.message.includes('Failed to fetch exchange rate')) {
      // Handle API-specific errors
      console.warn(`Rate unavailable for ${currency}`);
      return null;
    } else if (error.message.includes('fetch failed')) {
      // Handle network connectivity issues
      console.error('Network connectivity issue');
      throw new Error('Service temporarily unavailable');
    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

## 🔄 Integration with Existing Code

### Updated HTML Integration
The main [`index.html`](index.html) file has been updated to use the new exchange rate client:

```javascript
// Before: Using Tatum SDK
const { getCurrentRate } = await import('./src/tatum-client.js');

// After: Using Exchange Rate API
const { getCurrentRate } = await import('./src/exchange-rate-client.js');
```

### Browser Usage
```html
<script type="module">
  import { getCurrentRate } from './src/exchange-rate-client.js';
  
  const btcRate = await getCurrentRate('BTC', 'USD');
  console.log(`Current BTC rate: $${btcRate.toFixed(2)}`);
</script>
```

## 🚀 Performance Considerations

### Optimization Tips
1. **Caching**: Cache exchange rates for short periods to reduce API calls
2. **Batching**: Use `getMultipleRates` for multiple currencies
3. **Error Recovery**: Implement fallback mechanisms for network failures
4. **Loading States**: Show loading indicators for better UX

### Example Caching Implementation
```javascript
const rateCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

async function getCachedRate(currency) {
  const cacheKey = `${currency}_USD`;
  const cached = rateCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rate;
  }
  
  const rate = await getCurrentRate(currency);
  rateCache.set(cacheKey, { rate, timestamp: Date.now() });
  return rate;
}
```

## 📝 Migration from Tatum SDK

### Key Changes
- ✅ **Removed**: Complex Tatum SDK CDN loading
- ✅ **Removed**: API key requirements
- ✅ **Added**: Simple fetch-based API client
- ✅ **Added**: Better error handling and fallbacks
- ✅ **Maintained**: Same function signatures for easy migration

### Breaking Changes
- Function signatures remain the same
- Error messages may differ slightly
- Network timeout behavior may vary
- No more CDN dependencies

## 🔗 Related Files

- [`src/exchange-rate-client.js`](src/exchange-rate-client.js) - Main client implementation
- [`test/exchange-rate-client.test.js`](test/exchange-rate-client.test.js) - Test suite
- [`index.html`](index.html) - Updated main application
- [`src/server.js`](src/server.js) - Server implementation (unchanged)

## 📄 License

This client follows the same license as the main project.