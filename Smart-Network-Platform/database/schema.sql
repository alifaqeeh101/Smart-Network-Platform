-- ==========================================
-- اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
-- هدف الملف: إنشاء قاعدة بيانات المشروع والجداول مع الفهارس والعلاقات
-- لغة قاعدة البيانات: MySQL (رصينة ومتوافقة مع PHP Native)
-- ==========================================

-- 1. جدول المستخدمين (users) لإدارة الصلاحيات
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` ENUM('Administrator', 'Network Administrator', 'Operator', 'Viewer') NOT NULL DEFAULT 'Viewer',
    `full_name` VARCHAR(100) NOT NULL,
    `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_username` (`username`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول الأجهزة (devices) لتسجيل ومراقبة أجهزة الشبكة
CREATE TABLE IF NOT EXISTS `devices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL UNIQUE,
    `type` VARCHAR(50) NOT NULL, -- (e.g., Router, Switch, Server, Access Point)
    `location` VARCHAR(100) DEFAULT NULL,
    `latitude` DECIMAL(10, 8) DEFAULT NULL, -- لإحداثيات خريطة Leaflet
    `longitude` DECIMAL(11, 8) DEFAULT NULL, -- لإحداثيات خريطة Leaflet
    `status` ENUM('Online', 'Offline', 'Warning') DEFAULT 'Offline',
    `librenms_device_id` INT DEFAULT NULL UNIQUE, -- لربط الجهاز بـ LibreNMS API
    `community` VARCHAR(100) DEFAULT 'public', -- بروتوكول SNMP
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ip` (`ip_address`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول سجلات استهلاك الشبكة (traffic_logs)
CREATE TABLE IF NOT EXISTS `traffic_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `device_id` INT NOT NULL,
    `download_speed` DOUBLE NOT NULL DEFAULT 0.0, -- سرعة التنزيل بالميغابت/ثانية (Mbps)
    `upload_speed` DOUBLE NOT NULL DEFAULT 0.0,   -- سرعة الرفع بالميغابت/ثانية (Mbps)
    `bandwidth_usage` DOUBLE NOT NULL DEFAULT 0.0, -- كمية البيانات المستهلكة بالغيغابايت (GB)
    `logged_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_traffic_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE,
    INDEX `idx_logged_at` (`logged_at`),
    INDEX `idx_traffic_device` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول التنبيهات الذكية (alerts)
CREATE TABLE IF NOT EXISTS `alerts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `device_id` INT DEFAULT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('Device Down', 'High Bandwidth', 'High Load', 'Low Speed') NOT NULL,
    `severity` ENUM('Critical', 'Warning', 'Info') NOT NULL,
    `status` ENUM('Active', 'Resolved') DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `resolved_at` TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT `fk_alerts_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL,
    INDEX `idx_alerts_status` (`status`),
    INDEX `idx_alerts_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول التقارير (reports)
CREATE TABLE IF NOT EXISTS `reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `type` VARCHAR(50) NOT NULL, -- (e.g., Traffic, Alerts, Devices, Analytics)
    `generated_by` INT NOT NULL,
    `file_path` VARCHAR(255) DEFAULT NULL, -- مسار التقرير المحفوظ كـ PDF أو Excel
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reports_user` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_reports_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول جودة وحالة الشبكة ككل (network_status) لتخزين تحليلات بايثون
CREATE TABLE IF NOT EXISTS `network_status` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `status_score` INT NOT NULL DEFAULT 100, -- تقييم جودة الشبكة من 0 إلى 100
    `overall_quality` ENUM('Excellent', 'Good', 'Weak', 'Critical') NOT NULL DEFAULT 'Excellent',
    `latency` DOUBLE NOT NULL DEFAULT 0.0, -- زمن التأخير بالملي ثانية (ms)
    `packet_loss` DOUBLE NOT NULL DEFAULT 0.0, -- نسبة فقدان الحزم (%)
    `active_users` INT DEFAULT 0, -- عدد المستخدمين النشطين
    `checked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_checked_at` (`checked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول الإعدادات العامة للتحكم في المنصة وعتبات التنبيه (settings)
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- بيانات ابتدائية للتجربة والاختبار (Seeding)
-- ==========================================

-- كلمة المرور الافتراضية للمسؤول الرئيسي هي 'admin123' مشفرة باستخدام PASSWORD_DEFAULT
-- $2y$10$89X7gO1L1R7p5hY4u0f4uegT8M9S0D1L7U2hV1v3p5U8W0p5f5e5e (سيتم إنشاؤها عبر البرمجة لاحقاً، سنضع قيمة مشفرة هنا)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `full_name`, `status`) VALUES
(1, 'admin', '$2y$10$wE9mH6uE67BfeW935967U.W.O9/CgD37mU0b7i5M3I3G75E7T7/re', 'admin@smartnetwork.local', 'Administrator', 'مهندس الشبكة الرئيسي', 'Active'),
(2, 'operator', '$2y$10$wE9mH6uE67BfeW935967U.W.O9/CgD37mU0b7i5M3I3G75E7T7/re', 'operator@smartnetwork.local', 'Operator', 'مشغل الشبكة المناوب', 'Active'),
(3, 'viewer', '$2y$10$wE9mH6uE67BfeW935967U.W.O9/CgD37mU0b7i5M3I3G75E7T7/re', 'viewer@smartnetwork.local', 'Viewer', 'مراقب عام للشبكة', 'Active');

-- إضافة بعض الأجهزة الافتراضية للمراقبة
INSERT INTO `devices` (`id`, `name`, `ip_address`, `type`, `location`, `latitude`, `longitude`, `status`, `librenms_device_id`) VALUES
(1, 'الراوتر الرئيسي - Core Router', '192.168.1.1', 'Router', 'غرفة الخوادم الرئيسية (MDF)', 31.952200, 35.913200, 'Online', 101),
(2, 'موزع الدور الأول - Switch FL1', '192.168.1.10', 'Switch', 'موزع الطابق الأول (IDF1)', 31.953500, 35.914500, 'Online', 102),
(3, 'موزع الدور الثاني - Switch FL2', '192.168.1.11', 'Switch', 'موزع الطابق الثاني (IDF2)', 31.951000, 35.912000, 'Warning', 103),
(4, 'خادم البيانات - Storage NAS', '192.168.1.50', 'Server', 'غرفة الخوادم الرئيسية (MDF)', 31.952500, 35.913500, 'Offline', 104),
(5, 'نقطة بث قسم الهندسة - AP Engineering', '192.168.2.1', 'Access Point', 'مبنى الهندسة - الطابق الأرضي', 31.954000, 35.915000, 'Online', 105);

-- إضافة إعدادات افتراضية للنظام
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('librenms_api_url', 'http://192.168.1.100/api/v0'),
('librenms_api_token', '9a8b7c6d5e4f3g2h1i0j'),
('threshold_bandwidth_gb', '800'),
('threshold_latency_ms', '150'),
('threshold_packet_loss', '5'),
('alert_email', 'noc@smartnetwork.local'),
('network_name', 'شبكة الألياف الذكية - Smart Fiber Network');
