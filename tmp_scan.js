
import fs from 'fs';
import path from 'path';

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                scanDir(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.ts') || file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const matches = content.match(/radial-gradient\([^)]+\)/g);
            if (matches) {
                for (const match of matches) {
                    if (match.includes('closest') || match.includes('farthest')) {
                        console.log(`Potential issue found in ${fullPath}: ${match}`);
                    }
                }
            }
        }
    }
}

scanDir('./src');
