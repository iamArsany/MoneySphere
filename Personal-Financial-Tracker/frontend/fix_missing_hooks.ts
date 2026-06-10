import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project();

const files = [
  'src/features/dashboard/DashboardPage.tsx',
  'src/features/accounts/AccountsPage.tsx',
  'src/features/transactions/TransactionsPage.tsx',
  'src/features/budgets/BudgetsPage.tsx',
  'src/features/notifications/NotificationsPage.tsx',
  'src/features/auth/ProfileSettingsPage.tsx',
  'src/features/auth/LoginPage.tsx',
  'src/features/dashboard/LandingPage.tsx'
];

for (const filePath of files) {
  const fullPath = path.join('d:/ITI/Labs/Hakathon/PFT/frontend', filePath);
  if (!fs.existsSync(fullPath)) continue;
  
  console.log(`Processing ${filePath}...`);
  const sourceFile = project.addSourceFileAtPath(fullPath);
  const baseName = sourceFile.getBaseNameWithoutExtension();
  const hookName = `use${baseName}Text`;

  const funcs = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
  ];

  let modified = false;

  for (const func of funcs) {
    const body = func.getBody();
    if (!body || !Node.isBlock(body)) continue;

    // Check if body contains TEXT_VAR.
    const textStr = body.getText();
    if (textStr.includes('TEXT_VAR.') || textStr.includes('TEXT_VAR[')) {
      // Check if it already defines TEXT_VAR
      if (!textStr.includes('const TEXT_VAR =')) {
        body.insertStatements(0, `const TEXT_VAR = ${hookName}();`);
        modified = true;
      }
    }
  }

  if (modified) {
    sourceFile.saveSync();
    console.log(`Fixed missing TEXT_VAR in ${filePath}`);
  }
}
