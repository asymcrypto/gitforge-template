# 💳 GitForge Paymentor Integration Guide

**Decentralized Payment Processing for Global Contributors**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why Paymentor?](#why-paymentor)
3. [Supported Payment Methods](#supported-payment-methods)
4. [Setup Instructions](#setup-instructions)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

GitForge now uses **Paymentor** as its primary payment processor, enabling:

- ✅ **Decentralized Crypto Payments:** Direct wallet-to-wallet transfers (USDC, USDT, ETH, etc.)
- ✅ **Global Fiat Support:** Bank transfers, ACH, SEPA, SWIFT
- ✅ **Zero KYC Friction:** Lower barriers to entry for global contributors
- ✅ **Multi-Network Support:** Ethereum, Polygon, Arbitrum, Optimism, Solana, and more
- ✅ **Low Fees:** 1% for crypto, 2% for fiat (vs. 2-3% for traditional processors)
- ✅ **Instant Settlements:** Crypto payments settle in minutes, fiat in 24-48 hours

---

## 🤔 Why Paymentor?

### **The Problem with Flutterwave**
- ❌ Requires extensive KYC documentation
- ❌ Limited to specific regions
- ❌ High compliance overhead
- ❌ Slow onboarding process
- ❌ Not aligned with Web3/DAO ethos

### **The Paymentor Solution**
- ✅ **Web3-Native:** Built for decentralized payments
- ✅ **Global Reach:** Supports 150+ countries
- ✅ **Lower KYC:** Simplified verification for crypto
- ✅ **Fast Onboarding:** Contributors can start earning immediately
- ✅ **Flexible:** Crypto, fiat, or hybrid payments
- ✅ **Developer-Friendly:** Clean API, excellent documentation

---

## 💰 Supported Payment Methods

### **Cryptocurrency (1% Fee)**

| Token | Networks | Use Case |
|-------|----------|----------|
| **USDC** | Ethereum, Polygon, Arbitrum, Optimism, Solana | Stablecoin, preferred for most payouts |
| **USDT** | Ethereum, Polygon, Tron, Solana | Alternative stablecoin |
| **ETH** | Ethereum | For developers who prefer ETH |
| **MATIC** | Polygon | For Polygon ecosystem contributors |
| **SOL** | Solana | For Solana ecosystem contributors |
| **BNB** | Binance | For BSC ecosystem contributors |

**Advantages:**
- Instant settlement (minutes)
- No bank account required
- Transparent on-chain verification
- Self-custody (contributor controls funds)

### **Fiat Currencies (2% Fee)**

| Currency | Region | Method |
|----------|--------|--------|
| **USD** | Worldwide | ACH, Wire Transfer |
| **EUR** | Europe | SEPA, SWIFT |
| **GBP** | UK | Faster Payments, SWIFT |
| **NGN** | Nigeria | Local Bank Transfer |
| **KES** | Kenya | M-Pesa, Bank Transfer |
| **ZAR** | South Africa | EFT, Bank Transfer |

**Advantages:**
- Traditional banking integration
- No crypto wallet required
- Familiar to non-technical contributors
- Regulatory compliance built-in

---

## 🚀 Setup Instructions

### **Step 1: Get Paymentor API Keys**

1. Sign up at [Paymentor.io](https://paymentor.io)
2. Complete business verification
3. Generate API keys from dashboard
4. Copy your `PAYMENTOR_API_KEY`

### **Step 2: Configure Environment Variables**

Create a `.env` file in the repository root:

```bash
# Paymentor Configuration
PAYMENTOR_API_KEY=your_api_key_here
PAYMENTOR_SECRET_KEY=your_secret_key_here
PAYMENTOR_WEBHOOK_SECRET=your_webhook_secret

# Default Payment Settings
DEFAULT_PAYMENT_METHOD=crypto  # or 'fiat'
DEFAULT_CRYPTO_TOKEN=USDC
DEFAULT_NETWORK=polygon
DEFAULT_FIAT_CURRENCY=USD

# Fee Configuration
CRYPTO_FEE_PERCENT=1.0
FIAT_FEE_PERCENT=2.0
MIN_PAYOUT_AMOUNT=10
MAX_PAYOUT_AMOUNT=50000
```

### **Step 3: Update GitHub Secrets**

Add the following secrets to your GitHub repository:

1. Go to **Settings > Secrets and variables > Actions**
2. Add new repository secrets:
   - `PAYMENTOR_API_KEY`
   - `PAYMENTOR_SECRET_KEY`
   - `PAYMENTOR_WEBHOOK_SECRET`

### **Step 4: Update Workflows**

Update `.github/workflows/bounty-payout.yml`:

```yaml
- name: Process Payout with Paymentor
  env:
    PAYMENTOR_API_KEY: ${{ secrets.PAYMENTOR_API_KEY }}
  run: |
    node .github/scripts/payout_processor_paymentor.js \
      --contributor ${{ github.event.pull_request.user.login }} \
      --amount ${{ env.BOUNTY_AMOUNT }} \
      --method crypto \
      --token USDC \
      --network polygon
```

---

## 🔌 API Reference

### **PaymentorIntegration Class**

#### **Initialize Payment**

```javascript
const paymentor = new PaymentorIntegration(apiKey);

const result = await paymentor.initializePayment({
  contributor_username: 'john-developer',
  amount: 250,
  currency: 'USD',
  payment_method: 'crypto',
  network: 'polygon',
  wallet_address: '0x1234...',
  pr_number: 42
});

// Result:
// {
//   success: true,
//   transaction_id: 'PMT_1234567890',
//   status: 'pending',
//   payment_url: 'https://paymentor.io/pay/PMT_1234567890',
//   expires_at: '2025-11-10T11:32:23Z'
// }
```

#### **Process Crypto Payment**

```javascript
const result = await paymentor.processCryptoPayment({
  contributor_username: 'jane-designer',
  amount: 475,
  token: 'USDC',
  network: 'polygon',
  wallet_address: '0x5678...',
  pr_number: 43
});

// Result:
// {
//   success: true,
//   transaction_id: 'PMT_9876543210',
//   tx_hash: '0xabcd...',
//   status: 'confirmed',
//   amount_sent: 475,
//   network: 'polygon',
//   token: 'USDC',
//   timestamp: '2025-11-10T10:32:23Z'
// }
```

#### **Process Fiat Payment**

```javascript
const result = await paymentor.processFiatPayment({
  contributor_username: 'ali-raza',
  amount: 500,
  currency: 'USD',
  payment_method: 'ACH',
  bank_account: 'xxxx1234',
  pr_number: 44
});

// Result:
// {
//   success: true,
//   transaction_id: 'PMT_1111111111',
//   status: 'processing',
//   amount_sent: 500,
//   currency: 'USD',
//   estimated_arrival: '2025-11-11T10:32:23Z',
//   timestamp: '2025-11-10T10:32:23Z'
// }
```

#### **Get Payment Status**

```javascript
const status = await paymentor.getPaymentStatus('PMT_1234567890');

// Result:
// {
//   transaction_id: 'PMT_1234567890',
//   status: 'confirmed',
//   amount: 250,
//   currency: 'USDC',
//   timestamp: '2025-11-10T10:32:23Z'
// }
```

#### **Get Exchange Rate**

```javascript
const rate = await paymentor.getExchangeRate('USD', 'USDC');

// Result:
// {
//   from: 'USD',
//   to: 'USDC',
//   rate: 1.0,
//   timestamp: '2025-11-10T10:32:23Z'
// }
```

#### **Verify Wallet Address**

```javascript
const verification = await paymentor.verifyWalletAddress(
  '0x1234567890123456789012345678901234567890',
  'ethereum'
);

// Result:
// {
//   address: '0x1234567890123456789012345678901234567890',
//   network: 'ethereum',
//   valid: true,
//   timestamp: '2025-11-10T10:32:23Z'
// }
```

---

## ⚙️ Configuration

### **Default Configuration**

Edit `github/BOUNTY_CONFIG.json`:

```json
{
  "payment_processor": "paymentor",
  "default_payment_method": "crypto",
  "default_crypto_token": "USDC",
  "default_network": "polygon",
  "default_fiat_currency": "USD",
  "transaction_fee_percent": 1.0,
  "min_payout_amount": 10,
  "max_payout_amount": 50000,
  "auto_convert_to_usd": true
}
```

### **Per-Contributor Configuration**

Store contributor preferences in `EQUITY_TRACKING.json`:

```json
{
  "github_username": "john-developer",
  "payment_preferences": {
    "method": "crypto",
    "token": "USDC",
    "network": "polygon",
    "wallet_address": "0x1234567890123456789012345678901234567890"
  }
}
```

---

## 🧪 Testing

### **Run Test Suite**

```bash
# Test Paymentor integration
node .github/scripts/paymentor_integration.js

# Output:
# 🚀 GitForge Paymentor Integration
# ==================================
# 
# Supported Payment Methods:
# {
#   "crypto": ["USDC", "USDT", "ETH", "MATIC", "SOL", "BNB"],
#   "fiat": ["USD", "EUR", "GBP", "NGN", "KES", "ZAR"],
#   "bank": ["ACH", "SEPA", "SWIFT"]
# }
# 
# ✅ Paymentor integration ready!
# Mode: MOCK (Testing)
```

### **Test Payout Processor**

```bash
# Test payout processing
node .github/scripts/payout_processor_paymentor.js

# Output:
# 💳 Processing payout for @john-developer
# Amount: 250 USD
# Method: crypto
# Fee (1%): $2.50
# Net Amount: $247.50
# ✅ Payout processed successfully!
# Transaction ID: PMT_1234567890_abcdef123
```

### **Mock Mode vs. Production**

The integration automatically detects the environment:

```javascript
// Mock mode (for testing)
const paymentor = new PaymentorIntegration();
// Uses simulated responses, no API calls

// Production mode (with API key)
const paymentor = new PaymentorIntegration(process.env.PAYMENTOR_API_KEY);
// Makes real API calls to Paymentor
```

---

## 🚀 Production Deployment

### **Step 1: Enable Production Mode**

```bash
# Set API key in GitHub Secrets
PAYMENTOR_API_KEY=pk_live_xxxxxxxxxxxxx
```

### **Step 2: Test with Real Transactions**

```bash
# Start with small test payouts
# Monitor transaction status in Paymentor dashboard
# Verify webhook receipts
```

### **Step 3: Enable Webhooks**

Configure webhook in Paymentor dashboard:

```
Webhook URL: https://github.com/[user]/[repo]/webhooks/paymentor
Events: payment.completed, payment.failed, payment.refunded
```

### **Step 4: Monitor and Optimize**

- Track transaction fees
- Monitor success rates
- Optimize network selection (Polygon is cheapest for USDC)
- Adjust fee percentages based on volume

---

## 🔒 Security Best Practices

### **API Key Management**

- ✅ Store API keys in GitHub Secrets
- ✅ Rotate keys regularly
- ✅ Use separate keys for test and production
- ✅ Never commit keys to repository

### **Wallet Verification**

- ✅ Always verify wallet addresses before payment
- ✅ Use `verifyWalletAddress()` for validation
- ✅ Require contributor to confirm wallet in UI
- ✅ Implement rate limiting on wallet changes

### **Transaction Auditing**

- ✅ Log all transactions in `PAYOUT_AUDIT.json`
- ✅ Include transaction hash for on-chain verification
- ✅ Store webhook receipts for reconciliation
- ✅ Implement dispute resolution process

---

## 📊 Monitoring & Analytics

### **View Transaction History**

```bash
# Check audit log
cat github/PAYOUT_AUDIT.json | jq '.entries[] | {contributor, amount_usd, status}'
```

### **Calculate Revenue**

```bash
# Total fees collected
cat github/PAYOUT_AUDIT.json | jq '.total_fees_collected'

# By payment method
cat github/PAYOUT_AUDIT.json | jq 'group_by(.payment_method) | map({method: .[0].payment_method, count: length, total_fees: map(.fee_usd) | add})'
```

---

## 🆘 Troubleshooting

### **Issue: "Invalid wallet address"**

**Solution:**
- Verify wallet format (0x... for Ethereum, different for other chains)
- Use `verifyWalletAddress()` before payment
- Check network compatibility

### **Issue: "Payment failed - insufficient balance"**

**Solution:**
- Check GitForge account balance in Paymentor dashboard
- Fund account with crypto or fiat
- Set up auto-funding if available

### **Issue: "Network not supported for token"**

**Solution:**
- Check `SUPPORTED_NETWORKS` for token
- Use default network (Polygon recommended)
- Contact Paymentor support for network additions

### **Issue: "Webhook not received"**

**Solution:**
- Verify webhook URL in Paymentor dashboard
- Check GitHub webhook logs
- Ensure firewall allows Paymentor IPs
- Test webhook manually in Paymentor dashboard

---

## 📞 Support

- **Paymentor Docs:** https://docs.paymentor.io
- **Paymentor Support:** support@paymentor.io
- **GitForge Issues:** https://github.com/asymcrypto/gitforge-template/issues
- **Discord:** [GitForge Community](https://discord.gg/gitforge)

---

## 🔄 Migration from Flutterwave

If you were previously using Flutterwave:

1. **Migrate existing payouts:** Contact Paymentor support for bulk migration
2. **Update contributor data:** Add wallet addresses to contributor profiles
3. **Test new workflows:** Run full test suite before production
4. **Communicate changes:** Notify contributors of new payment options
5. **Maintain audit trail:** Ensure all historical data is preserved

---

## 📈 Future Enhancements

- [ ] Multi-sig wallet support for security
- [ ] Automated staking/yield generation
- [ ] Recurring payment subscriptions
- [ ] NFT-based contributor badges
- [ ] DAO treasury integration
- [ ] Cross-chain bridge support

---

**Built with ❤️ for decentralized teams**

*Paymentor powers GitForge's global payment infrastructure*
