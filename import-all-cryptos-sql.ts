import { db } from './server/db';
import { mockCryptos } from './server/mock-cryptos';
import { eq } from 'drizzle-orm';
import { stocks } from './shared/schema';

async function importAllCryptos() {
  try {
    console.log('เริ่มต้นนำเข้าข้อมูลคริปโตจาก mockCryptos...');
    
    // ตรวจสอบจำนวนในฐานข้อมูลด้วย SQL ตรงๆ
    const existingCount = await db.execute(`SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto'`);
    
    console.log(`จำนวนคริปโตในฐานข้อมูล: ${existingCount[0].count} รายการ`);
    console.log(`จำนวนคริปโตใน mockCryptos: ${mockCryptos.length} รายการ`);
    
    // ลบคริปโตที่มีอยู่ก่อน
    console.log('กำลังลบข้อมูลคริปโตที่มีอยู่...');
    await db.delete(stocks).where(eq(stocks.asset_type, 'crypto'));
    
    // สร้างแถวข้อมูลใหม่จาก mockCryptos
    for (const crypto of mockCryptos) {
      try {
        // ตรวจสอบว่ามีอยู่แล้วหรือไม่
        const exists = await db.execute(`SELECT COUNT(*) FROM stocks WHERE symbol = '${crypto.symbol}'`);
        if (parseInt(exists[0].count) === 0) {
          await db.execute(`
            INSERT INTO stocks 
            (symbol, name, exchange, current_price, previous_close, change, change_percent, 
             logo_url, sector, description, asset_type, sentiment_score, sentiment_volume, sentiment_trend)
            VALUES 
            ('${crypto.symbol}', '${crypto.name}', 'CRYPTO', ${crypto.currentPrice}, ${crypto.previousClose}, 
             ${crypto.change}, ${crypto.changePercent}, '${crypto.logoUrl || ""}', 'Cryptocurrency', 
             '${crypto.description || crypto.name + " cryptocurrency"}', 'crypto', 
             ${Math.random() * 2 - 1}, ${Math.floor(Math.random() * 10000)}, 
             '${['bullish', 'bearish', 'neutral', 'mixed'][Math.floor(Math.random() * 4)]}')
          `);
          console.log(`เพิ่ม ${crypto.symbol} (${crypto.name}) สำเร็จ`);
        } else {
          console.log(`ข้าม ${crypto.symbol} เนื่องจากมีอยู่แล้ว`);
          
          // อัปเดตประเภทสินทรัพย์เป็น 'crypto' หากยังไม่ใช่
          await db.execute(`
            UPDATE stocks 
            SET asset_type = 'crypto' 
            WHERE symbol = '${crypto.symbol}' AND (asset_type IS NULL OR asset_type != 'crypto')
          `);
        }
      } catch (err) {
        console.error(`เกิดข้อผิดพลาดในการเพิ่ม ${crypto.symbol}:`, err);
      }
    }
    
    console.log(`นำเข้าข้อมูลคริปโตจำนวน ${mockCryptos.length} รายการสำเร็จ`);
    
    // เพิ่มคริปโตเพิ่มเติมจากไฟล์อื่น
    const additionalCryptos = [
      { symbol: 'TOMO', name: 'TomoChain', price: 1.32 },
      { symbol: 'HOT', name: 'Holo', price: 0.00231 },
      { symbol: 'BAT', name: 'Basic Attention Token', price: 0.2543 },
      { symbol: 'ZIL', name: 'Zilliqa', price: 0.0234 },
      { symbol: 'ONE', name: 'Harmony', price: 0.0145 },
      { symbol: 'SRM', name: 'Serum', price: 0.0978 },
      { symbol: 'ROSE', name: 'Oasis Network', price: 0.0934 },
      { symbol: 'HNT', name: 'Helium', price: 2.81 },
      { symbol: 'KSM', name: 'Kusama', price: 26.43 },
      { symbol: 'CELO', name: 'Celo', price: 0.687 },
      { symbol: 'BNT', name: 'Bancor', price: 0.432 },
      { symbol: 'QTUM', name: 'Qtum', price: 2.83 },
      { symbol: 'CELR', name: 'Celer Network', price: 0.0178 },
      { symbol: 'POLY', name: 'Polymath', price: 0.154 },
      { symbol: 'STORJ', name: 'Storj', price: 0.387 },
      { symbol: 'API3', name: 'API3', price: 1.42 },
      { symbol: 'ANKR', name: 'Ankr', price: 0.0243 },
      { symbol: 'REN', name: 'Ren', price: 0.0654 },
      { symbol: 'ICX', name: 'ICON', price: 0.192 },
      { symbol: 'CHZ', name: 'Chiliz', price: 0.0787 },
      { symbol: 'WOO', name: 'WOO Network', price: 0.327 },
      { symbol: 'QNT', name: 'Quant', price: 104.56 },
      { symbol: 'SNX', name: 'Synthetix', price: 2.87 },
      { symbol: 'IOTA', name: 'IOTA', price: 0.196 },
      { symbol: 'XNO', name: 'Nano', price: 0.765 },
      { symbol: 'FLUX', name: 'Flux', price: 0.534 }
    ];
    
    // เพิ่มข้อมูลเพิ่มเติม
    for (const crypto of additionalCryptos) {
      try {
        // ตรวจสอบว่ามีแล้วหรือไม่
        const existing = await db.execute(`SELECT COUNT(*) FROM stocks WHERE symbol = '${crypto.symbol}' AND asset_type = 'crypto'`);
        
        if (parseInt(existing[0].count) === 0) {
          // กำหนดราคาปิดล่าสุดและการเปลี่ยนแปลง
          const prevPrice = crypto.price * 0.97;
          const change = crypto.price - prevPrice;
          const changePercent = (change / prevPrice) * 100;
          
          await db.execute(`
            INSERT INTO stocks 
            (symbol, name, exchange, current_price, previous_close, change, change_percent, 
             sector, description, asset_type, sentiment_score, sentiment_volume, sentiment_trend)
            VALUES 
            ('${crypto.symbol}', '${crypto.name}', 'CRYPTO', ${crypto.price}, ${prevPrice.toFixed(8)}, 
             ${change.toFixed(8)}, ${changePercent.toFixed(2)}, 'Cryptocurrency', 
             '${crypto.name} cryptocurrency', 'crypto', 
             ${Math.random() * 2 - 1}, ${Math.floor(Math.random() * 10000)}, 
             '${['bullish', 'bearish', 'neutral', 'mixed'][Math.floor(Math.random() * 4)]}')
          `);
          console.log(`เพิ่ม ${crypto.symbol} (${crypto.name}) สำเร็จ`);
        } else {
          console.log(`ข้ามการเพิ่ม ${crypto.symbol} เนื่องจากมีอยู่แล้ว`);
        }
      } catch (err) {
        console.error(`ไม่สามารถเพิ่ม ${crypto.symbol}: ${err}`);
      }
    }
    
    // ตรวจสอบจำนวนใหม่อีกครั้ง
    const newCount = await db.execute(`SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto'`);
    
    console.log(`จำนวนคริปโตในฐานข้อมูลหลังจากการนำเข้า: ${newCount[0].count} รายการ`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าคริปโต:', error);
    throw error;
  }
}

// รันฟังก์ชั่นนำเข้าคริปโต
importAllCryptos()
  .then(() => {
    console.log('เสร็จสิ้นการนำเข้าคริปโตทั้งหมด');
    process.exit(0);
  })
  .catch(error => {
    console.error('เกิดข้อผิดพลาด:', error);
    process.exit(1);
  });