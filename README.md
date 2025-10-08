# Pathkin - دليل المشروع

## 🚀 إعداد المشروع (Project Setup)

هذا الدليل الشامل سيساعدك على تشغيل المشروع ونشره بنجاح. **الرجاء اتباع الخطوات بدقة لحل مشكلة النطاق (Domain) وتسجيل الدخول عبر جوجل.**

### 1. إعداد ملف البيئة (Environment File)

المشكلة الرئيسية التي تواجهها هي أن التطبيق لا يستطيع العثور على المفاتيح السرية (API Keys) ويعرض النطاق الخاطئ. الحل هو توفير هذه المفاتيح والنطاق الصحيح للتطبيق.

1.  في المجلد الرئيسي لمشروعك (نفس مستوى `package.json`)، أنشئ ملفًا جديدًا باسم `.env.local`.
2.  انسخ المحتوى التالي والصقه في ملف `.env.local`، واستبدل القيم بقيمك الحقيقية.

    ```
    # Firebase Keys
    VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    # ❗️ مهم: استخدم نطاقك المخصص هنا (مثال: pathkin.com)
    VITE_FIREBASE_AUTH_DOMAIN=pathkin.com
    VITE_FIREBASE_PROJECT_ID=yalla-58ccd
    VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_SENDER_ID
    VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

    # Google & Gemini Keys
    VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

**مهم جدًا:** تأكد من أن قيمة `VITE_FIREBASE_AUTH_DOMAIN` هي نطاقك المخصص الذي تريد أن يظهر للمستخدمين.

### 2. تشغيل المشروع محليًا (Running Locally)

بعد إنشاء ملف `.env.local`، يمكنك تشغيل المشروع على جهازك:

1.  تثبيت الاعتماديات:
    ```bash
    npm install
    ```
2.  تشغيل خادم التطوير:
    ```bash
    npm run dev
    ```
    سيقوم خادم التطوير بقراءة المتغيرات من ملف `.env.local` تلقائيًا.

---

## 🚀 دليل النشر وحل مشكلة `redirect_uri_mismatch`

لحل مشكلة ظهور `yalla-58ccd.firebaseapp.com` واستخدام `pathkin.com` بدلاً منه، اتبع الخطوات التالية **بدقة**:

### 1. ربط النطاق المخصص في Firebase Hosting
-   اذهب إلى [Firebase Console](https://console.firebase.google.com/) -> مشروعك.
-   اذهب إلى **Hosting**.
-   انقر على **Add custom domain** واتبع التعليمات لربط نطاقك `pathkin.com`.

### 2. تفويض النطاقات في Firebase Authentication
هذه الخطوة **ضرورية** للسماح بتسجيل الدخول من نطاقك الجديد ومن بيئة التطوير المحلية.
-   اذهب إلى [Firebase Console](https://console.firebase.google.com/) -> مشروعك.
-   اذهب إلى **Authentication** -> **Settings** -> **Authorized domains**.
-   انقر **Add domain** وأضف النطاقات التالية **واحدًا تلو الآخر**:
    -   `pathkin.com` (نطاقك المخصص)
    -   `localhost` (للتطوير المحلي)

### 3. تحديث عميل Google OAuth (أهم خطوة)

هذه هي الخطوة الحاسمة لحل خطأ `Error 400: redirect_uri_mismatch`. يجب أن تتطابق الإعدادات هنا تمامًا مع الطلبات التي يرسلها تطبيقك.

-   اذهب إلى [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
-   تأكد من أنك في المشروع الصحيح المرتبط بـ Firebase.
-   تحت **OAuth 2.0 Client IDs**، انقر على العميل المسمى `Web client (auto created by Google Service)`.
-   **تأكد من وجود كل هذه الروابط في القوائم الصحيحة. إذا كان أي منها مفقودًا، قم بإضافته:**

    **قائمة "Authorized JavaScript origins" (مصادر JavaScript المصرّح بها):**
    *   `https://pathkin.com`
    *   `https://yalla-58ccd.firebaseapp.com`
    *   `https://yalla-58ccd.web.app`
    *   `http://localhost:5173` (أو أي منفذ تستخدمه محليًا)
    *   `http://localhost`

    **قائمة "Authorized redirect URIs" (معرّفات الموارد المنتقل إليها المصرّح بها):**
    *   `https://pathkin.com/__/auth/handler`
    *   `https://yalla-58ccd.firebaseapp.com/__/auth/handler`
    *   `https://yalla-58ccd.web.app/__/auth/handler`

-   **انقر على "Save"**.
-   **انتظر 5-10 دقائق** حتى يتم تطبيق التغييرات على خوادم جوجل. هذه الخطوة مهمة جدًا.

**لماذا هذه الروابط مهمة؟**
-   **نطاقك المخصص (`pathkin.com`):** هو ما تريد أن يراه المستخدمون.
-   **النطاقات الافتراضية (`...firebaseapp.com` و `...web.app`):** لا يزال Firebase يستخدمها داخليًا. **حذفها يسبب مشاكل.**
-   **Localhost:** يسمح لك باختبار تسجيل الدخول عبر جوجل أثناء تطوير المشروع على جهازك.

### 4. بناء ونشر المشروع
بعد إتمام الخطوات السابقة، قم ببناء ونشر مشروعك.
```bash
npm run build
firebase deploy --only hosting
```
الآن، يجب أن يعمل تسجيل الدخول عبر جوجل بشكل صحيح على نطاقك المخصص `https://pathkin.com`.

---

## 🗺️ نظرة عامة

Pathkin هو تطبيق ويب اجتماعي مصمم للمسافرين والمغامرين.

## ✨ الميزات الرئيسية

- **المغامرات والقصص (Adventures & Stories):** مشاركة وعرض الخطط واللحظات.
- **خريطة تفاعلية (Interactive Map):** استكشاف الأنشطة ورسم المسارات.
- **إنشاء ديناميكي للمغامرات (Dynamic Adventure Creation):** مع مساعد وصف يعمل بالذكاء الاصطناعي.
- **خصوصية متقدمة (Advanced Privacy):** بما في ذلك خيارات "توائم الميلاد".
- **بحث متقدم (Advanced Search):** فلاتر للعثور على المغامرات والأشخاص.
- **ملف شخصي متكامل (Rich User Profiles):** مع إحصائيات ومحتوى منظم.
- **نظام رسائل ومحادثات جماعية (Messaging & Group Chats):** لكل مغامرة محادثتها الخاصة.
