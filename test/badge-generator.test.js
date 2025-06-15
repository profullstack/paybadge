import { expect } from 'chai';
import { generateBadgeSVG, validateBadgeParams, createSVGResponse } from '../src/badge-generator.js';

describe('Badge Generator', () => {
  describe('generateBadgeSVG', () => {
    it('should generate a basic crypto payment badge SVG', () => {
      const svg = generateBadgeSVG();
      
      expect(svg).to.be.a('string');
      expect(svg).to.include('<svg');
      expect(svg).to.include('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).to.include('paybadge');
      expect(svg).to.include('crypto');
    });

    it('should generate SVG with custom text', () => {
      const svg = generateBadgeSVG({ text: 'Donate' });
      
      expect(svg).to.include('Donate');
    });

    it('should generate SVG with custom colors', () => {
      const svg = generateBadgeSVG({ 
        leftColor: '#333',
        rightColor: '#007bff'
      });
      
      expect(svg).to.include('#333');
      expect(svg).to.include('#007bff');
    });

    it('should handle enhanced badge style with icon', () => {
      const svg = generateBadgeSVG({ 
        style: 'enhanced',
        icon: 'crypto'
      });
      
      expect(svg).to.include('<svg');
      expect(svg).to.be.a('string');
    });
  });

  describe('validateBadgeParams', () => {
    it('should validate default parameters', () => {
      const result = validateBadgeParams({});
      
      expect(result.isValid).to.be.true;
      expect(result.params).to.have.property('leftText', 'paybadge');
      expect(result.params).to.have.property('rightText', 'crypto');
    });

    it('should validate custom text parameters', () => {
      const result = validateBadgeParams({
        leftText: 'donate',
        rightText: 'bitcoin'
      });
      
      expect(result.isValid).to.be.true;
      expect(result.params.leftText).to.equal('donate');
      expect(result.params.rightText).to.equal('bitcoin');
    });

    it('should sanitize potentially dangerous input', () => {
      const result = validateBadgeParams({
        leftText: '<script>alert("xss")</script>',
        rightText: 'crypto'
      });
      
      expect(result.isValid).to.be.true;
      expect(result.params.leftText).to.not.include('<script>');
    });

    it('should reject excessively long text', () => {
      const longText = 'a'.repeat(100);
      const result = validateBadgeParams({
        leftText: longText
      });
      
      expect(result.isValid).to.be.false;
      expect(result.error).to.include('too long');
    });
  });

  describe('createSVGResponse', () => {
    it('should create proper HTTP response headers', () => {
      const response = createSVGResponse('<svg></svg>');
      
      expect(response).to.have.property('headers');
      expect(response.headers['Content-Type']).to.equal('image/svg+xml');
      expect(response.headers['Cache-Control']).to.include('public');
      expect(response.headers['Access-Control-Allow-Origin']).to.equal('*');
    });

    it('should include SVG content in body', () => {
      const svgContent = '<svg><text>test</text></svg>';
      const response = createSVGResponse(svgContent);
      
      expect(response.body).to.equal(svgContent);
    });
  });
});