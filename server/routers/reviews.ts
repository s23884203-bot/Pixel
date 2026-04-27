import { Router } from "express";
import { db } from "../db"; // تأكد أن db مصدرة من هنا
import { reviews } from "@shared/schema";
import { desc } from "drizzle-orm";
import { syncDiscordReviews } from "../discord";

const router = Router();

// جلب التقييمات مع مزامنة فورية
router.get("/", async (_req, res) => {
  try {
    console.log("[PIXEL-DEBUG-SYSTEM] تم رصد دخول للموقع، جاري فحص ديسكورد...");
    await syncDiscordReviews(); 
    const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    res.json(allReviews);
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] فشل المزامنة، يتم عرض المخزن:", error);
    const existingReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    res.json(existingReviews);
  }
});

// تصدير الراوتر بالاسمين (لتجنب أخطاء الـ Build)
export { router as reviewsRouter }; 
export default router;
