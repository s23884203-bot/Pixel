import { Router } from "express";
import { getDb, getAllReviews } from "../db"; // نستخدم الدوال الجاهزة في ملفك
import { syncDiscordReviews } from "../discord";

const router = Router();

// جلب التقييمات مع مزامنة فورية
router.get("/", async (_req, res) => {
  try {
    console.log("[PIXEL-DEBUG-SYSTEM] تم رصد دخول للموقع، جاري فحص ديسكورد...");
    
    // 1. تشغيل المزامنة لجلب الجديد من ديسكورد
    try {
        await syncDiscordReviews(); 
    } catch (syncError) {
        console.error("[PIXEL-DEBUG-SYSTEM] خطأ في دالة المزامنة ولكن سأستمر في العرض:", syncError);
    }

    // 2. جلب كافة التقييمات باستخدام الدالة الموجودة أصلاً في ملفك db.ts
    const allReviews = await getAllReviews();
    
    // 3. إرسال البيانات للموقع
    res.json(allReviews);
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] فشل كلي في العملية:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// تصدير الراوتر بالاسمين لضمان قبول الـ Build
export { router as reviewsRouter };
export default router;
