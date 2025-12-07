import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "../drizzle/schema.ts";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const seedCategories = [
  {
    name: "วิทยาศาสตร์และเทคโนโลยี",
    slug: "science-technology",
    description: "ข่าวสารและบทความเกี่ยวกับวิทยาศาสตร์และเทคโนโลยีล่าสุด",
  },
  {
    name: "การเมือง",
    slug: "politics",
    description: "ข่าวการเมืองและการปกครองทั้งในและต่างประเทศ",
  },
  {
    name: "หุ้นและการลงทุน",
    slug: "stocks-investment",
    description: "บทวิเคราะห์หุ้น การลงทุน และตลาดการเงิน",
  },
  {
    name: "เศรษฐกิจ",
    slug: "economy",
    description: "ข่าวเศรษฐกิจและธุรกิจที่น่าสนใจ",
  },
  {
    name: "ท่องเที่ยว",
    slug: "travel",
    description: "แนะนำสถานที่ท่องเที่ยวและเรื่องราวการเดินทาง",
  },
  {
    name: "เพลง",
    slug: "music",
    description: "ข่าวเพลงและศิลปินที่น่าติดตาม",
  },
  {
    name: "ภาพยนตร์",
    slug: "movies",
    description: "รีวิวและข่าวภาพยนตร์น่าสนใจ",
  },
  {
    name: "ดนตรี",
    slug: "music-culture",
    description: "วัฒนธรรมดนตรีและศิลปะการแสดง",
  },
  {
    name: "อาหาร",
    slug: "food",
    description: "รีวิวร้านอาหารและสูตรอาหารน่าลอง",
  },
];

async function main() {
  console.log("🌱 Starting category seeding...");

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Insert categories one by one
    for (const category of seedCategories) {
      try {
        await db.insert(categories).values(category);
        console.log(`✅ Added category: ${category.name}`);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⏭️  Category already exists: ${category.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log("✨ Category seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
