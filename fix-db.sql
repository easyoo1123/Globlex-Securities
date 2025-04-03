-- แสดงจำนวนคริปโตในฐานข้อมูล
SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto';

-- ตั้งค่าข้อมูลสต็อกที่ไม่มีประเภทให้เป็น 'stock'
UPDATE stocks SET asset_type = 'stock' WHERE asset_type IS NULL OR asset_type = '';

-- ตรวจสอบว่ามีประเภทสินทรัพย์อะไรบ้าง
SELECT asset_type, COUNT(*) FROM stocks GROUP BY asset_type;

-- ดูจำนวนทั้งหมด
SELECT COUNT(*) FROM stocks;
