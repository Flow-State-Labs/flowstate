# Flow State Core

<p align="center">
  <img src="https://github.com/Flow-State-Labs/flowstate/blob/main/logo.png?raw=true" alt="flowstate logo" />
</p>

## The Superfluid Protocol

---

In short, the Superfluid protocol facilitates real-time streaming of EVM
compatible ERC20 and ERC777 tokens.

The smart contracts use changes in the `block.timestamp` to calculate balances
of accounts based on respective flowRates.

Events are emitted from the Superfluid smart contracts when a flow is created,
updated, or deleted.

## The Accounting Problem

---

These streams are becoming increasingly popular among DAOs and companies that
pay directly in EVM tokens.

The problem is that the balances are moving every new block, or every few
seconds.

## Enter the Flow State Engine

---

Flow State Core takes an array of flow update events and produces a virtualized
array of 'transfer amounts', aka the Flow State.

Effectively, a stream with a flowRate of 5 USDCx per day for a month (30 days)
can be virtualized as:

-   30 daily transfers of 5 USDCx
-   4 weekly transfers of 35 USDCx
-   1 monthly (30 days) transfer of 150 USDCx

The granuarity defaults to daily transfers if not specified, but streams can be
virtualized daily, weekly, monthly, and anually
