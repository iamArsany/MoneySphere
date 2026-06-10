import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project();
const filePath = path.join('d:/ITI/Labs/Hakathon/PFT/frontend', 'src/features/auth/LoginPage.tsx');

const sourceFile = project.addSourceFileAtPath(filePath);

// 1. Remove DEFAULT_BRANDING
const defaultBranding = sourceFile.getVariableStatement('DEFAULT_BRANDING');
if (defaultBranding) {
  defaultBranding.remove();
}

// 2. Find LoginPage function
const loginPageFunc = sourceFile.getFunction('LoginPage');
if (loginPageFunc) {
  const body = loginPageFunc.getBody();
  if (body && body.getKind() === SyntaxKind.Block) {
    const text = body.getText();
    // Replace const pageBranding = branding ?? DEFAULT_BRANDING
    // with dynamic object
    const newText = text.replace(
      /const pageBranding = branding \?\? DEFAULT_BRANDING/,
      `const pageBranding = branding ?? {
    appName: TEXT_VAR.appName,
    appSubtitle: TEXT_VAR.appSubtitle,
    headline: TEXT_VAR.headline,
    description: TEXT_VAR.description,
  }`
    );
    
    // To do this safely, we just replace the body text.
    // However, ts-morph doesn't let us just set the body text easily if it contains existing statements we want to keep.
    // Instead, we find the VariableDeclaration for pageBranding
    const pageBrandingDecl = loginPageFunc.getVariableDeclaration('pageBranding');
    if (pageBrandingDecl) {
      pageBrandingDecl.setInitializer(`branding ?? {
    appName: TEXT_VAR.appName,
    appSubtitle: TEXT_VAR.appSubtitle,
    headline: TEXT_VAR.headline,
    description: TEXT_VAR.description,
  }`);
    }
  }
}

sourceFile.saveSync();
console.log('Fixed LoginPage branding!');
