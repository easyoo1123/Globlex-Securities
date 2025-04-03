-- เพิ่มคริปโตอื่นๆ ที่ยังไม่มีในฐานข้อมูล
DO $$
DECLARE
    crypto_record RECORD;
BEGIN
    FOR crypto_record IN
        SELECT * FROM (VALUES
            ('SHIB', 'Shiba Inu', 0.000021, 0.000020, 0.000001, 5.00),
            ('ADA', 'Cardano', 0.45, 0.44, 0.01, 2.27),
            ('DOT', 'Polkadot', 6.50, 6.30, 0.20, 3.17),
            ('SOL', 'Solana', 145.30, 140.50, 4.80, 3.42),
            ('AVAX', 'Avalanche', 34.20, 33.15, 1.05, 3.17),
            ('LINK', 'Chainlink', 13.75, 13.30, 0.45, 3.38),
            ('MATIC', 'Polygon', 0.66, 0.64, 0.02, 3.13),
            ('UNI', 'Uniswap', 9.50, 9.20, 0.30, 3.26),
            ('AAVE', 'Aave', 84.10, 81.50, 2.60, 3.19),
            ('CRO', 'Cronos', 0.11, 0.10, 0.01, 10.00),
            ('LTC', 'Litecoin', 75.30, 73.10, 2.20, 3.01),
            ('BCH', 'Bitcoin Cash', 357.50, 346.80, 10.70, 3.09),
            ('ATOM', 'Cosmos', 8.90, 8.60, 0.30, 3.49),
            ('VET', 'VeChain', 0.032, 0.031, 0.001, 3.23),
            ('ALGO', 'Algorand', 0.15, 0.145, 0.005, 3.45),
            ('XLM', 'Stellar', 0.11, 0.106, 0.004, 3.77),
            ('ETC', 'Ethereum Classic', 18.60, 18.00, 0.60, 3.33),
            ('FIL', 'Filecoin', 4.80, 4.65, 0.15, 3.23),
            ('ICP', 'Internet Computer', 11.20, 10.85, 0.35, 3.23),
            ('NEAR', 'NEAR Protocol', 4.30, 4.15, 0.15, 3.61),
            ('FTM', 'Fantom', 0.68, 0.66, 0.02, 3.03),
            ('TOMO', 'TomoChain', 1.32, 1.28, 0.04, 3.13),
            ('HOT', 'Holo', 0.01, 0.0097, 0.0003, 3.09),
            ('BAT', 'Basic Attention Token', 0.25, 0.24, 0.01, 4.17),
            ('ZIL', 'Zilliqa', 0.023, 0.022, 0.001, 4.55),
            ('ONE', 'Harmony', 0.014, 0.0135, 0.0005, 3.70),
            ('SRM', 'Serum', 0.099, 0.096, 0.003, 3.13),
            ('ROSE', 'Oasis Network', 0.093, 0.09, 0.003, 3.33),
            ('HNT', 'Helium', 2.75, 2.65, 0.10, 3.77),
            ('KSM', 'Kusama', 26.50, 25.70, 0.80, 3.11),
            ('CELO', 'Celo', 0.68, 0.66, 0.02, 3.03),
            ('BNT', 'Bancor', 0.43, 0.415, 0.015, 3.61),
            ('QTUM', 'Qtum', 2.85, 2.76, 0.09, 3.26),
            ('CELR', 'Celer Network', 0.017, 0.0165, 0.0005, 3.03),
            ('POLY', 'Polymath', 0.154, 0.149, 0.005, 3.36),
            ('STORJ', 'Storj', 0.39, 0.377, 0.013, 3.45),
            ('API3', 'API3', 1.45, 1.40, 0.05, 3.57),
            ('ANKR', 'Ankr', 0.024, 0.0232, 0.0008, 3.45),
            ('REN', 'Ren', 0.065, 0.063, 0.002, 3.17),
            ('ICX', 'ICON', 0.19, 0.184, 0.006, 3.26),
            ('CHZ', 'Chiliz', 0.078, 0.0755, 0.0025, 3.31),
            ('WOO', 'WOO Network', 0.33, 0.32, 0.01, 3.13),
            ('QNT', 'Quant', 103.50, 100.20, 3.30, 3.29),
            ('SNX', 'Synthetix', 2.85, 2.76, 0.09, 3.26),
            ('IOTA', 'IOTA', 0.19, 0.184, 0.006, 3.26),
            ('XNO', 'Nano', 0.77, 0.745, 0.025, 3.36),
            ('FLUX', 'Flux', 0.53, 0.513, 0.017, 3.31)
        ) AS t (symbol, name, current_price, previous_close, change, change_percent)
    LOOP
        -- ตรวจสอบว่ามีอยู่แล้วหรือไม่
        IF NOT EXISTS (SELECT 1 FROM stocks WHERE symbol = crypto_record.symbol) THEN
            -- เพิ่มข้อมูลคริปโต
            INSERT INTO stocks (
                symbol, name, exchange, current_price, previous_close, 
                change, change_percent, sector, description, asset_type, 
                sentiment_score, sentiment_volume, sentiment_trend
            ) VALUES (
                crypto_record.symbol, 
                crypto_record.name, 
                'CRYPTO', 
                crypto_record.current_price, 
                crypto_record.previous_close, 
                crypto_record.change, 
                crypto_record.change_percent, 
                'Cryptocurrency', 
                crypto_record.name || ' cryptocurrency', 
                'crypto', 
                (random() * 2 - 1), 
                floor(random() * 10000), 
                (ARRAY['bullish', 'bearish', 'neutral', 'mixed'])[floor(random() * 4 + 1)]
            );
            RAISE NOTICE 'เพิ่ม %: % สำเร็จ', crypto_record.symbol, crypto_record.name;
        ELSE
            -- ปรับปรุงข้อมูลเป็นประเภทคริปโต
            UPDATE stocks 
            SET asset_type = 'crypto' 
            WHERE symbol = crypto_record.symbol;
            RAISE NOTICE 'ปรับปรุง %: % เป็นประเภทคริปโต', crypto_record.symbol, crypto_record.name;
        END IF;
    END LOOP;
END $$;

-- ตรวจสอบคริปโตทั้งหมด
SELECT COUNT(*) FROM stocks WHERE asset_type = 'crypto';
