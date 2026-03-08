
import fs from 'fs';
import path from 'path';

function fixGradients(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                fixGradients(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let changed = false;

            // Fix ellipse [size] at -> [size] at
            content = content.replace(/radial-gradient\(\s*ellipse\s+([\d%]+\s+[\d%]+)\s+at/g, (match, size) => {
                changed = true;
                return `radial-gradient(${size} at`;
            });

            // Fix at center -> at 50% 50%
            if (content.includes('at center')) {
                content = content.replace(/at center/g, 'at 50% 50%');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed gradients in ${fullPath}`);
            }
        }
    }
}

fixGradients('./src');
