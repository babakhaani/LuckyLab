# LuckyLab — TRON Nile Testnet Starter

This branch/package redesigns the current static LuckyLab practice app into a three-game interface:
- Dice
- Mines
- Crash

## Important current limitations
- Game rounds are browser-side simulations using local demo credits. They are not on-chain wagers.
- TronLink connection attempts to read the active account and TRX balance. Switch TronLink to **Nile Testnet** first.
- Deposit and withdrawal are intentionally disabled. No contract address has been supplied or deployed.
- Do not send TRX to a wallet address manually. Deposits/withdrawals should only be enabled after a reviewed smart contract, correct Nile deployment, and tested accounting/withdrawal flow.
- Browser-side `Math.random()` is not secure or verifiable randomness. It must not decide real-value games.

## Run
Open `index.html` in a browser, or deploy the three files to a static host.

## Next engineering phase for real Nile testnet transfers
1. Design and review a Solidity game-bank contract with owner/admin controls and withdrawal limits.
2. Use verifiable randomness (for example, a suitable oracle/VRF flow) for game outcomes; never use client-side randomness for value-bearing games.
3. Deploy and test the contract on Nile Testnet.
4. Add the verified contract address and ABI, implement deposit/withdraw calls, event indexing, transaction confirmations, and server-side history.
5. Add secure account/session handling and rate limiting. Never store private keys or seed phrases in the website.

The current starter does not implement steps 1–5 and must not be presented as a live-money casino.
