-- แก้ไขประเภทของคริปโตที่มีอยู่แล้ว
UPDATE stocks SET asset_type = 'crypto' WHERE symbol IN ('ETH', 'XRP', 'DOGE');

-- ตรวจสอบคริปโตที่มีอยู่แล้ว
SELECT symbol, name, asset_type FROM stocks WHERE asset_type = 'crypto' OR symbol IN ('ETH', 'XRP', 'DOGE', 'BTC');
