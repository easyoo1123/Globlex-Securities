import { db } from './server/db';
import { stocks } from './shared/schema';
import { log } from './server/vite';
import { eq } from 'drizzle-orm';
import { mockCryptos } from './server/mock-cryptos';

// ฟังก์ชั่นเพิ่มคริปโตในฐานข้อมูล
async function importAllCryptos() {
  try {
    console.log('เริ่มต้นนำเข้าข้อมูลคริปโตจาก mockCryptos...');
    
    // ตรวจสอบจำนวนในฐานข้อมูล
    const existingCount = await db.execute(`SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto'`);
    
    console.log(`จำนวนคริปโตในฐานข้อมูล: ${existingCount.rows[0].count} รายการ`);
    console.log(`จำนวนคริปโตใน mockCryptos: ${mockCryptos.length} รายการ`);
    
    // ลบคริปโตที่มีอยู่ก่อน
    console.log('กำลังลบข้อมูลคริปโตที่มีอยู่...');
    await db.delete(stocks).where(eq(stocks.asset_type, 'crypto'));
    
    // สร้างแถวข้อมูลใหม่จาก mockCryptos
    const cryptoValues = mockCryptos.map(crypto => ({
      symbol: crypto.symbol,
      name: crypto.name,
      exchange: 'CRYPTO',
      currentPrice: crypto.currentPrice,
      previousClose: crypto.previousClose,
      change: crypto.change,
      changePercent: crypto.changePercent,
      logoUrl: crypto.logoUrl,
      sector: 'Cryptocurrency',
      description: crypto.description || `${crypto.name} cryptocurrency`,
      asset_type: 'crypto',
      sentimentScore: Math.random() * 2 - 1, // -1 ถึง 1
      sentimentVolume: Math.floor(Math.random() * 10000),
      sentimentTrend: ['bullish', 'bearish', 'neutral', 'mixed'][Math.floor(Math.random() * 4)],
    }));
    
    // เพิ่มข้อมูลคริปโต
    await db.insert(stocks).values(cryptoValues);
    
    console.log(`นำเข้าข้อมูลคริปโตจำนวน ${cryptoValues.length} รายการสำเร็จ`);
    
    // เรียกใช้งานไฟล์ add-more-cryptos.ts เพื่อเพิ่มคริปโตเพิ่มเติม
    const { addMoreCryptosToDatabase } = require('./add-more-cryptos');
    await addMoreCryptosToDatabase();
    
    // ตรวจสอบจำนวนใหม่อีกครั้ง
    const newCount = await db.execute(`SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto'`);
    
    console.log(`จำนวนคริปโตในฐานข้อมูลหลังจากการนำเข้า: ${newCount.rows[0].count} รายการ`);
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