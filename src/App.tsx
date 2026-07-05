// التحديث الأخير لتمكين وتنشيط التصدير المباشر إلى GitHub
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Server, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Settings, 
  Users, 
  Code, 
  BookOpen, 
  Database, 
  Sun, 
  Moon, 
  Cpu, 
  CheckCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  Clock, 
  HardDrive, 
  Wifi, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X
} from 'lucide-react';
import { ThesisHub } from './components/ThesisHub';

// تزويد المحاكي بنسخ الأكواد التي قمنا بإنشائها حالياً ليتمكن المستخدم من تصفحها
const sourceFiles = [
  {
    path: 'Smart-Network-Platform/database/schema.sql',
    name: 'schema.sql (هيكل قاعدة البيانات)',
    lang: 'sql',
    description: 'يحتوي على جداول النظام (المستخدمين، الأجهزة، سجلات الترافيك، التنبيهات، التقارير، حالة الشبكة، الإعدادات) مع الفهارس والعلاقات وبيانات الفحص الأولية (Seeding).',
    code: `-- ==========================================
-- اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
-- هدف الملف: إنشاء قاعدة بيانات المشروع والجداول مع الفهارس والعلاقات
-- لغة قاعدة البيانات: MySQL (رصينة ومتوافقة مع PHP Native)
-- ==========================================

-- 1. جدول المستخدمين (users) لإدارة الصلاحيات
CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`username\` VARCHAR(50) NOT NULL UNIQUE,
    \`password\` VARCHAR(255) NOT NULL,
    \`email\` VARCHAR(100) NOT NULL UNIQUE,
    \`role\` ENUM('Administrator', 'Network Administrator', 'Operator', 'Viewer') NOT NULL DEFAULT 'Viewer',
    \`full_name\` VARCHAR(100) NOT NULL,
    \`status\` ENUM('Active', 'Inactive') DEFAULT 'Active',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_username\` (\`username\`),
    INDEX \`idx_role\` (\`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول الأجهزة (devices) لتسجيل ومراقبة أجهزة الشبكة
CREATE TABLE IF NOT EXISTS \`devices\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`name\` VARCHAR(100) NOT NULL,
    \`ip_address\` VARCHAR(45) NOT NULL UNIQUE,
    \`type\` VARCHAR(50) NOT NULL, -- (e.g., Router, Switch, Server, Access Point)
    \`location\` VARCHAR(100) DEFAULT NULL,
    \`latitude\` DECIMAL(10, 8) DEFAULT NULL, -- لإحداثيات خريطة Leaflet
    \`longitude\` DECIMAL(11, 8) DEFAULT NULL, -- لإحداثيات خريطة Leaflet
    \`status\` ENUM('Online', 'Offline', 'Warning') DEFAULT 'Offline',
    \`librenms_device_id\` INT DEFAULT NULL UNIQUE, -- لربط الجهاز بـ LibreNMS API
    \`community\` VARCHAR(100) DEFAULT 'public', -- بروتوكول SNMP
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_ip\` (\`ip_address\`),
    INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    path: 'Smart-Network-Platform/includes/db.php',
    name: 'db.php (الاتصال بقاعدة البيانات)',
    lang: 'php',
    description: 'ملف الاتصال بقاعدة البيانات باستخدام PDO. يعتمد نمط التصميم Singleton لمنع تكرار فتح الاتصالات وتأمين الاستعلامات ضد ثغرات حقن SQL.',
    code: `<?php
/**
 * اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
 * هدف الملف: الاتصال بقاعدة البيانات بأمان باستخدام PDO مع معالجة الاستثناءات
 */

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

    private function __construct() {
        $dsn = 'mysql:host=' . $this->host . ';port=' . $this->port . ';dbname=' . $this->dbname . ';charset=utf8mb4';
        $options = array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        );

        try {
            $this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            $this->dbh = null;
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->dbh;
    }

    public function query($sql, $params = []) {
        if (!$this->dbh) { return false; }
        try {
            $stmt = $this->dbh->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }
}`
  },
  {
    path: 'Smart-Network-Platform/assets/css/style.css',
    name: 'style.css (التنسيق الجمالي المخصص)',
    lang: 'css',
    description: 'ملف التنسيق الشامل والمخصص للمنصة من الصفر بدون أي إطار عمل خارجي. يحتوي على متغيرات CSS للتبديل بين الوضع المظلم والمضيء، وتخطيط مستجيب مع تأثيرات حركية.',
    code: `/* تعريف المتغيرات الافتراضية (الوضع المضيء Light Mode) */
:root {
    --bg-primary: #f4f6fa;
    --bg-secondary: #ffffff;
    --bg-sidebar: #0f172a;
    --sidebar-text: #94a3b8;
    --text-primary: #1e293b;
    --accent-color: #2563eb;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --border-color: #e2e8f0;
    --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    --font-sans: 'Cairo', system-ui, sans-serif;
}

body.dark-theme {
    --bg-primary: #080c14;
    --bg-secondary: #111827;
    --text-primary: #f3f4f6;
    --border-color: #1f2937;
    --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}`
  },
  {
    path: 'Smart-Network-Platform/index.php',
    name: 'index.php (الموجّه الأساسي Router)',
    lang: 'php',
    description: 'المتحكم والـ Front Controller في المنصة. يستقبل المعلمة (page) ويوجه لملفات العرض والصفحات الفرعية المناسبة بذكاء مع التحقق من الجلسات.',
    code: `<?php
/**
 * اسم المشروع: منصة ذكية لإدارة ومراقبة وتحليل شبكات الإنترنت
 * هدف الملف: الموجه الرئيسي للموقع (Front Controller / Router) والمتحكم في عرض الصفحات
 */

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

require_once 'includes/db.php';

$page = isset($_GET['page']) ? trim($_GET['page']) : 'dashboard';

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

if (!array_key_exists($page, $allowed_pages)) {
    $page = 'dashboard';
}

$page_title = $allowed_pages[$page];
$load_map = ($page === 'map' || $page === 'devices');
$load_charts = ($page === 'dashboard' || $page === 'traffic');

if ($page !== 'login') {
    include 'includes/header.php';
}

$page_file = 'pages/' . $page . '.php';
if (file_exists($page_file)) {
    include $page_file;
}

if ($page !== 'login') {
    include 'includes/footer.php';
}
?>`
  }
];

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'preview' | 'code' | 'uml'>('preview');
  const [activePlatformPage, setActivePlatformPage] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [engineerName, setEngineerName] = useState<string>('علي الفقيه');
  const [engineerRole, setEngineerRole] = useState<string>('مدير النظام والشبكة');
  
  // شجرة الملفات لمتصفح الأكواد
  const [selectedFile, setSelectedFile] = useState<typeof sourceFiles[0]>(sourceFiles[0]);

  // حالة محاكاة الأجهزة
  const [devices, setDevices] = useState([
    { id: 1, name: 'الراوتر الرئيسي - Core Router', ip: '192.168.1.1', type: 'Router', location: 'غرفة الخوادم MDF', status: 'Online', lat: 31.9522, lng: 35.9132, librenmsId: 101, community: 'public' },
    { id: 2, name: 'موزع الدور الأول - Switch FL1', ip: '192.168.1.10', type: 'Switch', location: 'موزع الطابق الأول IDF1', status: 'Online', lat: 31.9535, lng: 35.9145, librenmsId: 102, community: 'public' },
    { id: 3, name: 'موزع الدور الثاني - Switch FL2', ip: '192.168.1.11', type: 'Switch', location: 'موزع الطابق الثاني IDF2', status: 'Warning', lat: 31.9510, lng: 35.9120, librenmsId: 103, community: 'public' },
    { id: 4, name: 'خادم البيانات - Storage NAS', ip: '192.168.1.50', type: 'Server', location: 'غرفة الخوادم MDF', status: 'Offline', lat: 31.9525, lng: 35.9135, librenmsId: 104, community: 'public' },
    { id: 5, name: 'نقطة بث قسم الهندسة - AP Engineering', ip: '192.168.2.1', type: 'Access Point', location: 'مبنى الهندسة', status: 'Online', lat: 31.9540, lng: 35.9150, librenmsId: 105, community: 'public' },
  ]);

  // حالة إضافة جهاز جديد في المحاكي
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIp, setNewDeviceIp] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Router');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');
  const [newDeviceLat, setNewDeviceLat] = useState('31.9520');
  const [newDeviceLng, setNewDeviceLng] = useState('35.9130');
  const [newDeviceLibreId, setNewDeviceLibreId] = useState('');

  // حالات المحاكاة التفاعلية الأخرى
  const [alerts, setAlerts] = useState([
    { id: 1, device: 'Storage NAS', type: 'Device Down', title: 'انقطاع الاتصال بالخادم', message: 'خادم البيانات NAS لا يستجيب لطلبات PING والـ SNMP منذ 5 دقائق.', severity: 'Critical', status: 'Active', time: '12:10' },
    { id: 2, device: 'Switch FL2', type: 'High Load', title: 'ارتفاع ضغط المعالج', message: 'معدل استهلاك المعالج تجاوز 92% على المنفذ الرئيسي 24.', severity: 'Warning', status: 'Active', time: '11:45' },
    { id: 3, device: 'AP Engineering', type: 'High Bandwidth', title: 'استهلاك غير طبيعي للبيانات', message: 'معدل نقل البيانات الحالي تجاوز 450 Mbps في قسم الهندسة.', severity: 'Warning', status: 'Active', time: '11:32' },
  ]);

  // محاكاة تحليلات بايثون للذكاء الاصطناعي
  const [pythonAnalyzing, setPythonAnalyzing] = useState(false);
  const [networkHealth, setNetworkHealth] = useState<{
    score: number;
    status: 'Excellent' | 'Good' | 'Weak' | 'Critical';
    latency: number;
    loss: number;
    activeUsers: number;
    advice: string;
  } | null>({
    score: 85,
    status: 'Good',
    latency: 24,
    loss: 0.2,
    activeUsers: 142,
    advice: 'أداء الشبكة مستقر إجمالاً. هناك انقطاع في خادم NAS وضغط طفيف على موزع الطابق الثاني Switch FL2. يوصى بفحص كابلات الألياف المؤدية للدور الثاني.'
  });

  // تدوير تحليلات الذكاء الاصطناعي
  const runPythonAnalysis = () => {
    setPythonAnalyzing(true);
    setTimeout(() => {
      // حساب قيم عشوائية ذكية بناءً على حالة الأجهزة
      const offlineCount = devices.filter(d => d.status === 'Offline').length;
      const warningCount = devices.filter(d => d.status === 'Warning').length;
      
      let score = 95 - (offlineCount * 15) - (warningCount * 8);
      if (score < 10) score = 10;

      let status: 'Excellent' | 'Good' | 'Weak' | 'Critical' = 'Excellent';
      let advice = 'الشبكة ممتازة وجميع الأجهزة تعمل بكفاءة تامة دون أي اختناقات.';
      if (score < 90 && score >= 75) {
        status = 'Good';
        advice = 'أداء الشبكة جيد جداً، لكن يوجد بعض الإنذارات الفرعية أو جهاز منقطع غير حيوي. يوصى بمراجعة الأجهزة الصفراء.';
      } else if (score < 75 && score >= 50) {
        status = 'Weak';
        advice = 'الشبكة تعاني من ضعف واضح. يوجد أكثر من جهاز منقطع وهناك مؤشرات على بطء الاستجابة لبعض الخوادم.';
      } else if (score < 50) {
        status = 'Critical';
        advice = 'حالة حرجة! الأجهزة الحيوية كالموزعات والراوترات تعاني من توقف كامل. يتطلب تدخل فوري من مهندس الشبكة.';
      }

      setNetworkHealth({
        score,
        status,
        latency: Math.floor(Math.random() * 40) + (offlineCount * 15) + 10,
        loss: parseFloat((Math.random() * 2 + (offlineCount * 0.8)).toFixed(2)),
        activeUsers: Math.floor(Math.random() * 100) + 100,
        advice
      });
      setPythonAnalyzing(false);
    }, 1500);
  };

  // محاكاة إضافة جهاز
  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newDeviceIp) {
      alert('الرجاء إدخال اسم الجهاز وعنوان IP');
      return;
    }
    const newDev = {
      id: devices.length + 1,
      name: newDeviceName,
      ip: newDeviceIp,
      type: newDeviceType,
      location: newDeviceLocation || 'غير محدد جغرافياً',
      status: 'Online' as const,
      lat: parseFloat(newDeviceLat) || 31.95,
      lng: parseFloat(newDeviceLng) || 35.91,
      librenmsId: parseInt(newDeviceLibreId) || Math.floor(Math.random() * 200) + 200,
      community: 'public'
    };
    setDevices([...devices, newDev]);
    
    // إفراغ الحقول
    setNewDeviceName('');
    setNewDeviceIp('');
    setNewDeviceLocation('');
    setNewDeviceLibreId('');

    // إضافة تنبيه نجاح محاكى
    const notification = {
      id: alerts.length + 1,
      device: newDev.name,
      type: 'Info' as any,
      title: 'تم تسجيل جهاز جديد بنجاح',
      message: `تم دمج الجهاز ${newDev.name} بالعنوان ${newDev.ip} بنجاح مع LibreNMS API برقم معرف ${newDev.librenmsId}.`,
      severity: 'Info' as const,
      status: 'Resolved' as const,
      time: 'الآن'
    };
    setAlerts([notification, ...alerts]);
  };

  // حذف جهاز
  const handleDeleteDevice = (id: number) => {
    const dev = devices.find(d => d.id === id);
    if (confirm(`هل أنت متأكد من حذف الجهاز: ${dev?.name}؟`)) {
      setDevices(devices.filter(d => d.id !== id));
    }
  };

  // تغيير مظهر المحاكي
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-gray-200 flex flex-col font-sans" dir="rtl">
      {/* 1. الترويسة العليا لمنصة العرض الأكاديمية */}
      <header className="bg-[#111218] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              مشروع التخرج: منصة المراقبة والتحليل الذكي للشبكات
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              بيئة تقديمية تفاعلية ومحاكاة حية للمناقشة | مهندس برمجيات وشبكات Full Stack
            </p>
          </div>
        </div>

        {/* أزرار تبديل مساحات العمل */}
        <div className="flex bg-[#0A0B10] p-1.5 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveWorkspaceTab('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${activeWorkspaceTab === 'preview' ? 'bg-white/5 text-cyan-400 border-cyan-500/30 shadow-md shadow-cyan-500/10' : 'text-gray-400 hover:text-white border-transparent'}`}
          >
            <Activity className="w-4 h-4" />
            <span>محاكي المنصة التفاعلي</span>
          </button>
          
          <button 
            onClick={() => setActiveWorkspaceTab('code')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${activeWorkspaceTab === 'code' ? 'bg-white/5 text-cyan-400 border-cyan-500/30 shadow-md shadow-cyan-500/10' : 'text-gray-400 hover:text-white border-transparent'}`}
          >
            <Code className="w-4 h-4" />
            <span>مستعرض كود PHP/MySQL</span>
          </button>

          <button 
            onClick={() => setActiveWorkspaceTab('uml')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${activeWorkspaceTab === 'uml' ? 'bg-white/5 text-cyan-400 border-cyan-500/30 shadow-md shadow-cyan-500/10' : 'text-gray-400 hover:text-white border-transparent'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مخططات UML والتوثيق</span>
          </button>
        </div>
      </header>

      {/* 2. منطقة العمل الأساسية */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* التبويب الأول: محاكي المنصة الحية والواجهات الذكية */}
        {/* ========================================================= */}
        {activeWorkspaceTab === 'preview' && (
          <div className="flex-1 flex flex-col md:flex-row transition-all duration-300 bg-[#0A0B10] text-gray-200">
            
            {/* أ. شريط التنقل الجانبي المحاكي للـ PHP */}
            <aside className={`w-full md:w-64 flex-col shrink-0 bg-[#111218] border-l border-white/10 ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                      <Server className="w-5 h-5" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white">الشبكة الذكية</h1>
                  </div>
                  {/* زر إغلاق القائمة في الجوال داخل القائمة الجانبية نفسها */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                {[
                  { id: 'dashboard', name: 'لوحة التحكم', icon: Activity },
                  { id: 'devices', name: 'إدارة الأجهزة', icon: Server },
                  { id: 'traffic', name: 'حركة الاستهلاك', icon: TrendingUp },
                  { id: 'map', name: 'خريطة الأجهزة', icon: MapPin },
                  { id: 'alerts', name: 'التنبيهات والتحذيرات', icon: AlertTriangle },
                  { id: 'reports', name: 'التقارير والطباعة', icon: FileText },
                  { id: 'thesis', name: 'التوثيق الأكاديمي 🎓', icon: BookOpen },
                  { id: 'settings', name: 'إعدادات المنصة', icon: Settings },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activePlatformPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePlatformPage(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-right transition-colors rounded-md text-sm ${
                        isActive 
                        ? 'bg-white/5 text-cyan-400 border-r-2 border-cyan-400 font-medium' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-80" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 mt-auto">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase">Python AI Active</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">صحة الشبكة: <span className="text-emerald-300">ممتازة Excellent</span></p>
                </div>
              </div>
            </aside>

            {/* ب. المحتوى الرئيسي لصفحات المنصة */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* شريط الملاحة العلوي للمحاكي */}
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#0D0E14] shrink-0">
                <div className="flex items-center gap-3">
                  {/* زر فتح القائمة الجانبية في الجوال */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center justify-center"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <span className="text-xs md:text-sm text-gray-400 font-medium">نظرة عامة على مسؤول الشبكة</span>
                  <div className="hidden sm:block h-4 w-[1px] bg-white/10"></div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-emerald-500 font-medium">LibreNMS Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="text-left font-sans">
                      <div className="text-xs font-bold text-white text-left">{engineerName}</div>
                      <div className="text-[10px] text-gray-500 text-left">{engineerRole}</div>
                    </div>
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600"></div>
                  </div>
                </div>
              </div>

              {/* غلاف محتوى صفحات المنصة */}
              <div className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto flex flex-col gap-6">

                {/* =================================== */}
                {/* 1. صفحة لوحة التحكم (DASHBOARD) */}
                {/* =================================== */}
                {activePlatformPage === 'dashboard' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    
                    {/* بطاقات الإحصائيات الفورية */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="p-5 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-between bg-[#111218] shadow-lg shadow-black/20">
                        <div className="absolute top-0 right-0 w-1 h-full bg-cyan-400"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-400">إجمالي الأجهزة المعرفة</span>
                          <span className="text-3xl font-extrabold text-white">{devices.length}</span>
                        </div>
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                          <Server className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-between bg-[#111218] shadow-lg shadow-black/20">
                        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-400"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-400">الأجهزة المتصلة (Online)</span>
                          <span className="text-3xl font-extrabold text-emerald-400">
                            {devices.filter(d => d.status === 'Online').length}
                          </span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                          <Wifi className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-between bg-[#111218] shadow-lg shadow-black/20">
                        <div className="absolute top-0 right-0 w-1 h-full bg-rose-400"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-400">الأجهزة المتوقفة (Offline)</span>
                          <span className="text-3xl font-extrabold text-rose-400">
                            {devices.filter(d => d.status === 'Offline').length}
                          </span>
                        </div>
                        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-between bg-[#111218] shadow-lg shadow-black/20">
                        <div className="absolute top-0 right-0 w-1 h-full bg-amber-400"></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-400">التنبيهات النشطة حالياً</span>
                          <span className="text-3xl font-extrabold text-amber-400">
                            {alerts.filter(a => a.status === 'Active').length}
                          </span>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      </div>

                    </div>

                    {/* قسم وحدة تحليل بايثون للذكاء الاصطناعي مدمج في لوحة التحكم */}
                    <div className="p-6 rounded-xl border border-cyan-500/20 bg-[#111218] text-white relative overflow-hidden shadow-xl shadow-cyan-950/10">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                            <Cpu className="w-6 h-6 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">وحدة التحليل والتقييم الذكي (بايثون + ذكاء اصطناعي)</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              يقوم البرنامج النصي المبرمج بلغة بايثون بقراءة عينات استهلاك المرور وفحص تأخير الأجهزة لتوليد تقييم فوري لجودة الشبكة وتوقعات الأحمال.
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={runPythonAnalysis}
                          disabled={pythonAnalyzing}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/5 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
                        >
                          <RefreshCw className={`w-4 h-4 ${pythonAnalyzing ? 'animate-spin' : ''}`} />
                          <span>{pythonAnalyzing ? 'جاري التحليل واستدعاء وحدة بايثون...' : 'تشغيل التحليل الفوري للشبكة'}</span>
                        </button>
                      </div>

                      {networkHealth && (
                        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6">
                          
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full border-4 border-cyan-500/20 flex items-center justify-center font-extrabold text-xl text-cyan-400">
                              %{networkHealth.score}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400">معدل كفاءة الشبكة</span>
                              <span className={`text-sm font-bold ${
                                networkHealth.status === 'Excellent' || networkHealth.status === 'Good' 
                                ? 'text-emerald-400' : 'text-rose-400'
                              }`}>{networkHealth.status === 'Excellent' ? 'ممتاز Excellent' : networkHealth.status === 'Good' ? 'جيد Good' : 'ضعيف Weak'}</span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400">متوسط زمن التأخير Latency</span>
                            <span className="text-base font-extrabold text-gray-200 mt-0.5">{networkHealth.latency} ms</span>
                          </div>

                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400">نسبة فقدان الحزم Packet Loss</span>
                            <span className="text-base font-extrabold text-gray-200 mt-0.5">%{networkHealth.loss}</span>
                          </div>

                          <div className="md:col-span-1 bg-white/5 p-4 rounded-lg border border-white/10">
                            <span className="text-[10px] text-cyan-400 font-bold block mb-1">توصيات المهندس الذكي (AI Recommendation):</span>
                            <p className="text-xs text-gray-300 leading-relaxed">{networkHealth.advice}</p>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* تخطيط عمودين للرسوم والبيانات */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* محاكاة الرسم البياني والـ Traffic */}
                      <div className="lg:col-span-2 p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                          <h4 className="font-bold text-sm flex items-center gap-2 text-white">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span>معدل استهلاك ترافيك الإنترنت (الـ 24 ساعة الماضية)</span>
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono">تحديث كل 5 دقائق</span>
                        </div>
                        
                        {/* واجهة محاكية لرسم Chart.js الفعلي */}
                        <div className="h-60 flex flex-col justify-between pt-4 relative">
                          <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-500 pointer-events-none">
                            <div className="border-b border-white/5 w-full pb-1">1000 Mbps (أقصى سعة)</div>
                            <div className="border-b border-white/5 w-full pb-1">750 Mbps</div>
                            <div className="border-b border-white/5 w-full pb-1">500 Mbps</div>
                            <div className="border-b border-white/5 w-full pb-1">250 Mbps</div>
                            <div className="w-full">0 Mbps</div>
                          </div>

                          <div className="h-44 w-full flex items-end gap-3 px-10 relative z-10 pt-6">
                            {[120, 240, 450, 780, 890, 620, 410, 320, 480, 710, 920, 610].map((val, idx) => (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                <div className="text-[9px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#0A0B10] px-1 py-0.5 rounded border border-white/10 -translate-y-1">
                                  {val}M
                                </div>
                                <div 
                                  style={{ height: `${(val / 1000) * 100}%` }}
                                  className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-500/10"
                                ></div>
                                <span className="text-[9px] text-gray-500 font-mono">{idx * 2}:00</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400 border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-cyan-500 rounded"></span>
                            <span>التحميل الحالي (Download)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-cyan-400 rounded"></span>
                            <span>أوقات الذروة (Peak Hours): 18:00 - 22:00</span>
                          </div>
                        </div>
                      </div>

                      {/* أحدث التنبيهات الفورية */}
                      <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                          <h4 className="font-bold text-sm flex items-center gap-2 text-white">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span>تنبيهات النظام النشطة</span>
                          </h4>
                          <span className="text-xs text-rose-500 font-bold">{alerts.length} إنذارات</span>
                        </div>

                        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                          {alerts.map(alert => (
                            <div 
                              key={alert.id}
                              className={`p-3.5 rounded-lg border flex items-start gap-3 border-r-2 ${
                                alert.severity === 'Critical' 
                                ? 'bg-[#1C1215] border-white/5 border-r-rose-500 text-rose-200' 
                                : 'bg-[#1C1612] border-white/5 border-r-amber-500 text-amber-200'
                              }`}
                            >
                              <div className="flex-1 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">{alert.title}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{alert.time}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">الجهاز: {alert.device}</span>
                                <p className="text-[11px] leading-relaxed mt-0.5 text-gray-300">{alert.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}


                {/* =================================== */}
                {/* 2. صفحة إدارة الأجهزة (DEVICES) */}
                {/* =================================== */}
                {activePlatformPage === 'devices' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    
                    {/* فورم إضافة جهاز */}
                    <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                      <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-cyan-400">
                        <Plus className="w-5 h-5" />
                        <span>تسجيل جهاز شبكي جديد ببروتوكول SNMP / LibreNMS</span>
                      </h3>
                      
                      <form onSubmit={handleAddDevice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">اسم الجهاز</label>
                          <input 
                            type="text" 
                            placeholder="مثال: Router HQ-Core"
                            value={newDeviceName}
                            onChange={e => setNewDeviceName(e.target.value)}
                            className="p-3 bg-[#0A0B10] border border-white/10 focus:border-cyan-500 outline-none text-white rounded-lg text-sm transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">عنوان IP الخاص بالجهاز</label>
                          <input 
                            type="text" 
                            placeholder="مثال: 192.168.1.1"
                            value={newDeviceIp}
                            onChange={e => setNewDeviceIp(e.target.value)}
                            className="p-3 bg-[#0A0B10] border border-white/10 focus:border-cyan-500 outline-none text-white rounded-lg text-sm text-left transition-all"
                            dir="ltr"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">نوع الجهاز</label>
                          <select 
                            value={newDeviceType}
                            onChange={e => setNewDeviceType(e.target.value)}
                            className="p-3 bg-[#0A0B10] border border-white/10 focus:border-cyan-500 outline-none text-white rounded-lg text-sm transition-all"
                          >
                            <option value="Router" className="bg-[#111218]">موجه (Router)</option>
                            <option value="Switch" className="bg-[#111218]">موزع (Switch)</option>
                            <option value="Server" className="bg-[#111218]">خادم (Server)</option>
                            <option value="Access Point" className="bg-[#111218]">نقطة بث (Access Point)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">الموقع الجغرافي / الغرفة</label>
                          <input 
                            type="text" 
                            placeholder="مثال: مبنى الإدارة - الطابق الثالث"
                            value={newDeviceLocation}
                            onChange={e => setNewDeviceLocation(e.target.value)}
                            className="p-3 bg-[#0A0B10] border border-white/10 focus:border-cyan-500 outline-none text-white rounded-lg text-sm transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">رقم المعرف في LibreNMS (متاح للاستعلام)</label>
                          <input 
                            type="number" 
                            placeholder="مثال: 110"
                            value={newDeviceLibreId}
                            onChange={e => setNewDeviceLibreId(e.target.value)}
                            className="p-3 bg-[#0A0B10] border border-white/10 focus:border-cyan-500 outline-none text-white rounded-lg text-sm transition-all"
                          />
                        </div>

                        <div className="flex items-end">
                          <button 
                            type="submit"
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                          >
                            إضافة وتسجيل الجهاز
                          </button>
                        </div>

                      </form>
                    </div>

                    {/* جدول قائمة الأجهزة */}
                    <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                        <h4 className="font-bold text-base text-white">جدول أجهزة الشبكة المسجلة في قاعدة البيانات والـ API</h4>
                        <span className="text-xs text-gray-400">إجمالي الأجهزة: {devices.length}</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-[#0A0B10] text-gray-400 border-b border-white/5">
                              <th className="p-3">اسم الجهاز</th>
                              <th className="p-3 text-left" dir="ltr">IP Address</th>
                              <th className="p-3">نوع الجهاز</th>
                              <th className="p-3">الموقع</th>
                              <th className="p-3">LibreNMS ID</th>
                              <th className="p-3">حالة الاتصال</th>
                              <th className="p-3 text-center">العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {devices.map(dev => (
                              <tr key={dev.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                <td className="p-3 font-semibold text-gray-200">{dev.name}</td>
                                <td className="p-3 text-left font-mono text-gray-300" dir="ltr">{dev.ip}</td>
                                <td className="p-3">
                                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded font-bold">
                                    {dev.type}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-300">{dev.location}</td>
                                <td className="p-3 font-mono text-gray-400">{dev.librenmsId}</td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    dev.status === 'Online' 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : dev.status === 'Warning' 
                                      ? 'bg-amber-500/10 text-amber-400'
                                      : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                    ● {dev.status === 'Online' ? 'متصل حي' : dev.status === 'Warning' ? 'استجابة بطيئة' : 'منقطع الاتصال'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => handleDeleteDevice(dev.id)}
                                      className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                      title="حذف الجهاز من المنصة"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* =================================== */}
                {/* 3. صفحة حركة الاستهلاك (TRAFFIC) */}
                {/* =================================== */}
                {activePlatformPage === 'traffic' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                      <h3 className="font-bold text-base mb-2 text-white">تحليل وتحكم استهلاك ترافيك الإنترنت</h3>
                      <p className="text-xs text-gray-400 mb-6">
                        تعرض هذه الصفحة تحليلاً لحظياً لسرعات الرفع والتحميل الكلية للشبكة، وكمية النطاق الترددي المستهلك (Bandwidth) المسترجع من LibreNMS API.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div className="p-5 rounded-lg bg-[#0A0B10] border border-white/5 flex flex-col gap-2">
                          <span className="text-xs text-gray-400">إجمالي الرفع الكلي للشبكة (Total Upload)</span>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-cyan-400">145.2 Mbps</span>
                            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                              <ArrowUpRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-lg bg-[#0A0B10] border border-white/5 flex flex-col gap-2">
                          <span className="text-xs text-gray-400">إجمالي التنزيل الكلي للشبكة (Total Download)</span>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-400">680.4 Mbps</span>
                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                              <ArrowDownRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-lg bg-[#0A0B10] border border-white/5 flex flex-col gap-2">
                          <span className="text-xs text-gray-400">حجم النطاق الترددي المستهلك اليوم</span>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-amber-400">1.2 Terabytes</span>
                            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                              <HardDrive className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* جدول سجل حركة المرور */}
                      <div className="mt-8">
                        <h4 className="font-bold text-sm mb-4 text-white">سجل حركة البيانات التاريخي للأجهزة (مخرجات قاعدة البيانات)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-[#0A0B10] text-gray-400 border-b border-white/5">
                                <th className="p-3">اسم الجهاز</th>
                                <th className="p-3">معدل التحميل الحالي</th>
                                <th className="p-3">معدل الرفع الحالي</th>
                                <th className="p-3">حجم استهلاك اليوم (GB)</th>
                                <th className="p-3">وقت آخر فحص</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { name: 'الراوتر الرئيسي', down: '540 Mbps', up: '95 Mbps', usage: '650 GB', time: '12:15' },
                                { name: 'موزع الدور الأول', down: '85 Mbps', up: '12 Mbps', usage: '120 GB', time: '12:14' },
                                { name: 'موزع الدور الثاني', down: '42 Mbps', up: '8 Mbps', usage: '85 GB', time: '12:12' },
                                { name: 'نقطة بث قسم الهندسة', down: '310 Mbps', up: '45 Mbps', usage: '380 GB', time: '12:10' }
                              ].map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                  <td className="p-3 font-semibold text-gray-200">{row.name}</td>
                                  <td className="p-3 font-mono text-emerald-400">{row.down}</td>
                                  <td className="p-3 font-mono text-cyan-400">{row.up}</td>
                                  <td className="p-3 font-mono text-gray-300">{row.usage}</td>
                                  <td className="p-3 font-mono text-gray-400">{row.time}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* =================================== */}
                {/* 4. صفحة الخريطة التفاعلية (MAP) */}
                {/* =================================== */}
                {activePlatformPage === 'map' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                      <h3 className="font-bold text-base mb-2 text-white">التمثيل الجغرافي وخريطة أجهزة الشبكة تفاعلياً (Leaflet.js)</h3>
                      <p className="text-xs text-gray-400 mb-6">
                        تسمح هذه الخريطة تفاعلياً لمسؤول الشبكة برصد المواقع الجغرافية للأجهزة، وعرض حالتها (أخضر للمتصل، أحمر للمتوقف) عبر أيقونات ونقاط تفاعلية مبنية بـ Leaflet.js.
                      </p>

                      {/* محاكاة بصرية تفاعلية للخريطة */}
                      <div className="relative h-96 w-full rounded-lg overflow-hidden border border-white/10 bg-[#0A0B10] shadow-inner flex items-center justify-center">
                        
                        {/* شبكة خطوط ونقاط تشبه الخريطة */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px]"></div>
                        
                        {/* تمثيل تخطيطي للمبنى الجامعي والمدينة */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute border border-dashed border-cyan-500/20 rounded-full w-96 h-96 animate-pulse"></div>
                          <div className="absolute border border-dashed border-cyan-500/10 rounded-full w-[500px] h-[500px]"></div>

                          {/* نقاط الأجهزة على الخريطة */}
                          {devices.map(dev => (
                            <div 
                              key={dev.id}
                              style={{ 
                                top: `${50 + (dev.lat - 31.952) * 5000}%`, 
                                right: `${50 + (dev.lng - 35.913) * 5000}%` 
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                                dev.status === 'Online' 
                                ? 'bg-emerald-500 animate-bounce' 
                                : dev.status === 'Warning' 
                                  ? 'bg-amber-500' 
                                  : 'bg-rose-500'
                              }`}>
                                <span className="absolute w-6 h-6 bg-inherit rounded-full opacity-30 animate-ping -z-10"></span>
                              </div>

                              {/* نافذة تفاعلية تظهر عند حرك الفأرة */}
                              <div className="absolute top-6 bg-[#0E0F14]/95 border border-white/10 p-3 rounded-lg text-[10px] w-48 text-right shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 pointer-events-none">
                                <h5 className="font-extrabold text-cyan-400 mb-1">{dev.name}</h5>
                                <p className="text-gray-300 font-mono">IP: {dev.ip}</p>
                                <p className="text-gray-400 mt-1">الموقع: {dev.location}</p>
                                <p className="text-[9px] mt-1 font-bold">الحالة: {dev.status === 'Online' ? 'متصل' : 'غير متصل'}</p>
                              </div>
                            </div>
                          ))}

                          <div className="absolute bottom-4 right-4 bg-[#0A0B10]/90 p-3 rounded-lg border border-white/5 text-[10px] flex flex-col gap-1 z-20">
                            <span className="font-bold text-gray-300 block mb-1">دليل الخريطة (Map Legend):</span>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                              <span>جهاز متصل طبيعي (Online)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                              <span>تحذير/ضغط معالج (Warning)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                              <span>متوقف عن العمل (Offline)</span>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* =================================== */}
                {/* 6. صفحة التقارير والطباعة (REPORTS) */}
                {/* =================================== */}
                {activePlatformPage === 'reports' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                      <h3 className="font-bold text-base mb-2 text-white">توليد وطباعة التقارير المتقدمة</h3>
                      <p className="text-xs text-gray-400 mb-6">
                        تتيح هذه الصفحة لمسؤول النظام فلترة حركة الاستهلاك والتنبيهات، والقيام بعملية محاكاة كاملة لتصدير التقارير بصيغة PDF أو Excel للطباعة الأكاديمية.
                      </p>

                      <div className="filters-bar border border-white/10 bg-[#0A0B10] p-4 rounded-lg flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-gray-300">تصفية التقرير:</span>
                        </div>
                        
                        <select className="p-2.5 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none">
                          <option className="bg-[#111218]">كل سجلات الترافيك اليوم</option>
                          <option className="bg-[#111218]">تنبيهات الأجهزة الحرجة</option>
                          <option className="bg-[#111218]">كفاءة وجودة أداء الشبكة</option>
                        </select>

                        <button 
                          onClick={() => alert('تم توليد التقرير بنجاح وتجهيزه للتصدير!')}
                          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded transition-all"
                        >
                          توليد التقرير (Generate)
                        </button>

                        <button 
                          onClick={() => window.print()}
                          className="px-4 py-2.5 bg-[#0A0B10] hover:bg-white/5 text-gray-300 border border-white/10 font-bold text-xs rounded transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>طباعة وحفظ كـ PDF</span>
                        </button>
                      </div>

                      {/* سجل التقرير */}
                      <div className="mt-6 border border-white/5 rounded-lg p-6 bg-[#0A0B10]/40">
                        <div className="text-center pb-6 border-b border-white/5 mb-6">
                          <h4 className="text-lg font-bold text-white mb-2">تقرير أداء وحالة شبكة الإنترنت الذكية</h4>
                          <span className="text-xs text-gray-400">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-xs text-gray-300">
                          <div><strong>مُعد التقرير:</strong> مهندس الشبكة الرئيسي</div>
                          <div className="text-left"><strong>الحالة الكلية للشبكة:</strong> جيد جداً (85%)</div>
                        </div>

                        <table className="w-full text-right text-xs mb-6">
                          <thead>
                            <tr className="bg-[#0A0B10] text-gray-400 border-b border-white/5">
                              <th className="p-3">اسم الجهاز</th>
                              <th className="p-3">أقصى استهلاك Mbps</th>
                              <th className="p-3">متوسط الاستهلاك Mbps</th>
                              <th className="p-3">حالة الاتصال الكلية</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-white/5">
                              <td className="p-3 text-gray-200">الراوتر الرئيسي</td>
                              <td className="p-3 font-mono text-cyan-400">920 Mbps</td>
                              <td className="p-3 font-mono text-cyan-400">540 Mbps</td>
                              <td className="p-3 text-emerald-400 font-bold">مستقر بنسبة 100%</td>
                            </tr>
                            <tr className="border-b border-white/5">
                              <td className="p-3 text-gray-200">موزع الطابق الثاني</td>
                              <td className="p-3 font-mono text-cyan-400">140 Mbps</td>
                              <td className="p-3 font-mono text-cyan-400">42 Mbps</td>
                              <td className="p-3 text-amber-400 font-bold">استجابة بطيئة (مجهد)</td>
                            </tr>
                            <tr className="border-b border-white/5">
                              <td className="p-3 text-gray-200">خادم NAS Storage</td>
                              <td className="p-3 font-mono text-cyan-400">0 Mbps</td>
                              <td className="p-3 font-mono text-cyan-400">0 Mbps</td>
                              <td className="p-3 text-rose-400 font-bold">متوقف (منذ ساعة)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div>
                )}

                {/* =================================== */}
                {/* 8. صفحة التوثيق الأكاديمي (THESIS) */}
                {/* =================================== */}
                {activePlatformPage === 'thesis' && (
                  <ThesisHub />
                )}

                {/* =================================== */}
                {/* 7. صفحة الإعدادات (SETTINGS) */}
                {/* =================================== */}
                {activePlatformPage === 'settings' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20">
                      <h3 className="font-bold text-base mb-6 text-white border-b border-white/5 pb-3">إعدادات المنصة وقيم العتبات التنبيهية (Thresholds)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">رابط خادم LibreNMS API</label>
                          <input 
                            type="text" 
                            defaultValue="http://192.168.1.100/api/v0"
                            className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 text-left outline-none focus:border-cyan-500/50 transition-all"
                            dir="ltr"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">مفتاح الحماية (API Token)</label>
                          <input 
                            type="password" 
                            defaultValue="9a8b7c6d5e4f3g2h1i0j"
                            className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 text-left outline-none focus:border-cyan-500/50 transition-all"
                            dir="ltr"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">الحد الأقصى لاستهلاك البيانات التنبيهي (GB)</label>
                          <input 
                            type="number" 
                            defaultValue="800"
                            className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">زمن التأخير الأقصى المسموح (ms)</label>
                          <input 
                            type="number" 
                            defaultValue="150"
                            className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">اسم المسؤول / المهندس الحالي</label>
                          <input 
                            type="text" 
                            value={engineerName}
                            onChange={(e) => setEngineerName(e.target.value)}
                            className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-400">مسمى الوظيفة / الدور</label>
                          <input 
                            type="text" 
                            value={engineerRole}
                            onChange={(e) => setEngineerRole(e.target.value)}
                            className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
                          />
                        </div>

                      </div>

                      <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                        <button 
                          onClick={() => alert('تم حفظ الإعدادات وقيم العتبات في جدول settings بنجاح!')}
                          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded transition-all shadow-lg shadow-cyan-500/10"
                        >
                          حفظ الإعدادات بالكامل
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* التبويب الثاني: مستعرض كود الملفات المكتوبة للمشروع */}
        {/* ========================================================= */}
        {activeWorkspaceTab === 'code' && (
          <div className="flex-1 flex flex-col md:flex-row bg-slate-950">
            {/* القائمة الجانبية لشجرة الملفات */}
            <aside className="w-full md:w-80 shrink-0 border-l border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">الملفات التي قمنا ببرمجتها للمشروع:</h3>
                <p className="text-[11px] text-slate-500">
                  انقر على أي ملف لعرض الكود المصدري كاملاً والتعليقات الأكاديمية والشرح المرفق للجنة المناقشة.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
                {sourceFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-right p-3 rounded-xl text-xs flex flex-col gap-1.5 transition-all ${
                      selectedFile.path === file.path 
                      ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold' 
                      : 'border border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold block">{file.name}</span>
                    <span className="text-[10px] text-slate-500 truncate block w-full">{file.path}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* محتوى عرض الكود */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <Database className="w-4 h-4" />
                  <span className="text-[11px] font-bold font-mono uppercase">{selectedFile.lang} Code</span>
                </div>
                <h4 className="font-bold text-sm text-slate-200">{selectedFile.path}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  <strong>التوصيف الأكاديمي:</strong> {selectedFile.description}
                </p>
              </div>

              {/* شاشة عرض الأكواد */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed text-left" dir="ltr">
                <pre className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* التبويب الثالث: مخططات UML التوثيقية والـ Diagrams */}
        {/* ========================================================= */}
        {activeWorkspaceTab === 'uml' && (
          <div className="flex-1 p-6 bg-slate-950 overflow-y-auto max-w-7xl w-full mx-auto flex flex-col gap-8 animate-fade-in">
            
            {/* أ. مخطط Use Case Diagram */}
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">مخطط حالات الاستخدام (Use Case Diagram)</h4>
                  <p className="text-[10px] text-slate-400">يوضح تفاعل الفئات الأربع المكونة للنظام مع الوظائف والـ API</p>
                </div>
              </div>

              {/* رسم تخطيطي لـ Use Case باستخدام HTML/CSS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs">
                
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/40 flex flex-col gap-2 items-center justify-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <span className="font-bold text-slate-200">مدير النظام (Administrator)</span>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">إدارة المستخدمين</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">تعديل الإعدادات</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">التحكم بالأجهزة</span>
                  </div>
                </div>

                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/40 flex flex-col gap-2 items-center justify-center">
                  <Users className="w-8 h-8 text-emerald-500" />
                  <span className="font-bold text-slate-200">مسؤول الشبكة (Network Admin)</span>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">إضافة/تعديل أجهزة</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">تحليل المرور</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">معاينة LibreNMS</span>
                  </div>
                </div>

                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/40 flex flex-col gap-2 items-center justify-center">
                  <Users className="w-8 h-8 text-amber-500" />
                  <span className="font-bold text-slate-200">المُشغل الميداني (Operator)</span>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">مراقبة الأجهزة</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">إغلاق وحل التنبيهات</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">طباعة تقارير</span>
                  </div>
                </div>

                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/40 flex flex-col gap-2 items-center justify-center">
                  <Users className="w-8 h-8 text-slate-400" />
                  <span className="font-bold text-slate-200">المراقب العام (Viewer)</span>
                  <div className="flex flex-wrap gap-1 mt-2 justify-center text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">مشاهدة لوحة التحكم</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded">عرض الخرائط والتقارير</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ب. مخطط ER Diagram وهندسة الجداول */}
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">مخطط العلاقات وقاعدة البيانات (ER Diagram)</h4>
                  <p className="text-[10px] text-slate-400">يوضح مفاتيح الجداول والعلاقات التشاركية (1-to-Many) بين الأجهزة والعمليات</p>
                </div>
              </div>

              {/* رسم تخطيطي للهيكل العلاقاني */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-left" dir="ltr">
                
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/20">
                  <h5 className="font-bold text-blue-400 border-b border-slate-800 pb-1 mb-2">Table: devices</h5>
                  <ul className="flex flex-col gap-1 text-slate-400">
                    <li><strong className="text-white">id (PK)</strong> - INT AUTO_INCREMENT</li>
                    <li>name - VARCHAR(100)</li>
                    <li>ip_address - VARCHAR(45) UNIQUE</li>
                    <li>type - VARCHAR(50)</li>
                    <li>location - VARCHAR(100)</li>
                    <li>latitude / longitude - DECIMAL</li>
                    <li>status - ENUM</li>
                    <li>librenms_device_id - INT</li>
                  </ul>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/20 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-emerald-400 border-b border-slate-800 pb-1 mb-2">Relationships</h5>
                    <div className="flex flex-col gap-2 text-[10px] text-slate-300 py-2 text-right" dir="rtl">
                      <div>● <strong>الواحد إلى المتعدد (1-to-Many):</strong> الجهاز الواحد في <code>devices</code> يمتلك عدة سجلات في <code>traffic_logs</code>.</div>
                      <div>● <strong>الواحد إلى المتعدد (1-to-Many):</strong> الجهاز يمتلك عدة تنبيهات مرتبطة به في <code>alerts</code>.</div>
                      <div>● <strong>المسؤول والتقارير:</strong> مستخدم واحد في <code>users</code> يقوم بتوليد وحفظ عدة تقارير في <code>reports</code>.</div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/20">
                  <h5 className="font-bold text-rose-400 border-b border-slate-800 pb-1 mb-2">Table: traffic_logs</h5>
                  <ul className="flex flex-col gap-1 text-slate-400">
                    <li><strong className="text-white">id (PK)</strong> - BIGINT AUTO_INCREMENT</li>
                    <li><strong className="text-emerald-500">device_id (FK)</strong> - INT</li>
                    <li>download_speed - DOUBLE</li>
                    <li>upload_speed - DOUBLE</li>
                    <li>bandwidth_usage - DOUBLE</li>
                    <li>logged_at - TIMESTAMP</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
