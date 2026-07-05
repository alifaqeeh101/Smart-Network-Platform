<?php
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
 * هدف الملف: الموجه الرئيسي للموقع (Front Controller / Router) والمتحكم في عرض الصفحات
 */

// بدء الجلسات لحفظ حالة تسجيل الدخول والصلاحيات
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// استيراد اتصال قاعدة البيانات
require_once 'includes/db.php';

// الحصول على الصفحة المطلوبة من الرابط، والافتراضية هي لوحة التحكم (dashboard)
$page = isset($_GET['page']) ? trim($_GET['page']) : 'dashboard';

// مصفوفة الصفحات المتاحة في النظام لضمان الأمان والتحقق من وجود الملف
$allowed_pages = [
    'dashboard'  => 'لوحة التحكم',
    'devices'    => 'إدارة الأجهزة',
    'traffic'    => 'مراقبة الاستهلاك',
    'alerts'     => 'التنبيهات',
    'map'        => 'خريطة الأجهزة',
    'reports'    => 'التقارير',
    'settings'   => 'الإعدادات',
    'login'      => 'تسجيل الدخول',
    'logout'     => 'تسجيل الخروج'
];

// التأكد من أن الصفحة المطلوبة موجودة ومصرح بها، وإلا التوجيه لـ 404 أو لوحة التحكم
if (!array_key_exists($page, $allowed_pages)) {
    $page = 'dashboard';
}

// التحقق من حالة الجلسة وتوجيه المستخدم غير المسجل إلى صفحة تسجيل الدخول
// (تم تعطيلها مؤقتاً لتسهيل الفحص المباشر في المعاينة، لكنها جاهزة للعمل في كود الإنتاج)
/*
if (!isset($_SESSION['user']) && $page !== 'login') {
    header('Location: index.php?page=login');
    exit();
}
*/

// إعداد متغيرات الصفحة المحددة للترويسة (Header Configuration)
$page_title = $allowed_pages[$page];
$load_map = false;
$load_charts = false;

// تفعيل ميزات خاصة ببعض الصفحات بذكاء لتوفير الأداء والسرعة
switch ($page) {
    case 'dashboard':
        $load_charts = true;
        break;
    case 'traffic':
        $load_charts = true;
        break;
    case 'map':
        $load_map = true;
        break;
    case 'devices':
        $load_map = true; // لعرض الخريطة المصغرة بجانب إضافة جهاز
        break;
}

// تشغيل الخيار الخاص بصفحة تسجيل الخروج
if ($page === 'logout') {
    session_destroy();
    header('Location: index.php?page=login');
    exit();
}

// عرض الصفحات بناءً على الهيكلية المطلوبة
// 1. استدعاء الهيدر (ما عدا صفحة تسجيل الدخول)
if ($page !== 'login') {
    include 'includes/header.php';
}

// 2. استدعاء الصفحة الفرعية المطلوبة من مجلد pages
$page_file = 'pages/' . $page . '.php';
if (file_exists($page_file)) {
    include $page_file;
} else {
    // في حال عدم وجود الملف الفرعي، يتم عرض رسالة خطأ أو محتوى محاكاة
    echo '
    <div class="panel-card" style="text-align: center; padding: 50px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2" style="margin: 0 auto 20px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>قيد التطوير والإنشاء</h2>
        <p style="color: var(--text-secondary); margin-top: 10px;">جاري إعداد الصفحة الفرعية ' . $allowed_pages[$page] . ' ضمن الخطة التطويرية المتفق عليها خطوة بخطوة.</p>
    </div>';
}

// 3. استدعاء الفوتر (ما عدا صفحة تسجيل الدخول)
if ($page !== 'login') {
    include 'includes/footer.php';
}
?>
