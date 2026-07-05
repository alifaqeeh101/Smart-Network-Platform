// src/components/ThesisHub.tsx
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  Settings, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  FileText,
  FileCode2
} from 'lucide-react';
import { thesisChapters, initialThesisConfig, ThesisChapter, ThesisSubSection } from '../thesisData';

export function ThesisHub() {
  const [config, setConfig] = useState(initialThesisConfig);
  const [activeChapterId, setActiveChapterId] = useState<string>("cover");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // تحديث القيم المدخلة
  const handleConfigChange = (key: keyof typeof initialThesisConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // نسخ محتوى الشابتر للحافظة
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // فحص تواجد النصوص وعمليات البحث والفلترة
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return thesisChapters;
    return thesisChapters.map(chapter => {
      const matchedSubsections = chapter.subsections.filter(sub => 
        sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        chapter.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matchedSubsections.length > 0
      ) {
        return {
          ...chapter,
          subsections: matchedSubsections.length > 0 ? matchedSubsections : chapter.subsections
        };
      }
      return null;
    }).filter(Boolean) as ThesisChapter[];
  }, [searchQuery]);

  // الحصول على الشابتر الحالي المفعل
  const activeChapter = useMemo(() => {
    return thesisChapters.find(ch => ch.id === activeChapterId) || thesisChapters[0];
  }, [activeChapterId]);

  // تعويض المتغيرات الديناميكية في النصوص (اسم الطالب، الجامعة، إلخ)
  const renderDynamicText = (text: string) => {
    return text
      .replace(/جامعة إقليم سبأ/g, config.university)
      .replace(/كلية تكنولوجيا المعلومات وعلوم الحاسوب/g, config.college)
      .replace(/قسم نظم المعلومات الحاسوبية/g, config.department)
      .replace(/علي الفقيه/g, config.studentName)
      .replace(/أ\.د\. عبدالملك ردمان/g, config.supervisorName)
      .replace(/2026\/2027م/g, config.academicYear)
      .replace(/2026\/2027 G/g, config.projectNameEn)
      .replace(/منصة الشبكة الذكية لمراقبة وتحليل الشبكات المحاكية لـ LibreNMS/g, config.projectNameAr);
  };

  // توليد التنسيق النهائي لنسخ التقرير كاملاً
  const handleCopyFullReport = () => {
    let fullText = `====== ${config.projectNameAr} ======\n`;
    fullText += `جامعة: ${config.university} | كلية: ${config.college}\n`;
    fullText += `إعداد الطالب: ${config.studentName} | إشراف: ${config.supervisorName}\n\n`;

    thesisChapters.forEach(ch => {
      fullText += `\n\n=========================================\n`;
      fullText += `${ch.num !== "0" ? `الفصل ${ch.num}: ` : ""}${ch.title} (${ch.englishTitle})\n`;
      fullText += `=========================================\n`;
      ch.subsections.forEach(sub => {
        fullText += `\n--- ${sub.title} ---\n`;
        fullText += renderDynamicText(sub.content) + `\n`;
        if (sub.table) {
          fullText += `[جدول مدمج: ${sub.title}]\n`;
          fullText += sub.table.headers.join(" | ") + "\n";
          sub.table.rows.forEach(row => {
            fullText += row.join(" | ") + "\n";
          });
        }
      });
    });

    copyToClipboard(fullText, "full_report");
  };

  return (
    <div id="academic-thesis-hub" className="flex flex-col gap-6 animate-fade-in text-right">
      
      {/* 1. ترويسة الصفحة ومركز المعلومات الأكاديمية */}
      <div className="p-6 rounded-xl border border-white/5 bg-[#111218] shadow-lg shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                مستند أكاديمي جاهز للطباعة 🎓
              </span>
              <span className="text-[10px] text-gray-500 font-mono">APA 7th Edition</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">مركز التوثيق والأطروحة الأكاديمية لمشروع التخرج</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
              تم إنشاء هذا المركز الأكاديمي الحصري لتلخيص وكتابة وتوليد **تقرير توثيق تخرج كامل (من 50 إلى 80 صفحة عند تصديره لـ Word)** لمشروعك **"{config.projectNameAr}"** لتقديمه لقسمك العلمي في **{config.university}** بكود نظيف وتصميم أكاديمي معتمد ومحاذاة ممتازة.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center gap-2 border ${
              showConfigPanel 
              ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
              : 'bg-[#0A0B10] hover:bg-white/5 text-gray-300 border-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>تخصيص البيانات الأكاديمية</span>
          </button>

          <button
            onClick={handleCopyFullReport}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-xs rounded transition-all shadow-lg shadow-cyan-500/10 flex items-center gap-2"
          >
            {copiedId === "full_report" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>نسخ التقرير كاملاً لـ Word</span>
          </button>
        </div>
      </div>

      {/* 2. لوحة تخصيص البيانات الأكاديمية (ديناميكية) */}
      {showConfigPanel && (
        <div className="p-6 rounded-xl border border-cyan-500/20 bg-[#111218] shadow-xl animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-3 border-b border-white/5 pb-2 mb-1 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">تعديل المتغيرات لتحديث التوثيق والغلاف تلقائياً</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">الجامعة</label>
            <input 
              type="text" 
              value={config.university}
              onChange={(e) => handleConfigChange('university', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">الكلية</label>
            <input 
              type="text" 
              value={config.college}
              onChange={(e) => handleConfigChange('college', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">القسم العلمي</label>
            <input 
              type="text" 
              value={config.department}
              onChange={(e) => handleConfigChange('department', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">اسم الطالب الباحث</label>
            <input 
              type="text" 
              value={config.studentName}
              onChange={(e) => handleConfigChange('studentName', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">مشرف المشروع</label>
            <input 
              type="text" 
              value={config.supervisorName}
              onChange={(e) => handleConfigChange('supervisorName', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">العام الجامعي</label>
            <input 
              type="text" 
              value={config.academicYear}
              onChange={(e) => handleConfigChange('academicYear', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400">اسم المشروع (عربي)</label>
            <input 
              type="text" 
              value={config.projectNameAr}
              onChange={(e) => handleConfigChange('projectNameAr', e.target.value)}
              className="p-3 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
            />
          </div>
        </div>
      )}

      {/* 3. شريط البحث والتصفح السريع وفلاتر الطباعة المدرسية */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-white/5 bg-[#111218]">
        <div className="relative w-full sm:max-w-md">
          <input 
            type="text"
            placeholder="البحث في فصول وعناوين ومحتويات التوثيق الأكاديمي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 pr-10 rounded border bg-[#0A0B10] border-white/10 text-xs text-gray-300 outline-none focus:border-cyan-500/50 transition-all text-right"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPrintMode(!isPrintMode)}
            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 border ${
              isPrintMode 
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/10' 
              : 'bg-[#0A0B10] hover:bg-white/5 text-gray-300 border-white/10'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>معاينة الطباعة البيضاء (A4 Print Mode)</span>
          </button>
        </div>
      </div>

      {/* 4. تصميم الشابترات - لوحة تقسيمية ثنائية (يسار: المحتوى الأكاديمي، يمين: الفهرس التنقلي) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* أ. الفهرس التنقلي الأيمن */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
          <div className="p-4 rounded-xl border border-white/5 bg-[#111218] flex-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-white/5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>فهرس الأطروحة الجامعية</span>
            </h4>
            <div className="flex flex-col gap-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredChapters.map(chapter => {
                const isSelected = activeChapterId === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setActiveChapterId(chapter.id);
                      // التمرير لأعلى القارئ
                      document.getElementById("thesis-reader")?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-right p-3 rounded transition-all text-xs flex flex-col gap-1.5 border ${
                      isSelected 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                      : 'bg-[#0A0B10]/40 hover:bg-white/5 border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold">
                        {chapter.num !== "0" ? `الفصل ${chapter.num}` : "الغلاف والملخص"}
                      </span>
                      <span className="text-[10px] opacity-70 font-mono">
                        {chapter.num !== "0" ? `Chapter ${chapter.num}` : "Cover"}
                      </span>
                    </div>
                    <span className="font-medium text-gray-300 line-clamp-1">{chapter.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* نصائح التنسيق الأكاديمي */}
          <div className="p-4 rounded-xl border border-white/5 bg-[#111218] text-xs text-gray-400">
            <h5 className="font-bold text-white mb-2 flex items-center gap-1.5 text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>تعليمات التنسيق في Word</span>
            </h5>
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-[11px] pr-2">
              <li>اختر حجم الورق **A4** وهوامش **2.5 سم** من كل اتجاه.</li>
              <li>استخدم خط **Traditional Arabic** بمقاس **14** للنص و**16 Bold** للعناوين.</li>
              <li>اجعل التباعد بين الأسطر بمقدار **1.5**.</li>
              <li>استشهد بالمراجع تلقائياً باتباع نظام توثيق **APA 7th**.</li>
            </ul>
          </div>
        </aside>

        {/* ب. القارئ الأكاديمي الأيسر (الرئيسي) */}
        <main 
          id="thesis-reader" 
          className={`flex-1 rounded-xl transition-all duration-300 border shadow-2xl relative ${
            isPrintMode 
            ? 'bg-white text-slate-900 border-gray-300 p-8 md:p-12 font-serif' 
            : 'bg-[#111218] text-gray-200 border-white/5 p-6 md:p-8 font-sans'
          }`}
        >
          {/* شريط الإجراءات الصغير أعلى القارئ */}
          <div className={`flex items-center justify-between pb-4 mb-6 border-b shrink-0 ${
            isPrintMode ? 'border-gray-200 text-slate-500' : 'border-white/5 text-gray-400'
          }`}>
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isPrintMode ? 'text-cyan-600' : 'text-cyan-400'}`} />
              <span className={`text-xs font-bold ${isPrintMode ? 'text-slate-800' : 'text-white'}`}>
                {activeChapter.num !== "0" ? `الفصل ${activeChapter.num} : ` : ""} {activeChapter.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  let text = `${activeChapter.title}\n${activeChapter.englishTitle}\n\n`;
                  activeChapter.subsections.forEach(sub => {
                    text += `\n--- ${sub.title} ---\n${renderDynamicText(sub.content)}\n`;
                  });
                  copyToClipboard(text, activeChapter.id);
                }}
                className={`p-1.5 rounded transition-all text-xs flex items-center gap-1 border ${
                  isPrintMode 
                  ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' 
                  : 'bg-[#0A0B10] border-white/10 text-gray-300 hover:bg-white/5'
                }`}
                title="نسخ محتويات الفصل الحالي"
              >
                {copiedId === activeChapter.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline font-bold">نسخ هذا الفصل</span>
              </button>
            </div>
          </div>

          {/* محتوى الشابتر */}
          <div className="space-y-8">
            <div className="text-center py-4 border-b border-dashed border-gray-300/40">
              <h3 className={`text-xl md:text-2xl font-bold tracking-tight mb-2 ${isPrintMode ? 'text-black' : 'text-white'}`}>
                {activeChapter.num !== "0" ? `الفصل ${activeChapter.num}: ` : ""} {activeChapter.title}
              </h3>
              <p className={`text-xs md:text-sm italic font-mono ${isPrintMode ? 'text-gray-500' : 'text-cyan-400/80'}`}>
                {activeChapter.englishTitle}
              </p>
            </div>

            {/* الأقسام الفرعية */}
            {activeChapter.subsections.map((sub, idx) => (
              <div key={sub.id} className="space-y-3.5">
                <h4 className={`text-base font-bold pb-1 border-r-4 pr-3 ${
                  isPrintMode 
                  ? 'text-black border-cyan-600 font-sans' 
                  : 'text-cyan-400 border-cyan-500 font-sans'
                }`}>
                  {sub.title}
                </h4>

                {/* نص القسم */}
                <p className={`text-xs md:text-sm leading-relaxed whitespace-pre-line text-justify ${
                  isPrintMode ? 'text-gray-800' : 'text-gray-300'
                }`}>
                  {renderDynamicText(sub.content)}
                </p>

                {/* جداول البيانات إن وجدت */}
                {sub.table && (
                  <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200/50 shadow-sm">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className={`${isPrintMode ? 'bg-gray-100 text-black border-b border-gray-300' : 'bg-[#0A0B10] text-gray-300 border-b border-white/5'}`}>
                          {sub.table.headers.map((h, i) => (
                            <th key={i} className="p-3 font-bold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sub.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={`${
                            isPrintMode 
                            ? 'border-b border-gray-200 text-gray-800 hover:bg-gray-50' 
                            : 'border-b border-white/5 text-gray-300 hover:bg-white/5'
                          }`}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* تذييل الصفحة الأكاديمية مع التنقل السريع */}
          <div className={`mt-12 pt-6 border-t flex items-center justify-between text-xs ${
            isPrintMode ? 'border-gray-200 text-gray-500' : 'border-white/5 text-gray-400'
          }`}>
            <span>جامعة إقليم سبأ - كلية تكنولوجيا المعلومات</span>
            <span>الباحث: {config.studentName}</span>
          </div>
        </main>

      </div>
      
    </div>
  );
}
