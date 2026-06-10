import os
import re

files = [
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/dashboard/DashboardPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/accounts/AccountsPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/transactions/TransactionsPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/budgets/BudgetsPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/notifications/NotificationsPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/auth/ProfileSettingsPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/auth/LoginPage.tsx',
  'd:/ITI/Labs/Hakathon/PFT/frontend/src/features/dashboard/LandingPage.tsx'
]

AR_TRANSLATIONS = {
  'DashboardPage.tsx': '''{
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  pageTitle: 'لوحة القيادة',
  logout: 'تسجيل خروج',
  customPeriod: 'مخصص',
  incomeVsExpensesTitle: 'الدخل مقابل النفقات',
  spendingByCategoryTitle: 'الإنفاق حسب الفئة',
  recentTransactionsTitle: 'المعاملات الأخيرة',
  activeBudgetsTitle: 'الميزانيات النشطة',
  upcomingTitle: 'القادمة (7 أيام)',
  viewAll: 'عرض الكل',
  manageSubscriptions: 'إدارة الاشتراكات',
  languageAriaLabel: 'تغيير اللغة',
  notificationsAriaLabel: 'الإشعارات',
  chartMenuAriaLabel: 'فتح قائمة الرسم البياني للدخل والنفقات',
  categoryMenuAriaLabel: 'فتح قائمة الرسم البياني للفئات',
  addBudgetAriaLabel: 'إضافة ميزانية',
  fullCategoryShare: '100%',
  noPeriods: 'لا تتوفر فلاتر للفترة.',
  noStats: 'لا يتوفر ملخص للوحة القيادة.',
  noChartData: 'لا يتوفر سجل للدخل أو النفقات.',
  noCategoryData: 'لا يتوفر إنفاق للفئات.',
  noTransactions: 'لا تتوفر معاملات أخيرة.',
  noBudgets: 'لا تتوفر ميزانيات نشطة.',
  noRecurring: 'لا تتوفر معاملات متكررة قادمة.',
}''',
  'AccountsPage.tsx': '''{
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  desktopTitle: 'حساباتي',
  mobileTitle: 'الحسابات',
  addAccount: 'إضافة حساب',
  logout: 'تسجيل خروج',
  archived: 'مؤرشف',
  archiveAccount: 'أرشفة الحساب',
  languageAriaLabel: 'تغيير اللغة',
  notificationsAriaLabel: 'الإشعارات',
  menuAriaLabel: 'فتح القائمة',
  accountMenuAriaLabel: 'فتح إجراءات الحساب',
  emptyNav: 'لا تتوفر عناصر تنقل.',
  emptySummary: 'لا يتوفر ملخص للحساب.',
  emptyAccounts: 'لا تتوفر حسابات.',
}''',
  'TransactionsPage.tsx': '''{
  appName: 'متتبع الشؤون المالية الشخصية',
  sidebarTitle: 'مسؤول PFT',
  sidebarSubtitle: 'مدير المحفظة',
  pageTitle: 'المعاملات',
  addTransaction: 'إضافة معاملة',
  listView: 'قائمة',
  calendarView: 'تقويم',
  filtersTitle: 'الفلاتر',
  dateRangeLabel: 'نطاق التاريخ',
  dateRangePlaceholder: 'آخر 30 يومًا',
  accountLabel: 'الحساب',
  allAccounts: 'جميع الحسابات',
  categoryLabel: 'الفئة',
  allCategories: 'جميع الفئات',
  typeLabel: 'النوع',
  allType: 'الكل',
  incomeType: 'دخل',
  expenseType: 'مصروف',
  activeFiltersLabel: 'الفلاتر النشطة:',
  clearAll: 'مسح الكل',
  emptyTransactions: 'لا توجد معاملات تطابق الفلاتر الحالية.',
  emptyNav: 'لا تتوفر عناصر تنقل.',
  selectedLabel: 'محدد',
  deleteSelected: 'حذف المحدد',
  editCategory: 'تعديل الفئة',
  recurringTitle: 'معاملة متكررة',
  notificationsAriaLabel: 'الإشعارات',
  rowActionsAriaLabel: 'فتح إجراءات المعاملة',
  selectAllAriaLabel: 'تحديد جميع المعاملات',
  selectRowAriaLabel: 'تحديد معاملة',
  previousPageAriaLabel: 'الصفحة السابقة',
  nextPageAriaLabel: 'الصفحة التالية',
  logout: 'تسجيل خروج',
  tableHeaders: {
    date: 'التاريخ',
    account: 'الحساب',
    category: 'الفئة',
    description: 'الوصف',
    amount: 'المبلغ',
    balance: 'الرصيد',
    actions: 'الإجراءات',
  },
}''',
  'BudgetsPage.tsx': '''{
  appName: 'متتبع الشؤون المالية الشخصية',
  sidebarTitle: 'مسؤول PFT',
  sidebarSubtitle: 'مدير المحفظة',
  pageTitle: 'الميزانيات',
  pageSubtitle: 'إدارة حدود الإنفاق الشهرية الخاصة بك.',
  addBudget: 'إضافة ميزانية',
  addTransaction: 'إضافة معاملة',
  logout: 'تسجيل خروج',
  spentPrefix: 'المنفق:',
  noBudgetsTitle: 'لا توجد ميزانيات هذا الشهر',
  noBudgetsDescription: 'لم تقم بإعداد أي حدود للميزانية هذا الشهر. ابدأ بتتبع إنفاقك عن طريق إضافة فئة ميزانية جديدة.',
  createFirstBudget: 'إنشاء أول ميزانية',
  editAction: 'تعديل',
  rollOverAction: 'ترحيل',
  deleteAction: 'حذف',
  notificationsAriaLabel: 'الإشعارات',
  previousMonthAriaLabel: 'الشهر السابق',
  nextMonthAriaLabel: 'الشهر التالي',
}''',
  'NotificationsPage.tsx': '''{
  brand: 'PFT',
  pageTitle: 'الإشعارات',
  pageSubtitle: 'ابق على اطلاع دائم بأنشطتك المالية.',
  login: 'تسجيل الدخول',
  markAllAsRead: 'تحديد الكل كمقروء',
  emptyTitle: 'لا توجد إشعارات بعد',
  emptyDescription: 'ستظهر التحديثات الهامة للحساب والميزانية هنا.',
  archiveFallback: 'يتم أرشفة الإشعارات التي يزيد عمرها عن 90 يومًا.',
  openNotificationAriaLabel: 'فتح الإشعار',
}''',
  'ProfileSettingsPage.tsx': '''{
  appName: 'PFT',
  login: 'تسجيل الدخول',
  pageTitle: 'الملف الشخصي والإعدادات',
  pageSubtitle: 'إدارة معلوماتك الشخصية والتفضيلات وأمان الحساب.',
  personalInformationTitle: 'المعلومات الشخصية',
  changePhoto: 'تغيير الصورة',
  changePhotoAriaLabel: 'تغيير صورة الملف الشخصي',
  fullNameLabel: 'الاسم الكامل',
  emailLabel: 'عنوان البريد الإلكتروني',
  phoneLabel: 'رقم الهاتف',
  interfaceLanguageLabel: 'لغة الواجهة المفضلة',
  englishLanguage: 'الإنجليزية (English)',
  arabicLanguage: 'العربية (Arabic)',
  baseCurrencyLabel: 'العملة الأساسية',
  saveProfile: 'حفظ الملف الشخصي',
  savingProfile: 'جارٍ الحفظ...',
  notificationPreferencesTitle: 'تفضيلات الإشعارات',
  notificationPreferencesDescription: 'تحكم في كيفية ووقت تواصل PFT معك بخصوص التتبع المالي الخاص بك.',
  dangerZoneTitle: 'منطقة الخطر',
  dangerZoneDescription: 'إجراءات لا رجعة فيها بخصوص حساب PFT الخاص بك وبياناتك المالية.',
  deleteAccountTitle: 'حذف الحساب',
  deleteAccountDescription: 'إزالة حسابك وجميع البيانات المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء، وسيتم فقدان جميع سجلات المعاملات والميزانيات والتقارير.',
  deleteAccount: 'حذف الحساب',
  copyright: '© 2024 PFT متتبع الشؤون المالية الشخصية. جميع الحقوق محفوظة.',
  emptyNotifications: 'لا تتوفر تفضيلات الإشعارات.',
  emptyNavigation: 'لا تتوفر عناصر تنقل.',
}''',
  'LoginPage.tsx': '''{
  appName: 'PFT',
  appSubtitle: 'متتبع الشؤون المالية الشخصية',
  headline: 'إدارة ثروتك بأمان.',
  description: 'الوصول إلى محفظتك، وتتبع المعاملات، وإنشاء تقارير على مستوى مؤسسي من خلال منصتنا ثنائية اللغة.',
  welcomeTitle: 'مرحباً بعودتك',
  welcomeMobileTitle: 'مرحباً',
  welcomeSubtitle: 'يرجى إدخال التفاصيل الخاصة بك لتسجيل الدخول.',
  welcomeMobileSubtitle: 'قم بتسجيل الدخول للمتابعة.',
  emailLabel: 'عنوان البريد الإلكتروني',
  passwordLabel: 'كلمة المرور',
  emailPlaceholder: 'name@company.com',
  passwordPlaceholder: 'كلمة المرور',
  rememberMe: 'تذكرني',
  forgotPassword: 'هل نسيت كلمة المرور؟',
  login: 'تسجيل الدخول',
  loggingIn: 'جارٍ تسجيل الدخول...',
  registerPrompt: 'ليس لديك حساب؟',
  mobileRegisterPrompt: 'مستخدم جديد؟',
  register: 'سجل الآن',
  mobilePreviewLabel: 'معاينة الجوال (375 بكسل)',
  statusTime: '9:41',
}''',
  'LandingPage.tsx': '''{
  appName: 'PFT',
  languageToggleLabel: 'EN / العربية',
  login: 'تسجيل الدخول',
  getStarted: 'البدء',
  heroTitle: 'سيطر على شؤونك المالية',
  heroDescription: 'جرب تتبعًا على مستوى مؤسسي باستخدام لوحة قيادة بديهية للنفقات والمدخرات والأهداف المالية.',
  registerNow: 'سجل الآن',
  demoTitle: 'لوحة القيادة التجريبية',
  demoDescription: 'هذه بيانات تجريبية. قم بالتسجيل لربط حساباتك ورؤية أموالك الحقيقية.',
  createFreeAccount: 'إنشاء حساب مجاني',
  cashFlowTitle: "نظرة عامة على التدفق النقدي",
  expenseBreakdownTitle: 'تفصيل النفقات',
  categoryTotalLabel: 'الإجمالي',
  mobileMenuLabel: 'فتح القائمة',
  emptyMetrics: 'لا تتوفر مقاييس للوحة القيادة.',
  emptyCashFlow: 'لا تتوفر معاينة للتدفق النقدي.',
  emptyCategories: 'لا تتوفر معاينة لفئة النفقات.',
  copyright: '© 2024 PFT متتبع الشؤون المالية الشخصية. جميع الحقوق محفوظة.',
}'''
}

for path in files:
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = os.path.basename(path)
    base_name = filename.replace('.tsx', '')
    ar_text = AR_TRANSLATIONS.get(filename)
    if not ar_text:
        continue

    # 1. Rename const TEXT to const EN_TEXT
    # This uses a regex to find const TEXT = { ... }
    # Also handles LandingPage which uses `const TEXT: LandingTextContent = {`
    pattern = r'const TEXT(: \w+)? = \{'
    replacement = r'const EN_TEXT\1 = {'
    new_content = re.sub(pattern, replacement, content, count=1)
    
    # Check if anything changed
    if new_content == content:
        # Already processed or not found
        if 'const EN_TEXT' not in content:
            print(f"Failed to find TEXT block in {filename}")
        continue
    content = new_content
    
    # 2. Extract the EN_TEXT block end so we can insert AR_TEXT right after it
    # We find where EN_TEXT ends by bracket matching
    match = re.search(r'const EN_TEXT(: \w+)? = \{', content)
    if match:
        start_idx = match.start()
        # Find closing brace
        brace_count = 0
        end_idx = -1
        in_string = False
        quote_char = ''
        
        for i in range(start_idx, len(content)):
            char = content[i]
            if in_string:
                if char == quote_char and content[i-1] != '\\':
                    in_string = False
            elif char in ["'", '"', '`']:
                in_string = True
                quote_char = char
            elif char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i + 1
                    break
        
        if end_idx != -1:
            type_str = match.group(1) or ''
            hook_name = f'use{base_name}Text'
            
            # The injection block
            injection = f"""
const AR_TEXT{type_str} = {ar_text};

export function {hook_name}() {{
  const language = useSelector(selectLanguage);
  return language === 'ar' ? AR_TEXT : EN_TEXT;
}}
"""
            content = content[:end_idx] + "\n" + injection + content[end_idx:]

    # 3. Add imports if needed
    if 'useSelector' not in content:
        content = "import { useSelector } from 'react-redux'\n" + content
    if 'selectLanguage' not in content:
        depth = len(path.split('/')) - 4
        store_path = '../' * depth + 'store'
        content = f"import {{ selectLanguage }} from '{store_path}'\n" + content

    # 4. Inject `const TEXT = use...Text();` in all functions
    # Using regex to find all function declarations/arrow functions and inject at the start of block
    # Note: `function Foo(...) {` or `const Foo = (...) => {`
    
    # First, let's find all instances where `TEXT.` is used, and which function block they belong to
    # Actually, simpler: just find EVERY function that contains `{` and `}` and replace `{` with `{\n  const TEXT = use...Text();` if it contains `TEXT.` inside its body.
    # But nested functions would cause issues.
    # Instead, let's rename `TEXT.` to `text.` or `getText().` NO!
    
    # Since we have the hook, we can replace all `TEXT.` with `{hook_name}().`
    # Wait, `hook_name` returns an object. `{hook_name}()` can't be called repeatedly inside the render loop? Actually it's fine, it just returns a reference, but calling hooks in loops is bad.
    # Wait, `TEXT.` is just object property access. So if we replace `TEXT.` with `pageText.` and then ensure EVERY component defines `const pageText = use...Text();`
    
    # Let's just do: replace `TEXT.` with `TEXT_VAR.`
    # And then we do a regex replace over all functions that return JSX to add `const TEXT_VAR = use...Text();`
    
    # Instead of AST, let's just do global replace:
    content = content.replace('TEXT.', 'TEXT_VAR.')
    
    # Now find all components. Usually they start with `export function Name` or `function Name`
    def inject_text_var(match):
        return match.group(0) + f"\n  const TEXT_VAR = {hook_name}();\n"

    content = re.sub(r'(export )?function \w+\(.*?\)(\s*:\s*\w+)?\s*\{', inject_text_var, content)
    
    # Special case for LandingPage: it already has `const pageText = { ...TEXT, ...text }`
    # Wait, LandingPage doesn't use `TEXT.` it uses `pageText.`!
    # So `content.replace('TEXT.', 'TEXT_VAR.')` won't match LandingPage's JSX, which is good!
    # But LandingPage has `const pageText = { ...TEXT, ...text }`. It was replaced by `const pageText = { ...TEXT_VAR, ...text }` if we renamed TEXT.
    # Wait, LandingPage uses `TEXT` without `.`.
    # Let's just fix LandingPage explicitly:
    content = content.replace('...TEXT,', f'...{hook_name}(),')
    content = content.replace('...TEXT}', f'...{hook_name}()}}')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Translation applied successfully!")
