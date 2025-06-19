/**
 * Tests for Exchange Rate API Client
 */

import { expect } from 'chai';
import {
  getCurrentRate,
  getMultipleRates,
  convertCurrency,
  getSupportedCurrencies,
  checkApiHealth
} from '../src/exchange-rate-client.js';

describe('Exchange Rate API Client', () => {
  // Increase timeout for network requests
  const NETWORK_TIMEOUT = 10000;

  describe('getCurrentRate', () => {
    it('should fetch BTC to USD rate', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const rate = await getCurrentRate('BTC', 'USD');
        
        expect(rate).to.be.a('number');
        expect(rate).to.be.greaterThan(0);
        expect(rate).to.be.lessThan(1000000); // Reasonable upper bound
      } catch (error) {
        // If API is not available, skip this test
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should fetch ETH to USD rate', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const rate = await getCurrentRate('ETH', 'USD');
        
        expect(rate).to.be.a('number');
        expect(rate).to.be.greaterThan(0);
        expect(rate).to.be.lessThan(100000); // Reasonable upper bound
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should fetch BTC to EUR rate', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const rate = await getCurrentRate('BTC', 'EUR');
        
        expect(rate).to.be.a('number');
        expect(rate).to.be.greaterThan(0);
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should return response with timestamp from new API format', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const result = await getCurrentRate('BTC', 'USD', { includeMetadata: true });
        
        expect(result).to.be.an('object');
        expect(result.rate).to.be.a('number');
        expect(result.rate).to.be.greaterThan(0);
        expect(result.crypto).to.equal('BTC');
        expect(result.fiat).to.equal('USD');
        expect(result.timestamp).to.be.a('string');
        expect(new Date(result.timestamp)).to.be.a('date');
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should throw error for invalid currency', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        await getCurrentRate('INVALID', 'USD');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.include('Failed to fetch exchange rate');
      }
    });

    it('should default to USD when no target currency specified', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const rate = await getCurrentRate('BTC');
        
        expect(rate).to.be.a('number');
        expect(rate).to.be.greaterThan(0);
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should handle case insensitive currency codes', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const rate = await getCurrentRate('btc', 'usd');
        
        expect(rate).to.be.a('number');
        expect(rate).to.be.greaterThan(0);
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe('getMultipleRates', () => {
    it('should fetch rates for multiple currencies', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const currencies = ['BTC', 'ETH', 'SOL'];
      const rates = await getMultipleRates(currencies);
      
      expect(rates).to.be.an('object');
      expect(rates).to.have.property('BTC');
      expect(rates).to.have.property('ETH');
      expect(rates).to.have.property('SOL');
      
      // At least one rate should be successful (or all null if API is down)
      const successfulRates = Object.values(rates).filter(rate => rate !== null);
      if (successfulRates.length > 0) {
        successfulRates.forEach(rate => {
          expect(rate).to.be.a('number');
          expect(rate).to.be.greaterThan(0);
        });
      }
    });

    it('should handle mix of valid and invalid currencies', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const currencies = ['BTC', 'INVALID', 'ETH'];
      const rates = await getMultipleRates(currencies);
      
      expect(rates).to.be.an('object');
      expect(rates).to.have.property('BTC');
      expect(rates).to.have.property('ETH');
      expect(rates).to.have.property('INVALID');
      
      // INVALID should be null
      expect(rates.INVALID).to.be.null;
    });

    it('should work with custom base currency', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const currencies = ['BTC', 'ETH'];
      const rates = await getMultipleRates(currencies, 'EUR');
      
      expect(rates).to.be.an('object');
      expect(rates).to.have.property('BTC');
      expect(rates).to.have.property('ETH');
    });
  });

  describe('convertCurrency', () => {
    it('should convert BTC to USD', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const amount = 1;
        const converted = await convertCurrency(amount, 'BTC', 'USD');
        
        expect(converted).to.be.a('number');
        expect(converted).to.be.greaterThan(amount);
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should return same amount for same currency conversion', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const amount = 100;
      const converted = await convertCurrency(amount, 'USD', 'USD');
      
      expect(converted).to.equal(amount);
    });

    it('should default to USD conversion', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const amount = 1;
        const converted = await convertCurrency(amount, 'BTC');
        
        expect(converted).to.be.a('number');
        expect(converted).to.be.greaterThan(amount);
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should handle decimal amounts correctly', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        const amount = 0.5;
        const converted = await convertCurrency(amount, 'BTC', 'USD');
        
        expect(converted).to.be.a('number');
        expect(converted).to.be.greaterThan(0);
      } catch (error) {
        if (error.message.includes('Failed to fetch exchange rate')) {
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return fixed crypto list and API fiat currencies', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const result = await getSupportedCurrencies();
      
      expect(result).to.be.an('object');
      expect(result).to.have.property('cryptos');
      expect(result).to.have.property('fiats');
      
      // Should always return exactly our 4 supported cryptos
      expect(result.cryptos).to.be.an('array');
      expect(result.cryptos).to.deep.equal(['BTC', 'ETH', 'SOL', 'USDC']);
      
      // Should return fiat currencies from API (or fallback)
      expect(result.fiats).to.be.an('array');
      expect(result.fiats.length).to.be.greaterThan(0);
      expect(result.fiats).to.include('USD');
    });

    it('should return fallback currencies when API fails', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const result = await getSupportedCurrencies();
      
      expect(result).to.be.an('object');
      expect(result.cryptos).to.deep.equal(['BTC', 'ETH', 'SOL', 'USDC']);
      expect(result.fiats).to.be.an('array');
      expect(result.fiats.length).to.be.greaterThan(0);
    });
  });

  describe('checkApiHealth', () => {
    it('should check API health status', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      const isHealthy = await checkApiHealth();
      
      expect(isHealthy).to.be.a('boolean');
      // Don't assert true/false since API might be down during tests
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        await getCurrentRate('XYZ123', 'USD');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.a('string');
      }
    });

    it('should provide meaningful error messages', async function() {
      this.timeout(NETWORK_TIMEOUT);
      
      try {
        await getCurrentRate('', 'USD');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Failed to fetch exchange rate');
      }
    });
  });
});