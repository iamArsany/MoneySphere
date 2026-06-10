import { Project, SyntaxKind, VariableDeclarationKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();

// Add the files we want to process
const filePaths = [
  'src/features/dashboard/DashboardPage.tsx',
  'src/features/accounts/AccountsPage.tsx',
  'src/features/transactions/TransactionsPage.tsx',
  'src/features/budgets/BudgetsPage.tsx',
  'src/features/notifications/NotificationsPage.tsx',
  'src/features/auth/ProfileSettingsPage.tsx',
  'src/features/auth/LoginPage.tsx',
  'src/features/dashboard/LandingPage.tsx'
];

const AR_TRANSLATIONS: Record<string, Record<string, any>> = {
  'DashboardPage.tsx': {
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
    noRecurring: 'لا تتوفر معاملات متكررة قادمة.'
  },
  'AccountsPage.tsx': {
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
    emptyAccounts: 'لا تتوفر حسابات.'
  },
  'TransactionsPage.tsx': {
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
      actions: 'الإجراءات'
    }
  },
  'BudgetsPage.tsx': {
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
    nextMonthAriaLabel: 'الشهر التالي'
  },
  'NotificationsPage.tsx': {
    brand: 'PFT',
    pageTitle: 'الإشعارات',
    pageSubtitle: 'ابق على اطلاع دائم بأنشطتك المالية.',
    login: 'تسجيل الدخول',
    markAllAsRead: 'تحديد الكل كمقروء',
    emptyTitle: 'لا توجد إشعارات بعد',
    emptyDescription: 'ستظهر التحديثات الهامة للحساب والميزانية هنا.',
    archiveFallback: 'يتم أرشفة الإشعارات التي يزيد عمرها عن 90 يومًا.',
    openNotificationAriaLabel: 'فتح الإشعار'
  },
  'ProfileSettingsPage.tsx': {
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
    emptyNavigation: 'لا تتوفر عناصر تنقل.'
  },
  'LoginPage.tsx': {
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
    statusTime: '9:41'
  },
  'LandingPage.tsx': {
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
    copyright: '© 2024 PFT متتبع الشؤون المالية الشخصية. جميع الحقوق محفوظة.'
  }
};

for (const filePath of filePaths) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    continue;
  }
  
  const sourceFile = project.addSourceFileAtPath(filePath);
  console.log(`Processing ${filePath}...`);
  
  // Find the 'const TEXT = { ... }' declaration
  const textVar = sourceFile.getVariableDeclaration('TEXT');
  if (!textVar) {
    console.log(`  No TEXT variable found. Skipping.`);
    continue;
  }
  
  const textVarStatement = textVar.getVariableStatement();
  if (!textVarStatement) continue;

  const fileName = sourceFile.getBaseName();
  const arTextObj = AR_TRANSLATIONS[fileName] || {};
  
  // 1. Rename TEXT to EN_TEXT
  textVar.rename('EN_TEXT');
  
  // 2. Add AR_TEXT
  const arTextString = JSON.stringify(arTextObj, null, 2);
  const typeNode = textVar.getTypeNode();
  let typeStr = '';
  if (typeNode) {
    typeStr = ': ' + typeNode.getText();
  }

  textVarStatement.insertAfterText(`\nconst AR_TEXT${typeStr} = ${arTextString};\n`);
  
  // 3. Add usePageText hook
  // Check if useSelector and selectLanguage are imported
  let hasUseSelector = false;
  let hasSelectLanguage = false;
  
  for (const importDecl of sourceFile.getImportDeclarations()) {
    const namedImports = importDecl.getNamedImports().map(ni => ni.getName());
    if (namedImports.includes('useSelector')) hasUseSelector = true;
    if (namedImports.includes('selectLanguage')) hasSelectLanguage = true;
  }
  
  if (!hasUseSelector) {
    sourceFile.addImportDeclaration({
      namedImports: ['useSelector'],
      moduleSpecifier: 'react-redux'
    });
  }
  
  if (!hasSelectLanguage) {
    // Determine path to store based on depth
    const depth = filePath.split('/').length - 3; // src/features/X/Y.tsx -> depth 2
    let storePath = '';
    if (depth === 2) storePath = '../../store';
    else if (depth === 1) storePath = '../store';
    else storePath = '../../../store';
    
    sourceFile.addImportDeclaration({
      namedImports: ['selectLanguage'],
      moduleSpecifier: storePath
    });
  }

  // Insert the hook right after AR_TEXT
  const hookName = `use${fileName.replace('.tsx', '')}Text`;
  const exportModifier = 'export ';
  
  // Find the last statement we added (AR_TEXT) by looking for it
  const arTextDecl = sourceFile.getVariableStatement('AR_TEXT');
  if (arTextDecl) {
    arTextDecl.insertAfterText(`\n${exportModifier}function ${hookName}() {\n  const language = useSelector(selectLanguage);\n  return language === 'ar' ? AR_TEXT : EN_TEXT;\n}\n`);
  }

  // 4. Inject `const TEXT = useHook();` in all functions that use `TEXT.`
  // Since we renamed TEXT to EN_TEXT, usages like TEXT.appName became EN_TEXT.appName automatically via ts-morph!
  // We need to rename them BACK to TEXT.appName, and then inject the hook!
  // Wait, ts-morph `rename` automatically renames all references!
  // So all `TEXT.` references became `EN_TEXT.`. We should find all references of `EN_TEXT` inside function bodies, and change them to `TEXT`, AND inject the hook.
  
  const enTextRefNodes = textVar.findReferencesAsNodes();
  const functionsToInject = new Set<string>();

  for (const node of enTextRefNodes) {
    // We only care about references inside functions/components
    const parentFunc = node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) || 
                       node.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
                       node.getFirstAncestorByKind(SyntaxKind.FunctionExpression);
                       
    if (parentFunc) {
      // It's inside a function. Rename this specific node back to TEXT
      node.replaceWithText('TEXT');
      
      // Mark this function for injection
      // Use the function's start position as a unique key
      functionsToInject.add(parentFunc.getStart().toString());
    }
  }

  // Now inject the hook at the top of these functions
  for (const funcStartPos of functionsToInject) {
    // Find the node again (positions might have shifted, but we can do it by iterating and keeping references)
    // Actually, it's safer to just get all functions, and check if they contain the identifier "TEXT"
  }
  
  // Re-evaluate functions to inject
  const allFunctions = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
  ];
  
  for (const func of allFunctions) {
    // Check if body contains identifier 'TEXT'
    const hasTextRef = func.getDescendantsOfKind(SyntaxKind.Identifier).some(id => id.getText() === 'TEXT' && id.getParent()?.getKind() === SyntaxKind.PropertyAccessExpression);
    
    if (hasTextRef) {
      const body = func.getBody();
      if (body && body.getKind() === SyntaxKind.Block) {
        // Inject at start of block
        const block = body.asKind(SyntaxKind.Block);
        if (block) {
          block.insertStatements(0, `const TEXT = ${hookName}();`);
        }
      }
    }
  }
  
  sourceFile.saveSync();
  console.log(`  Done processing ${fileName}.`);
}
