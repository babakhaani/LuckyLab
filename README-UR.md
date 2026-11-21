# LuckyLab — Wallet-connected practice games (Urdu/English)

یہ ZIP ایک نیا، قابلِ ترمیم LuckyLab starter project ہے۔ اسے موجودہ ویب سائٹ کا مکمل TronPick clone یا production gambling platform نہ سمجھیں۔

## شامل چیزیں
- Responsive LuckyLab dark UI
- چار local practice games: Dice, Mines, Crash, Plinko
- TronLink provider detection اور wallet connection
- Connected wallet کا Nile balance read/refresh
- Local browser signup/login (صرف اسی browser میں)
- My Bets اور All Bets activity feed
- Sample activity کی ہر row پر `SAMPLE` label
- Deposit / Withdraw buttons، مگر واضح طور پر locked

## اہم حدود
1. گیمز practice points استعمال کرتی ہیں؛ کوئی TRX wager یا payout نہیں ہوتا۔
2. All Bets میں sample rows صاف طور پر DEMO ہیں؛ انہیں حقیقی صارفین کی activity ظاہر نہ کریں۔
3. Signup/login صرف browser localStorage practice ہے، محفوظ production authentication نہیں۔
4. Deposit/withdraw جان بوجھ کر فعال نہیں۔ اس کے لیے reviewed smart contract، deploy شدہ Nile contract address، transaction validation، access controls، اور independent security review درکار ہیں۔
5. یہ prototype TronPick سے وابستہ نہیں ہے اور اس کے لوگو/برانڈ/مواد کی نقل نہیں کرتا۔

## GitHub Pages پر اپ لوڈ
1. ZIP extract کریں۔
2. `index.html`, `style.css`, `app.js`, `README-UR.md` کو repository کے root میں upload کریں۔
3. اگر GitHub پوچھے تو existing files replace کریں۔
4. Commit changes کریں۔
5. GitHub Pages کو `main` branch اور `/(root)` پر رکھیں۔
6. تازہ deploy کے بعد site کو TronLink کے DApp browser میں کھولیں اور Nile Testnet منتخب کریں۔

## Files
- `index.html` — page structure
- `style.css` — design
- `app.js` — wallet read, practice account, game logic, practice activity

## Wallet troubleshooting
یہ site `window.tronLink` / `window.tronWeb` injected provider تلاش کرتی ہے۔ اسے TronLink کے DApp browser میں کھولیں، wallet unlock کریں، Nile Testnet منتخب کریں اور connection approve کریں۔ Balance صرف provider کے ذریعے read ہوتا ہے۔


## Add TRX بٹن
Header میں `Add TRX` بٹن موجود ہے۔ یہ فی الحال وضاحتی پیغام کھولتا ہے؛ یہ رقم وصول یا منتقل نہیں کرتا۔ حقیقی testnet deposit کے لیے reviewed smart contract اور اس کا درست deployed address لازمی ہے۔

## Activity کی درست وضاحت
All Bets میں دکھائی جانے والی غیر حقیقی مثالیں `SAMPLE` کے طور پر نشان زد ہیں؛ انہیں حقیقی صارفین کے bets کے طور پر ظاہر نہ کریں۔
