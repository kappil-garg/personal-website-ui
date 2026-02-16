import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function updateAllVersions() {
    try {
        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const version = packageJson.version;
        if (!version || typeof version !== 'string') {
            throw new Error('package.json version is missing or invalid');
        }
        console.log(`🔄 Syncing UI version references to ${version}`);
        const files = [
            'src/environments/environment.ts',
            'src/environments/environment.prod.ts'
        ];
        let updatedCount = 0;
        for (const filePath of files) {
            updatedCount += updateVersionProperty(filePath, version);
        }
        if (updatedCount === 0) {
            console.log('ℹ️ No files needed updates (already in sync).');
        } else {
            console.log(`✅ Updated ${updatedCount} file(s).`);
        }
    } catch (error) {
        console.error(`❌ Error syncing versions: ${error.message}`);
        process.exit(1);
    }
}

function updateVersionProperty(filePath, version) {
    const fullPath = join(process.cwd(), filePath);
    if (!existsSync(fullPath)) {
        console.log(`⏭️ Skipped missing file: ${filePath}`);
        return 0;
    }
    const content = readFileSync(fullPath, 'utf8');
    const versionRegex = /version:\s*['"`][^'"`]*['"`]/;
    if (!versionRegex.test(content)) {
        console.log(`⏭️ Skipped ${filePath} (no 'version' property found)`);
        return 0;
    }
    const updatedContent = content.replace(versionRegex, `version: '${version}'`);
    if (updatedContent === content) {
        console.log(`✓ ${filePath} already up to date`);
        return 0;
    }
    writeFileSync(fullPath, updatedContent, 'utf8');
    console.log(`✅ Updated ${filePath}`);
    return 1;
}

updateAllVersions();
