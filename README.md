# 👻 Hyena

**The first P2P digital marketplace combining ZK-Proofs for Private Identities along with stealth payments for complete privacy and trust.**

## 🎯 The Problem

Traditional P2P marketplaces face a critical dilemma:

- **Trust**: How do you verify sellers without compromising privacy?
- **Privacy**: How do you protect financial transactions from surveillance?
- **Security**: How do you prevent fraud while maintaining anonymity?

Current solutions force users to choose between trust and privacy. **We solved both.**

## 🚀 Our Solution

Hyena introduces **Verified Anonymous E-Commerce** - a revolutionary approach that combines:

### 🔐 Zero-Knowledge Identity Verification

- **Aadhaar-based verification** using Self SDK
- Proves identity elements like Uniqueness, Age & Region without revealing personal information
- One-time verification, permanent trust score

### 👻 Stealth Payment System

- **Complete financial privacy** using ERC-5564 stealth addresses
- Payments are untraceable to external observers
- Easy to Use using in Built Stealth Management

### 🛡️ Smart Contract Escrow

- **Trustless transactions** with automatic fund release
- PYUSD-based payments for stability
- Buyer & Seller protection with refund mechanisms

###    PYUSD For Payments

- **Easy onboarding for PayPal users → mass crypto adoption**
- **Smooth Web2 → Web3 transition**
- **Market expansion for PayPal**

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Aadhaar ZK    │    │  Smart Contract  │    │ Stealth Payment │
│  Verification   │────│     Escrow       │────│     System      │
│                 │    │                  │    │                 │
│ • Identity Proof│    │ • Fund Security  │    │ • Private Txns  │
│ • Anonymous     │    │ • Buyer Protection│    │ • Unlinkable    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔄 Workflow

### **Seller Journey**

1. **Identity Verification**: Generate zero-knowledge proof using Aadhaar without revealing PII
2. **Stealth Key Generation**: Create spending/viewing key pairs for private payment reception
3. **Listing Creation**: Deploy escrow contract with API key and stealth meta-address
4. **Payment Reception**: Receive funds privately via generated stealth addresses

### **Buyer Journey**

1. **Browse Verified Listings**: View services from Aadhaar-verified sellers
2. **Escrow Funding**: Lock PYUSD in smart contract with MetaMask transaction
3. **API Access**: Retrieve service credentials from escrow after payment
4. **Transaction Completion**: Confirm receipt to release funds to seller's stealth address

### **Smart Contract Flow**

```
Create Escrow → Fund Escrow → Access API → Confirm Receipt → Release to Stealth
     ↓              ↓            ↓             ↓              ↓
  [CREATED]     [LOCKED]    [API_ACCESS]  [CONFIRMED]    [COMPLETED]
```

## 🧠 Technical Concepts

### **Zero-Knowledge Identity Verification**

- **Self SDK Integration**: Generates cryptographic proofs of Indian citizenship without revealing personal data
- **Nullifier System**: Prevents double-verification while maintaining anonymity
- **On-Chain Verification**: Smart contracts validate ZK proofs without accessing sensitive information

### **Stealth Address Implementation**

- **ERC-5564 Standard**: Implements standardized stealth address protocol
- **Key Derivation**: Uses ECDH (Elliptic Curve Diffie-Hellman) for shared secret generation
- **Payment Privacy**: Each transaction uses a unique, unlinkable address
- **Scanning Mechanism**: Sellers can detect payments using viewing keys without revealing spending keys

### **Escrow Smart Contract Design**

- **State Machine Pattern**: Implements secure state transitions (Created → Locked → Completed)
- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard for security
- **Time-locked Refunds**: Automatic refund mechanism after deadline expiry
- **Gas Optimization**: Efficient storage patterns and minimal external calls

### **Privacy-Preserving Architecture**

- **Metadata Protection**: Transaction amounts and recipients are cryptographically hidden
- **Unlinkability**: External observers cannot connect multiple transactions to same user
- **Forward Secrecy**: Compromised keys don't reveal historical transaction data

## ✨ Key Features

- **🔒 Privacy-First**: Stealth addresses ensure transaction privacy
- **✅ Trust Without KYC**: Zero-knowledge Aadhaar verification
- **🛡️ Escrow Protection**: Smart contract-based fund security
- **💰 Stable Payments**: PYUSD integration for price stability
- **🌐 Decentralized**: No central authority controls your data



## 🚀 Future Roadmap

### Phase 1: Enhanced Privacy 

- Multi-chain deployment (Polygon, Arbitrum)
- Advanced stealth payment features
- Mobile app development

### Phase 2: Ecosystem Growth 

- API marketplace expansion
- Reputation system integration
- Developer SDK release


## �️F Technical Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum (Sepolia), Solidity smart contracts
- **Privacy**: Anon Aadhaar SDK, Fluidkey Stealth Account Kit
- **Payments**: PYUSD stablecoin integration
- **Storage**: Supabase, 

---

**GhostPalace isn't just another marketplace - it's the future of private, verified commerce.**

_Built with ❤️ for the future of decentralized commerce_
