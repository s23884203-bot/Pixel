import { Router } from "express";
import { db } from "../db";
import { reviews } from "@shared/schema";
import { desc } from "drizzle-orm";
import { syncDiscordReviews } from "../discord"; // تأكد من استيراد دالة المزامنة

const router = Router();

// [PIXEL-DEBUG-SYSTEM] راوت جلب التقييمات مع المزامنة التلقائية
router.get("/", async (_req, res) => {
  try {
    console.log("[PIXEL-DEBUG-SYSTEM] جاري فحص ديسكورد عن تقييمات جديدة...");
    
    // تشغيل المزامنة فوراً
    await syncDiscordReviews(); 

    // جلب كل التقييمات من MySQL بعد المزامنة
    const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    
    res.json(allReviews);
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] فشلت المزامنة، يتم عرض المخزن حالياً:", error);
    const existingReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    res.json(existingReviews);
  }
});

export default router;
