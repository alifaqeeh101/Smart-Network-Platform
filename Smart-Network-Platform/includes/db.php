<?php
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
 * هدف الملف: الاتصال بقاعدة البيانات بأمان باستخدام PDO مع معالجة الاستثناءات
 */

// إعدادات الاتصال بقاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'smart_network_db');
define('DB_PORT', '3306');

class Database {
    private $host = DB_HOST;
    private $user = DB_USER;
    private $pass = DB_PASS;
    private $dbname = DB_NAME;
    private $port = DB_PORT;
    
    private $dbh;
    private $error;
    private static $instance = null;

    // منع إنشاء كائن مباشر للحفاظ على نمط Singleton
    private function __construct() {
        // تعيين DSN
        $dsn = 'mysql:host=' . $this->host . ';port=' . $this->port . ';dbname=' . $this->dbname . ';charset=utf8mb4';
        
        // خيارات PDO للأمان والأداء
        $options = array(
            PDO::ATTR_PERSISTENT => true, // استخدام اتصالات مستمرة لزيادة السرعة
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // تفعيل الاستثناءات لمعالجة الأخطاء
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // جلب البيانات كمصفوفات ترابطية تلقائياً
            PDO::ATTR_EMULATE_PREPARES => false, // إيقاف محاكاة الاستعلامات لزيادة حماية SQL Injection
        );

        try {
            $this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            // في البيئة التجريبية، سنحاكي الاتصال أو نرجع رسالة توضيحية للمناقشة
            $this->dbh = null;
        }
    }

    // جلب النسخة الوحيدة للاتصال (Singleton Pattern)
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // جلب كائن الاتصال بـ PDO
    public function getConnection() {
        // لغايات العرض التقديمي في مشروع التخرج، إذا لم يكن خادم MySQL يعمل محلياً،
        // سنقوم بالاتصال الافتراضي، أو إرجاع كائن محاكاة لاحقاً عند اللزوم لمنع انهيار المنصة.
        return $this->dbh;
    }

    /**
     * تنفيذ استعلام آمن مع معلمات ممررة
     * @param string $sql استعلام الـ SQL
     * @param array $params المعلمات لمنع الحقن
     * @return PDOStatement | false
     */
    public function query($sql, $params = []) {
        if (!$this->dbh) {
            return false;
        }
        try {
            $stmt = $this->dbh->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }

    // جلب الخطأ في حال حدوثه
    public function getError() {
        return $this->error;
    }
}

// كود تفعيل ومثالي للاستخدام المباشر
// $db = Database::getInstance()->getConnection();
