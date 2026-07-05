<?php
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
 * هدف الملف: ترويسة الموقع المشتركة، شريط الملاحة الجانبي، والعلوي مع فحص الجلسات والصلاحيات
 */

// بدء الجلسة إذا لم تكن قد بدأت بالفعل
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// محاكاة مستخدم نشط لأغراض العرض التقديمي إذا لم يكن مسجلاً
if (!isset($_SESSION['user'])) {
    $_SESSION['user'] = [
        'id' => 1,
        'username' => 'admin',
        'full_name' => 'مهندس الشبكة الرئيسي',
        'role' => 'Administrator',
        'email' => 'admin@smartnetwork.local'
    ];
}

$currentUser = $_SESSION['user'];
$current_page = isset($page_title) ? $page_title : 'لوحة التحكم';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>المنصة الذكية للشبكات - <?php echo $current_page; ?></title>
    <!-- استيراد ملف التنسيق المخصص -->
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- استيراد مكتبة Leaflet للخرائط في حال كنا في صفحة الأجهزة أو الخرائط -->
    <?php if (isset($load_map) && $load_map): ?>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <?php endif; ?>
    <!-- استيراد مكتبة Chart.js للرسوم البيانية -->
    <?php if (isset($load_charts) && $load_charts): ?>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <?php endif; ?>
</head>
<body class="<?php echo isset($_COOKIE['theme']) && $_COOKIE['theme'] === 'dark' ? 'dark-theme' : ''; ?>">

<div class="app-container">
    <!-- 1. شريط التنقل الجانبي (Sidebar) -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <!-- أيقونة شبكة ذكية باستخدام SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/><circle cx="12" cy="12" r="3"/><circle cx="5" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
                <span>الشبكة الذكية</span>
            </div>
        </div>
        
        <nav class="sidebar-menu">
            <ul>
                <!-- لوحة التحكم - متاحة للجميع -->
                <li class="menu-item <?php echo $current_page == 'لوحة التحكم' ? 'active' : ''; ?>">
                    <a href="index.php?page=dashboard" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                        <span>لوحة التحكم</span>
                    </a>
                </li>

                <!-- إدارة الأجهزة - متاحة للمسؤول والمشغل -->
                <?php if (in_array($currentUser['role'], ['Administrator', 'Network Administrator', 'Operator'])): ?>
                <li class="menu-item <?php echo $current_page == 'إدارة الأجهزة' ? 'active' : ''; ?>">
                    <a href="index.php?page=devices" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                        <span>إدارة الأجهزة</span>
                    </a>
                </li>
                <?php endif; ?>

                <!-- مراقبة الاستهلاك والشبكة - متاحة للجميع -->
                <li class="menu-item <?php echo $current_page == 'مراقبة الاستهلاك' ? 'active' : ''; ?>">
                    <a href="index.php?page=traffic" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        <span>حركة الاستهلاك</span>
                    </a>
                </li>

                <!-- خرائط الشبكة تفاعلياً - متاحة للجميع -->
                <li class="menu-item <?php echo $current_page == 'خريطة الأجهزة' ? 'active' : ''; ?>">
                    <a href="index.php?page=map" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                        <span>خريطة الأجهزة</span>
                    </a>
                </li>

                <!-- التنبيهات والأمان - متاحة للجميع (أو المسؤول والمشغل للتحكم) -->
                <li class="menu-item <?php echo $current_page == 'التنبيهات' ? 'active' : ''; ?>">
                    <a href="index.php?page=alerts" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span>التنبيهات والتحذيرات</span>
                    </a>
                </li>

                <!-- التقارير والإحصائيات - متاحة للجميع للرصد، ومسؤولين لتوليد الملفات -->
                <li class="menu-item <?php echo $current_page == 'التقارير' ? 'active' : ''; ?>">
                    <a href="index.php?page=reports" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span>التقارير والطباعة</span>
                    </a>
                </li>

                <!-- إعدادات الشبكة والنظام - متاحة للمسؤول فقط -->
                <?php if ($currentUser['role'] == 'Administrator'): ?>
                <li class="menu-item <?php echo $current_page == 'الإعدادات' ? 'active' : ''; ?>">
                    <a href="index.php?page=settings" class="menu-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        <span>إعدادات المنصة</span>
                    </a>
                </li>
                <?php endif; ?>
            </ul>
        </nav>
        
        <div class="sidebar-footer">
            <div class="user-info-sidebar">
                <div class="user-avatar-small">
                    <?php echo mb_substr($currentUser['full_name'], 0, 1, 'utf-8'); ?>
                </div>
                <div class="user-details">
                    <span class="user-name-small"><?php echo $currentUser['full_name']; ?></span>
                    <span class="user-role-badge">
                        <?php 
                        $roles_ar = [
                            'Administrator' => 'مدير النظام',
                            'Network Administrator' => 'مسؤول الشبكة',
                            'Operator' => 'مُشغل الشبكة',
                            'Viewer' => 'مراقب عام'
                        ];
                        echo isset($roles_ar[$currentUser['role']]) ? $roles_ar[$currentUser['role']] : $currentUser['role'];
                        ?>
                    </span>
                </div>
            </div>
            <a href="index.php?page=logout" class="menu-link" style="margin-top: 10px; color: var(--danger-color); padding: 8px 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span style="font-size: 0.9rem; font-weight: 700;">تسجيل الخروج</span>
            </a>
        </div>
    </aside>

    <!-- 2. محتوى الصفحة الرئيسي (Main Content) -->
    <main class="main-content">
        <!-- شريط التنقل العلوي -->
        <header class="navbar">
            <div class="nav-left">
                <h1 class="page-title"><?php echo $current_page; ?></h1>
            </div>
            
            <div class="nav-right">
                <!-- زر التنبيهات الفورية السريعة -->
                <button class="notifications-btn" title="التنبيهات النشطة" onclick="window.location.href='index.php?page=alerts'">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
                
                <!-- زر تبديل الوضع الليلي والنهاري -->
                <button id="theme-toggle" class="theme-toggle-btn" title="تبديل الوضع الليلي/النهاري">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </button>
            </div>
        </header>

        <!-- غلاف المحتوى (سيتم إغلاق الوسم في الفوتر) -->
        <div class="content-wrapper">
