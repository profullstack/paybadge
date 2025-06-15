import { expect } from 'chai';
import { generateMarkdownBadge, generateHTMLBadge, generateBadgeCode } from '../src/code-generator.js';

describe('Code Generator', () => {
  const baseUrl = 'https://paybadge.profullstack.com';
  const badgeParams = {
    leftText: 'donate',
    rightText: 'crypto',
    leftColor: '#333',
    rightColor: '#007bff'
  };

  describe('generateMarkdownBadge', () => {
    it('should generate basic markdown badge code', () => {
      const result = generateMarkdownBadge(baseUrl, '/badge.svg', 'https://example.com', 'Crypto Payment');
      
      expect(result).to.equal('[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://example.com)');
    });

    it('should handle custom alt text', () => {
      const result = generateMarkdownBadge(baseUrl, '/badge.svg', 'https://example.com', 'Custom Alt Text');
      
      expect(result).to.include('Custom Alt Text');
    });

    it('should include query parameters', () => {
      const result = generateMarkdownBadge(baseUrl, '/badge.svg?leftText=donate&rightText=bitcoin', 'https://example.com', 'Bitcoin Donation');
      
      expect(result).to.include('leftText=donate');
      expect(result).to.include('rightText=bitcoin');
    });
  });

  describe('generateHTMLBadge', () => {
    it('should generate basic HTML badge code', () => {
      const result = generateHTMLBadge(baseUrl, '/badge.svg', 'https://example.com', 'Crypto Payment');
      
      expect(result).to.include('<a href="https://example.com"');
      expect(result).to.include('<img src="https://paybadge.profullstack.com/badge.svg"');
      expect(result).to.include('alt="Crypto Payment"');
    });

    it('should include proper HTML attributes', () => {
      const result = generateHTMLBadge(baseUrl, '/badge.svg', 'https://example.com', 'Crypto Payment');
      
      expect(result).to.include('target="_blank"');
      expect(result).to.include('rel="noopener noreferrer"');
    });

    it('should handle query parameters in HTML', () => {
      const result = generateHTMLBadge(baseUrl, '/badge.svg?leftText=donate&rightText=bitcoin', 'https://example.com', 'Bitcoin Donation');
      
      expect(result).to.include('leftText=donate');
      expect(result).to.include('rightText=bitcoin');
    });

    it('should escape HTML entities in alt text', () => {
      const result = generateHTMLBadge(baseUrl, '/badge.svg', 'https://example.com', 'Crypto & Bitcoin');
      
      expect(result).to.include('alt="Crypto &amp; Bitcoin"');
    });
  });

  describe('generateBadgeCode', () => {
    it('should generate markdown code by default', () => {
      const result = generateBadgeCode({
        baseUrl,
        badgeParams,
        linkUrl: 'https://example.com',
        altText: 'Crypto Payment'
      });
      
      expect(result.format).to.equal('markdown');
      expect(result.code).to.include('[![');
    });

    it('should generate HTML code when specified', () => {
      const result = generateBadgeCode({
        baseUrl,
        badgeParams,
        linkUrl: 'https://example.com',
        altText: 'Crypto Payment',
        format: 'html'
      });
      
      expect(result.format).to.equal('html');
      expect(result.code).to.include('<a href=');
      expect(result.code).to.include('<img src=');
    });

    it('should build correct badge URL with parameters', () => {
      const result = generateBadgeCode({
        baseUrl,
        badgeParams: {
          leftText: 'donate',
          rightText: 'bitcoin',
          leftColor: '#333',
          rightColor: '#f7931a'
        },
        linkUrl: 'https://example.com',
        altText: 'Bitcoin Donation'
      });
      
      expect(result.badgeUrl).to.include('leftText=donate');
      expect(result.badgeUrl).to.include('rightText=bitcoin');
      expect(result.badgeUrl).to.include('leftColor=%23333');
      expect(result.badgeUrl).to.include('rightColor=%23f7931a');
    });

    it('should handle enhanced badge style', () => {
      const result = generateBadgeCode({
        baseUrl,
        badgeParams: { style: 'enhanced' },
        linkUrl: 'https://example.com',
        altText: 'Enhanced Badge'
      });
      
      expect(result.badgeUrl).to.include('/badge-crypto.svg');
    });

    it('should provide both markdown and HTML formats', () => {
      const options = {
        baseUrl,
        badgeParams,
        linkUrl: 'https://example.com',
        altText: 'Crypto Payment'
      };
      
      const markdownResult = generateBadgeCode({ ...options, format: 'markdown' });
      const htmlResult = generateBadgeCode({ ...options, format: 'html' });
      
      expect(markdownResult.code).to.include('[![');
      expect(htmlResult.code).to.include('<a href=');
      expect(markdownResult.badgeUrl).to.equal(htmlResult.badgeUrl);
    });
  });
});