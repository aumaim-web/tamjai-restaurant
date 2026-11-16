# ร้านตามใจ — ระบบจัดการร้านอาหาร

หน้าจอ (HTML/JS) + หลังบ้าน (Node.js, Express, SQLite ในตัว Node)

## วิธีรัน

**ง่ายสุด:** ดับเบิลคลิก `start.bat` (ติดตั้งให้เองครั้งแรก แล้วเปิดเบราว์เซอร์ให้)

**ใน VS Code:** File → Open Folder → เลือกโฟลเดอร์นี้ (ชั้นที่มี `package.json`) แล้วกด **F5**

**ห้ามเปิด `public/index.html` ตรงๆ หรือใช้ Live Server** ต้องเปิดผ่าน http://localhost:3000 เท่านั้น เพราะหน้าจอต้องคุยกับเซิร์ฟเวอร์

**รันเองผ่าน Terminal:**

ต้องมี Node.js 22.13 ขึ้นไป (ใช้ SQLite ที่มีในตัว Node ไม่ต้องคอมไพล์อะไรเพิ่ม)

```bash
npm install
npm start
```

เปิด http://localhost:3000

ครั้งแรกระบบจะสร้างไฟล์ `tamjai.db` พร้อมข้อมูลตัวอย่าง 7 วันให้อัตโนมัติ

### บัญชีทดลอง (รหัสผ่าน `tamjai123` ทุกบัญชี)

| ชื่อผู้ใช้ | บทบาท | ใช้ได้ |
|---|---|---|
| owner | เจ้าของร้าน | ทุกอย่าง |
| finance | ฝ่ายการเงิน | ขายหน้าร้าน, คำสั่งซื้อ, รับชำระ, ลูกค้า, รายงาน |
| stock | ฝ่ายคลังสินค้า | สต็อก, ดู/อัปเดตคำสั่งซื้อ |
| (ไม่ล็อกอิน) | ลูกค้า | สั่งอาหาร (ชำระที่เคาน์เตอร์) |

ล้างข้อมูลกลับเป็นข้อมูลตัวอย่าง: `npm run reset` (หรือปุ่มรีเซ็ตที่แถบล่าง เมื่อเข้าเป็นเจ้าของร้าน)

## โครงสร้างไฟล์

```
server.js                    จุดเริ่ม: ตั้งค่า Express, ต่อ route, จัดการ error
package.json

src/                         ── หลังบ้าน ──
  config.js                  ค่าตั้งค่า (พอร์ต, บทบาท, วิธีชำระ, อัตราแต้ม)
  utils.js                   ตัวช่วย: error, ตรวจค่า, ช่วงวันที่
  queries.js                 ดึงข้อมูลแล้วแปลงเป็นรูปแบบที่หน้าจอใช้
  middleware/auth.js         อ่าน token + กันสิทธิ์ตามบทบาท
  db/connection.js           เปิดฐานข้อมูล + สร้างตาราง (SCHEMA)
  db/password.js             เข้ารหัส/ตรวจรหัสผ่าน (scrypt)
  db/sample-data.js          ข้อมูลตั้งต้น: ลูกค้า พนักงาน วัตถุดิบ เมนู ผู้ใช้
  db/seed.js                 ใส่ข้อมูลตัวอย่าง, init(), reset()
  routes/auth.js             /api/login, /api/logout, /api/me
  routes/state.js            /api/state, /api/menu
  routes/customers.js        /api/customers
  routes/employees.js        /api/employees
  routes/stock.js            /api/stock
  routes/orders.js           /api/orders (สร้าง/เสิร์ฟ/ยกเลิก + ตัดสต็อก)
  routes/payments.js         /api/payments
  routes/reports.js          /api/reports/*, /api/dashboard
  routes/system.js           /api/reset

public/                      ── หน้าจอ ──
  index.html                 โครงหน้า + โหลดไฟล์ JS ตามลำดับ
  css/style.css              สี ฟอนต์ เลย์เอาต์
  js/utils.js                ฟังก์ชันช่วย (จัดรูปแบบเงิน/วันที่, toast)
  js/config.js               ค่าคงที่: หน้าจอและสิทธิ์แต่ละบทบาท
  js/state.js                ข้อมูลที่หน้าจอถืออยู่
  js/api.js                  เรียก API, token, หน้าต่างเข้าสู่ระบบ
  js/modal.js                หน้าต่างฟอร์ม/ยืนยัน
  js/components.js           ป้ายสถานะ, ตารางออเดอร์, กราฟแท่ง
  js/views/*.js              แต่ละหน้า: dashboard, pos, orders, payments,
                             customers, employees, stock, reports
  js/app.js                  เมนูซ้าย, สลับหน้า, คีย์ลัด, เริ่มโปรแกรม (โหลดท้ายสุด)

tamjai.db                    ไฟล์ฐานข้อมูล (สร้างเองตอนรัน)
```

ไฟล์ JS ฝั่งหน้าจอเป็นสคริปต์ธรรมดา (ไม่ใช่ module) ใช้ตัวแปรร่วมกัน จึงต้องโหลดตามลำดับใน `index.html`

## ตารางในฐานข้อมูล

| ตาราง | เก็บอะไร |
|---|---|
| users, sessions | บัญชีผู้ใช้ระบบ และ token การเข้าสู่ระบบ |
| customers | ข้อมูลลูกค้า + แต้มสะสม (1 แต้มทุก ฿25) |
| employees | ข้อมูลพนักงาน |
| stock | วัตถุดิบ จำนวนคงเหลือ จำนวนขั้นต่ำ |
| menu, recipe | เมนูอาหาร และสูตร (เมนูใช้วัตถุดิบอะไรเท่าไร) |
| orders, order_items | คำสั่งซื้อ และรายการอาหารในแต่ละคำสั่ง |
| payments | การชำระเงิน (1 ออเดอร์ = 1 บิล) |

## API

ส่ง token ใน header `Authorization: Bearer <token>` (ได้จาก `/api/login`)

| Method | Path | สิทธิ์ | ทำอะไร |
|---|---|---|---|
| POST | /api/login | ทุกคน | เข้าสู่ระบบ `{username, password}` |
| POST | /api/logout | ล็อกอินแล้ว | ออกจากระบบ |
| GET | /api/me | พนักงาน | ข้อมูลผู้ใช้ปัจจุบัน |
| GET | /api/state | ทุกคน | ข้อมูลทั้งหมดสำหรับหน้าจอ (ลูกค้าได้แค่เมนู + สต็อก) |
| GET | /api/menu | ทุกคน | รายการเมนูและสูตร |
| GET/POST | /api/customers | owner, finance | ดู / เพิ่มลูกค้า |
| PUT | /api/customers/:id | owner, finance | แก้ไขลูกค้า |
| GET/POST | /api/employees | owner | ดู / เพิ่มพนักงาน |
| PUT/DELETE | /api/employees/:id | owner | แก้ไข / ลบพนักงาน |
| GET/POST | /api/stock | พนักงาน / owner, stock | ดู / เพิ่มวัตถุดิบ |
| PUT | /api/stock/:id | owner, stock | แก้ไขวัตถุดิบ |
| POST | /api/stock/:id/adjust | owner, stock | รับเข้า/เบิกออก `{delta}` |
| GET | /api/orders?from&to&status | พนักงาน | รายการคำสั่งซื้อ |
| POST | /api/orders | ทุกคน | สร้างออเดอร์ `{items:[{m,q}], table, cust?, payNow?, method?}` |
| PATCH | /api/orders/:id/serve | พนักงาน | เปลี่ยนสถานะเป็นเสิร์ฟแล้ว |
| POST | /api/orders/:id/cancel | owner, finance | ยกเลิก (เฉพาะที่ยังไม่ชำระ) + คืนวัตถุดิบ |
| GET | /api/payments?status | owner, finance | รายการบิล |
| POST | /api/payments/:id/pay | owner, finance | รับชำระ `{method}` |
| GET | /api/reports/sales?from&to | owner, finance | รายงานยอดขาย รายวัน + แยกวิธีชำระ |
| GET | /api/reports/orders?from&to | owner, finance | รายงานคำสั่งซื้อ ตามสถานะ + ช่วงเวลา |
| GET | /api/dashboard | พนักงาน | ตัวเลขสรุปหน้าภาพรวม |
| POST | /api/reset | owner | ล้างข้อมูลกลับเป็นข้อมูลตัวอย่าง |

## กติกาทางธุรกิจที่ฝั่งเซิร์ฟเวอร์ตรวจ

- ราคาอาหารดึงจากฐานข้อมูลเสมอ ไม่เชื่อราคาที่ส่งมาจากหน้าจอ
- สร้างออเดอร์ = ตรวจวัตถุดิบ → ตัดสต็อก → บันทึกออเดอร์และบิล ใน transaction เดียว ถ้าวัตถุดิบไม่พอจะไม่บันทึกอะไรเลย
- ยกเลิกได้เฉพาะออเดอร์ที่ยังไม่ชำระ และคืนวัตถุดิบเข้าสต็อก
- ลูกค้าที่ไม่ได้ล็อกอินสั่งได้แต่รับเงินเองไม่ได้ และเลือกบัญชีลูกค้าคนอื่นไม่ได้
- เบิกสต็อกเกินจำนวนคงเหลือไม่ได้
- รหัสผ่านเก็บแบบ scrypt + salt, token หมดอายุใน 12 ชั่วโมง
