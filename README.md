# Aevum Flow

Spending limits for AI agents on QDay Aevum Testnet.

A simple wallet that lets you authorize AI agents to spend tUSD8 on your behalf, with daily spending limits.

## Features

- Deposit tUSD8 into a smart contract wallet
- Set daily spending limits for agent addresses
- Agents can send funds within their limit
- Real-time agent activity monitoring
- Simple assistant chat

## Contract

**SimpleWallet**  
`0xc2994c28C4732133BF30F77d6bBcb9BfC561a43b`

[View on Explorer](https://explorer-test.qday.info/address/0xc2994c28C4732133BF30F77d6bBcb9BfC561a43b)

**tUSD8 Token**  
`0x456569838f1d43009A91ebA4263147Afd7233483`

## How it works

1. Connect your wallet
2. Deposit tUSD8 into the contract
3. Set a daily limit for an agent address
4. The agent can spend up to that limit per day
5. Monitor activity from the dashboard

## Run locally

```bash
cd frontend
npm install
npm run dev

Network
Network: QDay Aevum Testnet
Chain ID: 44005
RPC: [rpc-test.qday.info](https://rpc-test.qday.info/)
Built for
Aevum Builder Challenge #1


