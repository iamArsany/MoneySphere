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

    const textStr = body.getText();
    const hasTextVarUsage = textStr.includes('TEXT_VAR.') || textStr.includes('TEXT_VAR[');
    
    if (hasTextVarUsage) {
      // Check if the block has a TOP-LEVEL declaration of TEXT_VAR
      const hasTopLevelDecl = body.getVariableStatements().some(vs => 
        vs.getDeclarations().some(d => d.getName() === 'TEXT_VAR')
      );

      if (!hasTopLevelDecl) {
        body.insertStatements(0, `const TEXT_VAR = ${hookName}();`);
        modified = true;
      }
    } else {
      // It DOES NOT use TEXT_VAR. Ensure we REMOVE any injected ones at the top level
      const decls = body.getVariableStatements().filter(vs => 
        vs.getDeclarations().some(d => d.getName() === 'TEXT_VAR')
      );
      if (decls.length > 0) {
        for (const decl of decls) {
          decl.remove();
        }
        modified = true;
      }
    }
  }

  if (modified) {
    sourceFile.saveSync();
    console.log(`Fixed TEXT_VAR locations in ${filePath}`);
  }
}
