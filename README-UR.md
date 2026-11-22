# Lucky Lab — GitHub Upload

## شامل فائلیں
- `index.html` — ویب سائٹ کا صفحہ
- `style.css` — responsive/mobile styling
- `app.js` — account UI، Dice/Crash/Mines، All Bets، My Bets، wallet request UI

## GitHub Pages پر چلانا
1. GitHub میں نئی repository بنائیں۔
2. ان چاروں فائلوں کو repository کے root میں upload کریں۔
3. Settings → Pages → Deploy from branch → `main` اور `/ (root)` منتخب کریں۔
4. چند منٹ بعد GitHub Pages URL کھولیں۔

## ضروری Production نوٹ
یہ پیکج مکمل browser-side starter ہے اور اس کی account/balance/bet معلومات browser `localStorage` میں رہتی ہیں۔ یہ production authentication، حقیقی TRX deposits/withdrawals، blockchain confirmation، یا server-side bet settlement نہیں ہے۔ حقیقی رقم کے لیے backend API، database، secure password hashing، payment provider/wallet integration، transaction verification، withdrawal review، rate limiting، اور قانونی/عمر کی پابندیوں کی جانچ ضروری ہے۔ براہِ کرم browser-side balance کو حقیقی رقم کے طور پر استعمال نہ کریں۔

## اہم
`app.js` میں client-side login صرف اس browser کے لیے ہے؛ مختلف devices پر account sync نہیں ہوتا۔ حقیقی users اور bets کے لیے backend بنانا لازم ہے۔
