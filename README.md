# 💰 PayBadge - Crypto Payment Badge for GitHub

A sleek, professional payment badge system for accepting cryptocurrency donations directly from your GitHub README files.

[![Crypto Payment](https://paybadge.profullstack.com/badge-large.svg)](https://paybadge.profullstack.com/?tickers=btc%2Ceth%2Csol%2Cusdc)

## 🚀 Quick Start

Add a crypto payment badge to your GitHub README by copying one of the code blocks below:

### Basic Payment Badge

```markdown
[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/)
```

### Custom Single Cryptocurrency

```markdown
[![Bitcoin Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=btc)
```

## 📋 Supported Query Parameters

The payment system supports the following URL parameters for customization:

### 1. Single Cryptocurrency (`ticker`)

Restrict payments to a single cryptocurrency:

**Bitcoin Only:**
```markdown
[![Bitcoin Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=btc)
```

**Ethereum Only:**
```markdown
[![Ethereum Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=eth)
```

**Solana Only:**
```markdown
[![Solana Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=sol)
```

**USDC Only:**
```markdown
[![USDC Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=usdc)
```

### 2. Multiple Cryptocurrencies (`tickers`)

Allow payments with multiple cryptocurrencies:

**Bitcoin and Ethereum:**
```markdown
[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc,eth)
```

**All Supported Cryptos:**
```markdown
[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc,eth,sol,usdc)
```

**Stablecoins Only:**
```markdown
[![Stablecoin Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=usdc)
```

### 3. Custom Recipient Address (`recipient_address`)

Use your own wallet address (works with single ticker only):

**Bitcoin with Custom Address:**
```markdown
[![Bitcoin Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=btc&recipient_address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh)
```

**Ethereum with Custom Address:**
```markdown
[![Ethereum Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=eth&recipient_address=0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b)
```

### 4. Multiple Custom Addresses (`recipient_addresses`)

Specify different addresses for different cryptocurrencies:

**Multiple Cryptos with Custom Addresses:**
```markdown
[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc,eth,usdc&recipient_addresses=btc:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh,eth:0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b,usdc:0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b)
```

## 🎨 Badge Customization

### Different Badge Styles

You can create different badge styles for different purposes:

**Donation Badge:**
```markdown
[![Donate with Crypto](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc,eth)
```

**Support Badge:**
```markdown
[![Support this Project](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc,eth,sol,usdc)
```

**Tip Badge:**
```markdown
[![Tip with Bitcoin](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=btc&recipient_address=your-btc-address)
```

## 🔧 Advanced Examples

### Complete Project Setup

Here's how you might set up payment badges for a complete project:

```markdown
# My Awesome Project

## Support This Project

If you find this project helpful, consider supporting it with cryptocurrency:

### Quick Donation

[![Crypto Payment](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc%2Ceth%2Csol%2Cusdc)


### Specific Cryptocurrencies

| Cryptocurrency | Badge | Address |
|----------------|-------|---------|
| Bitcoin | [![Bitcoin](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=btc&recipient_address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh) | `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` |
| Ethereum | [![Ethereum](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=eth&recipient_address=0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b) | `0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b` |
| USDC | [![USDC](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=usdc&recipient_address=0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b) | `0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b` |
```

### Developer-Friendly Setup

For developers who want to make it easy for users to support their work:

```markdown
## 💝 Support Development

Love this project? Support continued development:

**One-Click Crypto Donation:**
[![Support Development](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?tickers=btc,eth,sol,usdc&recipient_addresses=btc:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh,eth:0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b,sol:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM,usdc:0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b)

**Prefer Bitcoin?**
[![Bitcoin Only](https://paybadge.profullstack.com/badge.svg)](https://paybadge.profullstack.com/?ticker=btc&recipient_address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh)
```

## 🌟 Supported Cryptocurrencies

| Symbol | Name | Default Address |
|--------|------|-----------------|
| `btc` | Bitcoin | `19d1LpzVVkmFihCwKnKdN9ZEZyAasqsVPJ` |
| `eth` | Ethereum | `0x3b5366CC2C35eE227Aa8ac409D9A56638CA53FA8` |
| `sol` | Solana | `HdDcXrJytuAJZpLkd42iE7RALo26z1fMKEh7p5McEPRY` |
| `usdc` | USD Coin | `0x3b5366CC2C35eE227Aa8ac409D9A56638CA53FA8` |

## 🔒 Security Features

- **QR Code Generation**: Automatic QR codes for mobile wallet scanning
- **Address Validation**: Built-in validation for wallet addresses
- **Secure Payment Flow**: No private keys or sensitive data stored
- **Blockchain Verification**: Real-time payment verification via blockchain APIs

## 📱 Mobile-Friendly

The payment interface is fully responsive and optimized for mobile devices, making it easy for supporters to donate from any device.

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript (ES2024+)
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **QR Codes**: Dynamic generation using QRCode.js
- **Blockchain APIs**: Integration with major blockchain explorers
- **Accessibility**: Full ARIA support and keyboard navigation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

[![Crypto Payment](https://paybadge.profullstack.com/badge-large.svg)](https://paybadge.profullstack.com/?tickers=btc%2Ceth%2Csol%2Cusdc)

**Made with ❤️ for the crypto community**