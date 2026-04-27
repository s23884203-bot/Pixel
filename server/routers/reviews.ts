import { Router } from "express";
import { db } from "../db";
import { reviews } from "@shared/schema";
import { desc } from "drizzle-orm";
import { syncDiscordReviews } from "../discord";

const router = Router();

// [PIXEL-DEBUG-SYSTEM] جلب التقييمات مع مزامنة فورية
router.get("/", async (_req, res) => {
  try {
    console.log("[PIXEL-DEBUG-SYSTEM] تم رصد دخول للموقع، جاري فحص ديسكورد...");
    
    // تشغيل المزامنة لجلب الجديد قبل عرض البيانات
    await syncDiscordReviews(); 

    // جلب كافة التقييمات (اليدوية والقادمة من ديسكورد) مرتبة من الأحدث
    const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    
    res.json(allReviews);
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] فشل في المزامنة التلقائية، يتم عرض البيانات المخزنة:", error);
    // في حال فشل الاتصال بديسكورد، نعرض الموجود في القاعدة لضمان استمرارية الموقع
    const existingReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    res.json(existingReviews);
  }
});

export default router;
