const pg = require('pg');
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false  // ใช้การตั้งค่านี้ถ้า SSL certificate เป็น self-signed หรือไม่ได้รับการรับรองจากผู้ให้บริการที่เชื่อถือ
    }
});

module.exports = pool