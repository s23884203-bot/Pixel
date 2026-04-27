import { Router } from "express";
import { getDb } from "../db"; // استيراد الدالة الصحيحة من ملفك
import { reviews } from "../drizzle/schema"; // المسار الصحيح للـ schema بناءً على ملفك
import { desc } from "drizzle-orm";
import { syncDiscordReviews } from "../discord";

const router = Router();

// جلب التقييمات مع مزامنة فورية عند دخول المستخدم
router.get("/", async (_req, res) => {
  try {
    console.log("[PIXEL-DEBUG-SYSTEM] تم رصد دخول للموقع، جاري فحص ديسكورد...");
    
    // 1. تشغيل المزامنة
    await syncDiscordReviews(); 

    // 2. الحصول على نسخة قاعدة البيانات
    const db = await getDb();
    
    if (!db) {
      throw new Error("Database connection failed");
    }

    // 3. جلب التقييمات مرتبة من الأحدث (timestamp)
    const allReviews = await db.select().from(reviews).orderBy(desc(reviews.timestamp));
    
    res.json(allReviews);
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] فشل المزامنة أو الجلب:", error);
    
    // محاولة عرض الموجود في حال فشل المزامنة
    const db = await getDb();
    if (db) {
      const existing = await db.select().from(reviews).orderBy(desc(reviews.timestamp));
      return res.json(existing);
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// تصدير الراوتر بالاسمين لضمان نجاح الـ Build في Railway
export { router as reviewsRouter };
export default router;
