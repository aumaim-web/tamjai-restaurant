// server.js — จุดเริ่มโปรแกรม: ตั้งค่า Express, ต่อ route ทั้งหมด, จัดการ error
const express = require('express');
const path = require('path');
const { init } = require('./src/db/seed');
const { loadUser } = require('./src/middleware/auth');
const { HttpError } = require('./src/utils');
const { PORT } = require('./src/config');

init(); // สร้างผู้ใช้และข้อมูลตัวอย่างถ้ายังไม่มี

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // หน้าจอโปรแกรม
app.use('/api', loadUser);

app.use('/api', require('./src/routes/auth'));
app.use('/api', require('./src/routes/state'));
app.use('/api', require('./src/routes/reports'));
app.use('/api', require('./src/routes/system'));
app.use('/api/customers', require('./src/routes/customers'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/stock', require('./src/routes/stock'));
app.use('/api/orders', require('./src/routes/orders').router);
app.use('/api/payments', require('./src/routes/payments'));

// ไม่พบ API
app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบ API นี้' }));

// ตัวจัดการ error รวม
app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ใช่ JSON' });
  console.error(err);
  res.status(500).json({ error: 'เซิร์ฟเวอร์ขัดข้อง ลองใหม่อีกครั้ง' });
});

app.listen(PORT, () => console.log(`ร้านตามใจ พร้อมใช้งานที่ http://localhost:${PORT}`));
