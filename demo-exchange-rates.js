#!/usr/bin/env node

/**
 * Demo script showing real-time exchange rate functionality
 * Uses the updated exchange rate client with the new API endpoint
 */

import { getCurrentRate, getMultipleRates, convertCurrency, getSupportedCurrencies } from './src/exchange-rate-client.js';

async function demonstrateExchangeRates() {
  console.log('🚀 Real-time Exchange Rate Demo\n');
  
  try {
    // 1. Get current BTC/USD rate
    console.log('📊 Current BTC/USD Rate:');
    const btcRate = await getCurrentRate('BTC', 'USD');
    console.log(`   $${btcRate.toLocaleString()}\n`);
    
    // 2. Get rate with metadata
    console.log('📈 BTC/USD with Metadata:');
    const btcWithMeta = await getCurrentRate('BTC', 'USD', { includeMetadata: true });
    console.log(`   Rate: $${btcWithMeta.rate.toLocaleString()}`);
    console.log(`   Crypto: ${btcWithMeta.crypto}`);
    console.log(`   Fiat: ${btcWithMeta.fiat}`);
    console.log(`   Timestamp: ${new Date(btcWithMeta.timestamp).toLocaleString()}\n`);
    
    // 3. Get multiple rates
    console.log('💰 Multiple Cryptocurrency Rates (USD):');
    const currencies = ['BTC', 'ETH', 'SOL'];
    const rates = await getMultipleRates(currencies);
    
    for (const [crypto, rate] of Object.entries(rates)) {
      if (rate !== null) {
        console.log(`   ${crypto}: $${rate.toLocaleString()}`);
      } else {
        console.log(`   ${crypto}: Rate unavailable`);
      }
    }
    console.log();
    
    // 4. Currency conversion
    console.log('🔄 Currency Conversion Examples:');
    const btcAmount = 0.1;
    const convertedUSD = await convertCurrency(btcAmount, 'BTC', 'USD');
    console.log(`   ${btcAmount} BTC = $${convertedUSD.toLocaleString()}`);
    
    const ethAmount = 1;
    const convertedEthUSD = await convertCurrency(ethAmount, 'ETH', 'USD');
    console.log(`   ${ethAmount} ETH = $${convertedEthUSD.toLocaleString()}`);
    
    // 5. Different fiat currencies
    console.log('\n🌍 International Rates:');
    const btcEur = await getCurrentRate('BTC', 'EUR');
    console.log(`   BTC/EUR: €${btcEur.toLocaleString()}`);
    
    // 6. Supported currencies
    console.log('\n📋 Supported Currencies:');
    const supportedCurrencies = await getSupportedCurrencies();
    console.log(`   Cryptocurrencies: ${supportedCurrencies.cryptos.join(', ')}`);
    console.log(`   Fiat Currencies: ${supportedCurrencies.fiats.slice(0, 10).join(', ')}${supportedCurrencies.fiats.length > 10 ? '...' : ''}`);
    
    console.log('\n✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
demonstrateExchangeRates();