import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Star, ExternalLink, MessageSquare, Award, Sparkles, LayoutGrid, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

interface Review {
  id: number | string;
  content: string;
  image?: string | null;
  rating: number | null;
  authorName: string;
  authorAvatar?: string | null;
  timestamp: string | Date;
}

interface Partner {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  link?: string | null;
}

interface FeaturedClient {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  serverIcon: string | null;
  inviteLink: string;
  platform: 'discord' | 'kick';
}

// التقييمات اليدوية لضمان الظهور الفوري
const MANUAL_REVIEWS: Review[] = [
  {
    "id": "manual_0",
    "authorName": "Aymn !",
    "content": "ي شيخ افضل مصمم والله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-24"
  },
  {
    "id": "manual_1",
    "authorName": "_3mx",
    "content": "الأفضل",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-23"
  },
  {
    "id": "manual_2",
    "authorName": "7mood !",
    "content": "الله يوفقك من نجاح لنجاح الافضل دايما",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-23"
  },
  {
    "id": "manual_3",
    "authorName": "66 !",
    "content": "تعبت وأنا أمدحه و الله المتجر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-22"
  },
  {
    "id": "manual_4",
    "authorName": "y7d",
    "content": "والله متجر جامد",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-22"
  },
  {
    "id": "manual_5",
    "authorName": "!",
    "content": "تبي شي مميز ؟ تبي تصميم يميزك عن الكل تعامل مع ﮼ ﮼ ﮼ سنو سرعة وفن الله عليك بس يانسنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-21"
  },
  {
    "id": "manual_6",
    "authorName": "M7D",
    "content": "الافضل",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-20"
  },
  {
    "id": "manual_7",
    "authorName": "JustMtss",
    "content": "افضل متجر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-20"
  },
  {
    "id": "manual_8",
    "authorName": "Ahmed 23",
    "content": "أولاً نشكر المتجر على الرد السريع والخدمة المميزة عن باقي المتاجر ونشكر Snow على حسن التعامل والأسلوب ونسأل الله أن يوفقكم وينجحكم وين ما رحتموا",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-20"
  },
  {
    "id": "manual_9",
    "authorName": "S L T",
    "content": "تاريخي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-19"
  },
  {
    "id": "manual_10",
    "authorName": "slom !",
    "content": "شغل فاخر و اتمنى يستمر و الاسعار حلوه جدا الله يوفقك يا سنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-15"
  },
  {
    "id": "manual_11",
    "authorName": "! Palm",
    "content": "والله شغل غير متوقع جبار",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-14"
  },
  {
    "id": "manual_12",
    "authorName": "oFLaGx !",
    "content": "متجر من افضل المتاجر وهذا الشي الكل يتفق عليه - من ناحية ملابس جوده ولا أروع - من ناحية تعامل و رد يدون عليك بأسرع وقت - متجر يغنيك عن المتاجر الثانية باختصار ...",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-14"
  },
  {
    "id": "manual_13",
    "authorName": "Look",
    "content": "استمر بالأفضل وفالك التوفيق شغلك عالمي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-14"
  },
  {
    "id": "manual_14",
    "authorName": "qmusab",
    "content": "يا شيخ اذا مو افضل مصمم والله انك الافضل",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-14"
  },
  {
    "id": "manual_15",
    "authorName": "3!",
    "content": "الله يعطيه العافية ما قصر معي استاذ سنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-13"
  },
  {
    "id": "manual_16",
    "authorName": "Saylr !",
    "content": "شغل تاريخي والله ويعطيك لمسه بالبس ويطلعه بشكل خرافي أشكرك على الشغل الجبار ذا",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-13"
  },
  {
    "id": "manual_17",
    "authorName": "66 !",
    "content": "أفضل مصمم وتآلف",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-12"
  },
  {
    "id": "manual_18",
    "authorName": "_Almutiri",
    "content": "توب ما شاء الله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-12"
  },
  {
    "id": "manual_19",
    "authorName": "Toxic !",
    "content": "ولش البس مرا حلو صراحتا عجبتني شغلك",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-12"
  },
  {
    "id": "manual_20",
    "authorName": "Crystal1zed",
    "content": "رههييييه تبارك الرحمن على الشغل والله تستحق الانتظار!!",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-11"
  },
  {
    "id": "manual_21",
    "authorName": "s25",
    "content": "مبدع",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-11"
  },
  {
    "id": "manual_22",
    "authorName": "Rakan",
    "content": "تاريخيي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-10"
  },
  {
    "id": "manual_23",
    "authorName": "2YN",
    "content": "ماعرف كيف اعبر لان والله اذا مو الافضل انا ما افهم شي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-10"
  },
  {
    "id": "manual_24",
    "authorName": "c8m8",
    "content": "تالارريخي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-10"
  },
  {
    "id": "manual_25",
    "authorName": "YAZ",
    "content": "شي من الآخر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-10"
  },
  {
    "id": "manual_26",
    "authorName": "THR !",
    "content": "اقسم بالله شغل ولا يعلى عليه ومن افضل المتاجر والله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-10"
  },
  {
    "id": "manual_27",
    "authorName": "PRIMEBASIL",
    "content": "شغّل توب التوب لو اشكرهم من اليوم ل بكرا ما اوفي بحقهم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-10"
  },
  {
    "id": "manual_28",
    "authorName": "No Way Back",
    "content": "شكرا على المجهود الفخم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-09"
  },
  {
    "id": "manual_29",
    "authorName": "وزير الترجسية",
    "content": "شغل نظيف",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-09"
  },
  {
    "id": "manual_30",
    "authorName": "Subaie",
    "content": "شكراً على المجهود الفخم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-08"
  },
  {
    "id": "manual_31",
    "authorName": "محمد",
    "content": "معلم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-08"
  },
  {
    "id": "manual_32",
    "authorName": "3LLO",
    "content": "تاريخي مايخذلك فالتصميم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-07"
  },
  {
    "id": "manual_33",
    "authorName": "Allbraa",
    "content": "شغل تاريخي ما قصر سنو شغّل جبّار",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-07"
  },
  {
    "id": "manual_34",
    "authorName": "ABO MsfR",
    "content": "القوت",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-05"
  },
  {
    "id": "manual_35",
    "authorName": "T0xlc",
    "content": "فنان و انصح الجميع ان سـنو يكون خياره الاول",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-04"
  },
  {
    "id": "manual_36",
    "authorName": "R1der !",
    "content": "مشاءالله شغل عالمي وتعامل طيب الله يوفقهم يارب",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-02"
  },
  {
    "id": "manual_37",
    "authorName": "Mount",
    "content": "الله يعطيهم العافيه شغل ولا اروع ما شاءالله عليهم وتعدا الشي الي توقعت",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-02"
  },
  {
    "id": "manual_38",
    "authorName": "Neon",
    "content": "شكرا وثاني شي هذا العمل لا يقيم فوق التقييم وثالث شي اشكر اخوي snow",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-01"
  },
  {
    "id": "manual_39",
    "authorName": "المغامدي",
    "content": "والله من أفضل الأشخاص الي تعاملت معهم عسل بشكل مو طبيعي اما من ناحية رد سريع و اما من ناحية شغل جبار لاتدور غير سنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-04-01"
  },
  {
    "id": "manual_40",
    "authorName": "Neon",
    "content": "الشغل حلو والاحلى الكيوت الي سواه لان ما بقى واحد من عندي ما مدح شغله SNOW",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-30"
  },
  {
    "id": "manual_41",
    "authorName": "Allbraa",
    "content": "شغل جامد و سنو مبدع ولا يقصر معكم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-27"
  },
  {
    "id": "manual_42",
    "authorName": "غير واضح",
    "content": "والله العظيم افضل متجر و يعطيك العافيه على الشغل الجامد",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-27"
  },
  {
    "id": "manual_43",
    "authorName": "Neon",
    "content": "يوووووهه يا مجنون يامجنونن وششش ش ذا الابداع ياخي يالة",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-27"
  },
  {
    "id": "manual_44",
    "authorName": "echo",
    "content": "سنو قوت المجال ، تعامل و انتباه عالي لتقديم الجوده المطلوبه ، انصح و بشده تجريب السنو لانه مايخيب الظن . شكرا جزيلا",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-26"
  },
  {
    "id": "manual_45",
    "authorName": "Smadi",
    "content": "فوق التقييم سئو لو قيمته 100000 رح تظلمه والله قوت",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-26"
  },
  {
    "id": "manual_46",
    "authorName": "MightyDexTar",
    "content": "المعروف لايعرف القوت سئو ملك التصاميم تعامل جامد وبأي وقت تلقاء موجود آيفوني ياسنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-26"
  },
  {
    "id": "manual_47",
    "authorName": "Abu Da7m !",
    "content": "شغل مشرف لأسم المتجر اشكرك SNOW",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-26"
  },
  {
    "id": "manual_48",
    "authorName": "@ieleven_11",
    "content": "تعامل رهيب و سريع و شكل إبداعي و سعر ممتاز",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-25"
  },
  {
    "id": "manual_49",
    "authorName": "Abu Nasser",
    "content": "توسيييبببب والله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-25"
  },
  {
    "id": "manual_50",
    "authorName": "H",
    "content": "كلمة حق تُقال والله العظيم انه افضل سيرفر لتصميم الملابس من ناحية سرعة سريعين ف التسليم من ناحية تفاصيل ف هم مجانين ما شاء الله ، الله يوفقكم و لنا تعاملات ثانية بإذن الله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-25"
  },
  {
    "id": "manual_51",
    "authorName": "Venom !",
    "content": "والله مدري وش اقول وش اخلي ماشاءالله عليه شغل جبارر بشكل لايوصف سنوف التوب",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-22"
  },
  {
    "id": "manual_52",
    "authorName": "AK",
    "content": "فاخر من الآخر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-22"
  },
  {
    "id": "manual_53",
    "authorName": "BR8",
    "content": "ياخي والله العظيم انك مبدع بشكل والله العظيم يعطيك العافية يا حب",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-21"
  },
  {
    "id": "manual_54",
    "authorName": "Subaie",
    "content": "افضل مصمم ملابس في تاريخ فايف ام الله يوفقك في حالك",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-21"
  },
  {
    "id": "manual_55",
    "authorName": "3LLO",
    "content": "كل مره يسوينا تصميم افضل من الثاني مافيقدر معنا",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-21"
  },
  {
    "id": "manual_56",
    "authorName": "Twix !",
    "content": "ما شاء الله عليه ذي 5 مره اتعامل معه ولا مره خذلني بتصميم البس الافضل في معنى الكلمه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-19"
  },
  {
    "id": "manual_57",
    "authorName": "kai",
    "content": "القوت والله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-18"
  },
  {
    "id": "manual_58",
    "authorName": "يم",
    "content": "10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-14"
  },
  {
    "id": "manual_59",
    "authorName": ".66 |",
    "content": "و الله أفضل متجر سرعة وتنفيذ",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-13"
  },
  {
    "id": "manual_60",
    "authorName": "JustM8",
    "content": "أفضل متجر اشتغلت وياه لتصميم و مب اول مرا ولا آخر مرا و جعل ربي يوفقهم و يسعدهم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-12"
  },
  {
    "id": "manual_61",
    "authorName": "KinGvtc",
    "content": "الله يوفقك و ما قصرت و يعطيك العافيه على الشغل الجبار",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-11"
  },
  {
    "id": "manual_62",
    "authorName": "66",
    "content": "اقسم بالله أفضل متجر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-10"
  },
  {
    "id": "manual_63",
    "authorName": "Neon",
    "content": "تحياتي ل اهل مصر و تحديد ل سيو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-09"
  },
  {
    "id": "manual_64",
    "authorName": "7mood !",
    "content": "افضل واحد سنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-09"
  },
  {
    "id": "manual_65",
    "authorName": "MT3B",
    "content": "البكج جامد و الشغل خلص بسرعه 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-07"
  },
  {
    "id": "manual_66",
    "authorName": "Fotex",
    "content": "عالمي والله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-02"
  },
  {
    "id": "manual_67",
    "authorName": "LAM",
    "content": "للامانه شغل ممتاز يعطيمكم العافيه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-03-02"
  },
  {
    "id": "manual_68",
    "authorName": "3nzi",
    "content": "الأفضل سيو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-28"
  },
  {
    "id": "manual_69",
    "authorName": "R I P",
    "content": "مبدع سيو شغل جبّار",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-25"
  },
  {
    "id": "manual_70",
    "authorName": "محمد",
    "content": "ما قصر سنو الصراحه شغل جبار",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-24"
  },
  {
    "id": "manual_71",
    "authorName": "vMsk !",
    "content": "1000000000000000000000000000/10 والله الأفضل سنو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-24"
  },
  {
    "id": "manual_72",
    "authorName": "غير واضح الاسم",
    "content": "شغل جبار و نظيف وسريع 100/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-20"
  },
  {
    "id": "manual_73",
    "authorName": "L7",
    "content": "مبدع",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-20"
  },
  {
    "id": "manual_74",
    "authorName": "!",
    "content": "ماقصر الرجال وتصميمه جبااااارررررر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-20"
  },
  {
    "id": "manual_75",
    "authorName": "3MAR",
    "content": "10/10 ما راح افكر اصمم غير عند snow",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-18"
  },
  {
    "id": "manual_76",
    "authorName": "Red",
    "content": "الافضل",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-17"
  },
  {
    "id": "manual_77",
    "authorName": "osuet !",
    "content": "والله الافضل ابو سنووووووووو",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-16"
  },
  {
    "id": "manual_78",
    "authorName": "T0xlc",
    "content": "والله افضل مصمم قد تعاملت معه و شفت تصميما. انصح الجميع انه يكون Pixel خياره الاول",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-15"
  },
  {
    "id": "manual_79",
    "authorName": "C2!",
    "content": "سنووو او تويب",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-11"
  },
  {
    "id": "manual_80",
    "authorName": "!",
    "content": "سنو ذا بيست فور ايفرررر",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-08"
  },
  {
    "id": "manual_81",
    "authorName": "nxpapillon",
    "content": "عم المجال سنو .. تعامل وسعر وشغل جبّار",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-01"
  },
  {
    "id": "manual_82",
    "authorName": "Mubarak 2",
    "content": "البكج جامد ومو اول مره بتعامل معهم ماقصروا معي 100/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-01"
  },
  {
    "id": "manual_83",
    "authorName": "mnsory !",
    "content": "ماقصر في التصميم جودة ممتازة + مبدع وأسلوبه عسل الرجال + والله الشغل جبار يعطيه العافيه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-01"
  },
  {
    "id": "manual_84",
    "authorName": "!",
    "content": "ياخي ورب الكعبة انك جامد بشكل الله لا يضرك و يعطيك العافيه على الشغل الجاااامد",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-02-01"
  },
  {
    "id": "manual_85",
    "authorName": "Brave Fighter",
    "content": "ما قصرت يا سئو ليس ال mercy no جامددددد",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-30"
  },
  {
    "id": "manual_86",
    "authorName": "Neon",
    "content": "والله العظيم انك مبدع بشكل الله لا يضرك والله ابدعت يا الشيبييخ",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-30"
  },
  {
    "id": "manual_87",
    "authorName": "3li",
    "content": "ما قصرت يا سنو قسم بالله انك مبدع وما اول مره اتعامل معك",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-29"
  },
  {
    "id": "manual_88",
    "authorName": "Oo",
    "content": "شغل جامددد وشخص عسل ولا يقصر معكم ان شاء الله 100/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-28"
  },
  {
    "id": "manual_89",
    "authorName": "Haz",
    "content": "السرعة والشغل جامد والله شكرا SNOW راضين أنتم الرضاء",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-27"
  },
  {
    "id": "manual_90",
    "authorName": "BR8",
    "content": "والله الشغل ابداأاع والله ماقصرت",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-27"
  },
  {
    "id": "manual_91",
    "authorName": "AbuKhalid",
    "content": "والله عالمي ذا الادمي ما تقدر توفيه بكم كلمه قوة شغله جبّار 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-25"
  },
  {
    "id": "manual_92",
    "authorName": "BSKOT!",
    "content": "انسان عسل والله يوفقه يارب تصميمه جامد 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-24"
  },
  {
    "id": "manual_93",
    "authorName": "9w4_",
    "content": "100/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-24"
  },
  {
    "id": "manual_94",
    "authorName": "3li",
    "content": "ماهي اول ولا اخر مرة اتعامل مع سنو ما قصرت والله يرزقك من حيث لا تحتسب",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-23"
  },
  {
    "id": "manual_95",
    "authorName": "Abood !",
    "content": "100/100 والله ماقصر اسلوب + سعر على جودهههه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-21"
  },
  {
    "id": "manual_96",
    "authorName": "XM7",
    "content": "100/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-20"
  },
  {
    "id": "manual_97",
    "authorName": "AbuTurki",
    "content": "شغل جبار واحترافي سريع 100/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-18"
  },
  {
    "id": "manual_98",
    "authorName": "kai",
    "content": "توب و الباقي فوتوشوب وربي ديممم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-18"
  },
  {
    "id": "manual_99",
    "authorName": "musabmmw",
    "content": "1000/10 شغل جبار واسطوري وماشاء الله تبارك الله خلص الشغل في وقت قياسي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-16"
  },
  {
    "id": "manual_100",
    "authorName": "Bander",
    "content": "ماشاء الله",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-16"
  },
  {
    "id": "manual_101",
    "authorName": "oxL",
    "content": "100/100 ما شاء الله والله الشغل جبار بشكل ما تتخيلونه انصحكم قسم بالله انكم تشتروون منه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-15"
  },
  {
    "id": "manual_102",
    "authorName": "Bader",
    "content": "الشغل فنانين و السرعه سريعن مرر 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-12"
  },
  {
    "id": "manual_103",
    "authorName": "iMo3a !",
    "content": "شغل بيرفكت و سريع 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-11"
  },
  {
    "id": "manual_104",
    "authorName": "Oo",
    "content": "شغله جبار وسريع 10/100",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-09"
  },
  {
    "id": "manual_105",
    "authorName": "ABOSAAD",
    "content": "اطلق شخص ابو سونو و افضل مصمم ممكن يمر عليكم والله و افنان 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-09"
  },
  {
    "id": "manual_106",
    "authorName": "فهد",
    "content": "افضل متجر ما شاء الله تعامل حلو و جوده عاليه جدا انصح الجميع بالتعامل معه شكرا لكم جميعا بتوفيق ..",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-09"
  },
  {
    "id": "manual_107",
    "authorName": "7ano0o",
    "content": "ماقصرت يابعدي شاكرين لك ذوق 10/10",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-08"
  },
  {
    "id": "manual_108",
    "authorName": "Oliver !",
    "content": "سنون توب و الباقي فوتوشوب",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-08"
  },
  {
    "id": "manual_109",
    "authorName": "Turki",
    "content": "شغل تاريخي وغير مستغرب من سيو متقافي في عمله وشغله الله يعطيه العافيه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-08"
  },
  {
    "id": "manual_110",
    "authorName": "Viukinsér",
    "content": "10/10 شغل جبار وسريع ابيض وجه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-06"
  },
  {
    "id": "manual_111",
    "authorName": "!",
    "content": "10/10 والله شغل جبااار يعطيك العافيه",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-06"
  },
  {
    "id": "manual_112",
    "authorName": "Look",
    "content": "10/10 سريع وشغل تاريخي",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-06"
  },
  {
    "id": "manual_113",
    "authorName": "R7_506",
    "content": "10/10 ماقصر الشيخ SNOW رد سريع وسرعه في التسليم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-05"
  },
  {
    "id": "manual_114",
    "authorName": "Sweet",
    "content": "شغل ممتاز وشهادتي غيه مجروحه شريك النجاح",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-04"
  },
  {
    "id": "manual_115",
    "authorName": "Saud",
    "content": "10/10 ماشاء الله شغل احترافي وسرعه بالرد والتعامل",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-03"
  },
  {
    "id": "manual_116",
    "authorName": "7mood !",
    "content": "كل الشكر للشيخ SNOW ماقصر شغل جبّار وسرعه وتعامل",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-02"
  },
  {
    "id": "manual_117",
    "authorName": "Neon",
    "content": "10/10 شغل احترافي وفن ويعطي اقتراحات جامده افضل مصمم",
    "rating": 5,
    "authorAvatar": null,
    "timestamp": "2026-01-02"
  }
];

const AnimatedTagline = () => {
  return (
    <div className="text-center mt-6 mb-12">
      <div className="relative inline-block group">
        <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm">
            <span className="text-2xl md:text-3xl animate-bounce filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">📌</span>
            <div className="flex flex-col">
              <h2 className="flex flex-wrap justify-center items-center gap-x-3 text-xl md:text-3xl font-black italic tracking-tighter" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <span className="text-white/90">من خيالك</span>
                <span className="text-white/10 text-lg md:text-xl font-light not-italic">——</span>
                <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">للواقع</span>
              </h2>
              <div className="relative w-full h-[1.5px] mt-2 bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite_ease-in-out]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating }: { rating: number | null }) => {
  const stars = rating || 5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const { data: reviewsData, isLoading: reviewsLoading } = trpc.reviews.list.useQuery(undefined, {
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchInterval: 300000
  });
  const { data: partnerMessages } = trpc.reviews.partners.useQuery();
  const { data: featuredClientsData } = trpc.reviews.featuredClients.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const [displayReviews, setDisplayReviews] = useState<Review[]>(MANUAL_REVIEWS);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredClients, setFeaturedClients] = useState<FeaturedClient[]>([]);

  useEffect(() => {
    if (reviewsData && reviewsData.length > 0) {
      // التقييمات القادمة من السيرفر (ديسكورد + قاعدة البيانات)
      const sorted = [...reviewsData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // دمج التقييمات اليدوية مع تقييمات السيرفر
      // نضع تقييمات السيرفر في البداية لتظهر الأحدث أولاً
      const merged = [...sorted, ...MANUAL_REVIEWS];
      
      // منع التكرار بناءً على المحتوى واسم الكاتب، أو المعرف الفريد
      const uniqueMap = new Map();
      merged.forEach(r => {
        const key = r.discordMessageId || (r.content + r.authorName);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, r);
        }
      });
      
      setDisplayReviews(Array.from(uniqueMap.values()) as Review[]);
    }
  }, [reviewsData]);

  useEffect(() => {
    if (partnerMessages) setPartners(partnerMessages);
  }, [partnerMessages]);

  useEffect(() => {
    if (featuredClientsData) setFeaturedClients(featuredClientsData as FeaturedClient[]);
  }, [featuredClientsData]);

  const isLoading = reviewsLoading && displayReviews.length === MANUAL_REVIEWS.length;

  const PlatformIcon = ({ platform, icon }: { platform: 'discord' | 'kick', icon?: string | null }) => {
    const [imgError, setImgError] = useState(false);
    if (icon && !imgError) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-black">
          <img src={icon} alt={platform} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        </div>
      );
    }
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-black ${platform === 'kick' ? 'bg-[#53fc18]' : 'bg-[#5865F2] p-1.5'}`}>
        {platform === 'kick' ? <span className="text-[10px] font-black text-black">K</span> : 
          <svg viewBox="0 0 127.14 96.36" fill="white" className="w-full h-full"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.48,80.21a105.73,105.73,0,0,0,32.22,16.15,77.7,77.7,0,0,0,7.34-11.86,68.11,68.11,0,0,1-11.85-5.65c.99-.71,1.96-1.46,2.89-2.22a74.87,74.87,0,0,0,65.35,0c.93.76,1.9,1.51,2.89,2.22a68.4,68.4,0,0,1-11.85,5.65,77,77,0,0,0,7.34,11.86,105.55,105.55,0,0,0,32.25-16.15C129.58,52.13,125.4,28.38,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.12-12.67,11.45-12.67S54,46,54,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.12-12.67,11.44-12.67S96.2,46,96.2,53,91.05,65.69,84.69,65.69Z"/></svg>
        }
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex flex-col" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[url('/bg.webp')] bg-cover bg-center grayscale" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Navbar */}
        <nav className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black not-italic text-sm">P</div>
              Pixel Design
            </div>
            <div className="flex items-center gap-3">
              <a href="https://salla.sa/pixel.design" target="_blank" rel="noopener noreferrer" className="bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" /> Store
              </a>
              <a href="https://discord.gg/wBuqaM6tqm" target="_blank" className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Discord
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content Grid */}
        <main className="max-w-[1600px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 pb-24 flex-1">
          
          {/* Left Sidebar: Featured Clients */}
          <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md sticky top-24">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="bg-white/5 p-2 rounded-xl text-white/60"><Award className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight italic">عملاء مميزون</h2>
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Premium Clients</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {featuredClients.map(client => (
                  <a key={client.id} href={client.inviteLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                    <div className="flex-shrink-0 group-hover:scale-110 transition-transform"><PlatformIcon platform={client.platform} icon={client.serverIcon} /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-xs truncate uppercase italic">{client.name}</h3>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">{client.platform}</span>
                    </div>
                    <div className="text-white/20 group-hover:text-white transition-colors"><ExternalLink className="w-3 h-3" /></div>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Content: Hero & Stats */}
          <div className="lg:col-span-6 space-y-16 order-1 lg:order-2 flex flex-col items-center">
            {/* Hero Section */}
            <section className="text-center w-full pt-10">
              <div className="mb-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl mb-8 hover:bg-white/[0.06] transition-all group cursor-default shadow-2xl backdrop-blur-md">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img src="/snow_logo.webp" alt="SNOW" className="relative w-12 h-12 md:w-16 md:h-16 object-contain" />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-3xl font-black text-white uppercase tracking-widest italic leading-none">SNOW</span>
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-black mt-1">Store Owner</span>
                  </div>
                </div>
                
                <div className="relative group mb-10">
                  <div className="absolute -inset-10 bg-white/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <img src="/logo.webp" alt="Pixel Design" className="relative w-40 h-40 md:w-52 md:h-52 object-contain animate-float drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]" />
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-4 leading-none">
                  Pixel <span className="text-white/10">Design</span>
                </h1>
                <AnimatedTagline />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                  <span className="block text-2xl md:text-3xl font-black">{stats?.memberCount || 2000}+</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Community</span>
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
                  <span className="block text-2xl md:text-3xl font-black">200+</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">Satisfied</span>
                </div>
              </div>

              {/* Partners/Services */}
              <div className="mt-16 w-full max-w-xl">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="w-4 h-4 text-white/20" />
                  <span className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-black">Trusted Partners</span>
                  <Sparkles className="w-4 h-4 text-white/20" />
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 opacity-40 hover:opacity-100 transition-opacity">
                  {partners.slice(0, 6).map(p => (
                    <div key={p.id} className="aspect-square p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center group hover:bg-white/5 transition-all">
                      {p.image ? (
                        <img src={p.image} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt={p.name} />
                      ) : (
                        <span className="text-[8px] font-bold text-center uppercase leading-tight">{p.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Reviews Section (The specific requested place) */}
          <aside className="lg:col-span-3 order-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-black backdrop-blur-xl sticky top-24 ring-1 ring-white/5 h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-2xl text-white shadow-lg"><MessageSquare className="w-5 h-5" /></div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-black uppercase tracking-tighter italic leading-none">أحدث التقييمات</h2>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Customer Reviews</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-3 space-y-6 custom-scrollbar relative">
                {displayReviews.length > 0 ? (
                  displayReviews.map((r, idx) => (
                    <div key={r.id} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 transition-all duration-500 hover:border-white/20 hover:bg-black/60 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                      {r.image && (
                        <div className="relative aspect-auto w-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
                          <img src={r.image} className="w-full h-auto object-contain grayscale-[0.2] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" loading="lazy" />
                        </div>
                      )}
                      
                      <div className="p-5 relative z-20">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="absolute -inset-1.5 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                              {r.authorAvatar ? (
                                <img src={r.authorAvatar} alt={r.authorName} className="relative w-9 h-9 rounded-full border border-white/20 object-cover shadow-xl" />
                              ) : (
                                <div className="relative w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">
                                  {r.authorName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-black text-white uppercase tracking-tight truncate leading-none mb-1">{r.authorName}</span>
                              <span className="text-[8px] text-white/30 uppercase tracking-widest font-black">اليوزر نيم</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 shadow-inner">
                            <StarRating rating={r.rating} />
                          </div>
                        </div>

                        {r.content && r.content !== "تقييم Pixel Design" && (
                          <div className="relative pt-3 border-t border-white/5">
                            <div className="absolute left-0 top-3 w-1 h-1 bg-white/20 rounded-full" />
                            <p className="text-[11px] text-white/60 italic leading-relaxed pl-4 font-medium line-clamp-4 group-hover:text-white/80 transition-colors">
                              "{r.content}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-4 h-4 border-t border-r border-white/20 rounded-tr-lg" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 border border-white/5 border-dashed rounded-[2.5rem] bg-white/[0.01]">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse" />
                      <MessageSquare className="relative w-12 h-12 text-white/5" />
                    </div>
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">No Reviews Yet</p>
                    <div className="mt-4 w-8 h-[1px] bg-white/5" />
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>

        <Footer />
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}
