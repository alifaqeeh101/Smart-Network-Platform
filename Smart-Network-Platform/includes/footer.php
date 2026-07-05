        </div> <!-- إغلاق .content-wrapper -->

        <!-- 3. تذييل الصفحة المشترك (Footer) -->
        <footer class="footer">
            <p>جميع الحقوق محفوظة &copy; <?php echo date('Y'); ?> | مشروع التخرج: منصة إدارة ومراقبة وتحليل شبكات الإنترنت الذكية</p>
        </footer>
    </main> <!-- إغلاق .main-content -->
</div> <!-- إغلاق .app-container -->

<!-- سكربتات الجافاسكربت الأساسية (Vanilla JS) -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // 1. تبديل الوضع المظلم والمضيء (Dark/Light Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            body.classList.toggle('dark-theme');
            
            // حفظ الخيار في Cookie ليدعمه السيرفر فورياً في PHP، وفي localStorage للبرمجيات العميل
            const isDark = body.classList.contains('dark-theme');
            document.cookie = "theme=" + (isDark ? "dark" : "light") + ";path=/;max-age=" + (30*24*60*60);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // 2. تحديث التنبيهات من خلال المحاكاة أو LibreNMS تلقائياً بشكل دوري (مثال حركي)
    function checkLiveAlerts() {
        console.log("Checking Live Alerts from Network Monitor System...");
    }
    setInterval(checkLiveAlerts, 30000); // كل 30 ثانية
});
</script>
</body>
</html>
