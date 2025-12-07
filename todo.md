# Blog Platform TODO

## Phase 1: Database Schema
- [x] สร้างตาราง categories (หมวดหมู่บทความ)
- [x] สร้างตาราง articles (บทความ)
- [x] สร้างตาราง comments (คอมเม้นท์)
- [x] สร้างตาราง article_views (สถิติการดูบทความ)
- [x] Push schema ไปยังฐานข้อมูล

## Phase 2: Backend Development
- [x] สร้าง database helpers สำหรับ categories
- [x] สร้าง database helpers สำหรับ articles
- [x] สร้าง database helpers สำหรับ comments
- [x] สร้าว database helpers สำหรับ article views
- [x] สร้าง tRPC procedures สำหรับจัดการหมวดหมู่
- [x] สร้าง tRPC procedures สำหรับจัดการบทความ (CRUD)
- [x] สร้าง tRPC procedures สำหรับอัปโหลดรูปภาพ
- [x] สร้าง tRPC procedures สำหรับคอมเม้นท์
- [x] สร้าง tRPC procedures สำหรับโปรไฟล์ผู้ใช้

## Phase 3: UI Design & Core Pages
- [x] ติดตั้งและตั้งค่า Google Fonts (Didot/Playfair Display + Lora + Inter)
- [x] ออกแบบ global theme ในสไตล์นิตยสารไฮเอนด์
- [x] สร้างหน้า Home (landing page แบบนิตยสาร)
- [x] สร้างหน้า Articles (รายการบทความพร้อมฟิลเตอร์)
- [x] สร้างหน้า ArticleDetail (แสดงบทความเต็ม)
- [x] สร้าง Navigation component แบบมินิมอล
- [x] สร้าง ArticleCard component
- [x] สร้าง CategoryFilter component

## Phase 4: Article Creation System
- [x] ติดตั้ง rich text editor (Tiptap หรือ similar)
- [x] สร้างหน้า CreateArticle
- [x] สร้างหน้า EditArticle
- [x] สร้างระบบอัปโหลดรูปภาพปก
- [x] สร้างระบบอัปโหลดรูปภาพในเนื้อหา
- [x] สร้างระบบบันทึกร่างอัตโนมัติ
- [x] สร้าง ArticleEditor component

## Phase 5: Comments & User Profile
- [x] สร้าง CommentSection component
- [x] สร้างระบบเพิ่ม/ลบคอมเม้นท์
- [x] สร้างหน้า UserProfile
- [x] สร้างหน้า MyArticles (บทความของฉัน)
- [x] สร้างระบบแก้ไขโปรไฟล์ผู้ใช้

## Phase 6: Testing & Polish
- [x] เขียน vitest tests สำหรับ article procedures
- [x] เขียน vitest tests สำหรับ comment procedures
- [x] เขียน vitest tests สำหรับ category procedures
- [x] ทดสอบการทำงานของระบบทั้งหมด
- [x] ปรับแต่ง responsive design
- [x] ตรวจสอบ loading states และ error handling

## Phase 7: Delivery
- [x] แก้ไข build errors
- [x] สร้าง checkpoint
- [x] นำเสนอผลลัพธ์ให้ผู้ใช้

## New Feature: เพิ่มหมวดหมู่เริ่มต้น
- [x] สร้าง seed script สำหรับเพิ่มหมวดหมู่ 9 หมวด
- [x] รัน seed script เพื่อเพิ่มข้อมูลเข้าฐานข้อมูล
- [x] ทดสอบการแสดงผลหมวดหมู่ในเว็บไซต์

## New Feature: เปลี่ยนชื่อเว็บไซต์
- [x] เปลี่ยนชื่อเว็บไซต์ใน Navigation
- [x] เปลี่ยนชื่อเว็บไซต์ใน Home page
- [x] เปลี่ยนชื่อเว็บไซต์ใน Footer
- [x] อัปเดต environment variable VITE_APP_TITLE

## New Feature: ฟังก์ชั่อ่านว่างให้ฟัง
- [x] ติดตั้ง text-to-speech library
- [x] สร้าง AudioPlayer component
- [x] เพิ่ม audio player ในหน้า ArticleDetail
- [x] ทดสอบฟังก์ชั่อ่านว่างฟัง
## New Feature: สร้างภาพสำหรับเว็บไซต์
- [x] สร้างภาพหน้าปกเว็บไซต์แบบนิตยสาร
- [x] สร้างภาพพื้นหลังสำหรับหมวดหมู่
- [x] อัปโหลดภาพไปยัง S3
- [x] อัปเดตเว็บไซต์เพื่อใช้ภาพใหม่

## New Fe## New Feature: สร้างภาพใหม่ที่มีสีสวยงาม
- [x] สร้างภาพหน้าปกใหม่ที่มีสีสวยงาม
- [x] สร้างภาพพื้นหลังหมวดหมู่ใหม่ที่มีสีสวยงาม
- [x] อัปเดตเว็บไซต์เพื่อใช้ภาพใหม่

## New Feature: แสดงราคาหุ้นในหมวดหมู่หุ้นและการลงทุน
- [x] สร้าง StockTicker component ที่แสดงราคาหุ้น
- [x] เพิ่ม StockTicker ในหน้า Articles เมื่อเลือกหมวดหมู่หุ้น
- [x] ทดสอบการแสดงผลราคาหุ้น
