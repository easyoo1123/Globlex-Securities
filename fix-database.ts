import { db } from './server/db';
import { mockCryptos } from './server/mock-cryptos';
import { stocks } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixDatabase() {
  try {
    console.log('เริ่มต้นปรับปรุงฐานข้อมูล...');
    
    // ดูโครงสร้างของผลลัพธ์ที่ได้
    const cryptoCountResult = await db.execute(`SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto'`);
    console.log('โครงสร้างผลลัพธ์:', JSON.stringify(cryptoCountResult));
    
    // ใช้ SQL อย่างง่าย
    const cryptoCount = (await db.execute(`SELECT COUNT(*) as count FROM stocks WHERE asset_type = 'crypto'`))[0].count;
    console.log(`จำนวนคริปโตในฐานข้อมูล: ${cryptoCount} รายการ`);
    
    // ตรวจสอบจำนวนสินทรัพย์ทั้งหมด
    const totalCount = (await db.execute(`SELECT COUNT(*) as count FROM stocks`))[0].count;
    console.log(`จำนวนสินทรัพย์ทั้งหมดในฐานข้อมูล: ${totalCount} รายการ`);
    
    // ปรับปรุงข้อมูลที่ไม่มีประเภทสินทรัพย์ให้เป็น 'stock'
    await db.execute(`UPDATE stocks SET asset_type = 'stock' WHERE asset_type IS NULL OR asset_type = ''`);
    console.log('ปรับปรุงข้อมูลที่ไม่มีประเภทสินทรัพย์เป็น stock สำเร็จ');
    
    // เพิ่มคริปโตจาก mockCryptos
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const crypto of mockCryptos) {
      try {
        // ตรวจสอบว่ามีอยู่แล้วหรือไม่
        const existsResult = await db.execute(`SELECT id FROM stocks WHERE symbol = $1`, [crypto.symbol]);
        
        if (existsResult.rows.length === 0) {
          // เพิ่มใหม่
          await db.execute(`
            INSERT INTO stocks 
            (symbol, name, exchange, current_price, previous_close, change, change_percent, 
             logo_url, sector, description, asset_type, sentiment_score, sentiment_volume, sentiment_trend)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [
            crypto.symbol,
            crypto.name,
            'CRYPTO',
            crypto.currentPrice,
            crypto.previousClose,
            crypto.change,
            crypto.changePercent,
            crypto.logoUrl || '',
            'Cryptocurrency',
            crypto.description || `${crypto.name} cryptocurrency`,
            'crypto',
            Math.random() * 2 - 1,
            Math.floor(Math.random() * 10000),
            ['bullish', 'bearish', 'neutral', 'mixed'][Math.floor(Math.random() * 4)]
          ]);
          addedCount++;
        } else {
          // อัปเดตเป็นประเภท crypto
          await db.execute(`
            UPDATE stocks 
            SET asset_type = 'crypto' 
            WHERE symbol = $1 AND (asset_type IS NULL OR asset_type != 'crypto')
          `, [crypto.symbol]);
          skippedCount++;
        }
      } catch (err) {
        console.error(`เกิดข้อผิดพลาดกับ ${crypto.symbol}:`, err);
        errorCount++;
      }
    }
    
    console.log(`เพิ่มคริปโตใหม่: ${addedCount} รายการ`);
    console.log(`ข้ามเนื่องจากมีอยู่แล้ว: ${skippedCount} รายการ`);
    console.log(`เกิดข้อผิดพลาด: ${errorCount} รายการ`);
    
    // ตรวจสอบผลลัพธ์
    const finalCryptoCountResult = await db.execute(`SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto'`);
    const finalCryptoCount = parseInt(finalCryptoCountResult.rows[0].count.toString());
    console.log(`จำนวนคริปโตในฐานข้อมูลหลังปรับปรุง: ${finalCryptoCount} รายการ`);
    
    // ตรวจสอบคริปโตทั้งหมด
    const allCryptos = await db.execute(`SELECT symbol, name FROM stocks WHERE asset_type = 'crypto' ORDER BY symbol`);
    console.log('รายการคริปโตในฐานข้อมูล:');
    for (const row of allCryptos.rows) {
      console.log(`${row.symbol}: ${row.name}`);
    }
    
    console.log('การปรับปรุงฐานข้อมูลเสร็จสิ้น');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการปรับปรุงฐานข้อมูล:', error);
  }
}

// รันฟังก์ชั่น
fixDatabase()
  .then(() => {
    console.log('เสร็จสิ้นโปรแกรม');
    process.exit(0);
  })
  .catch(error => {
    console.error('เกิดข้อผิดพลาด:', error);
    process.exit(1);
  });