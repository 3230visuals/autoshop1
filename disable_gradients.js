
import fs from 'fs';
import path from 'path';

function disableGradients(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                disableGradients(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('radial-gradient')) {
                content = content.replace(/radial-gradient\([^;]+\)/g, 'linear-gradient(to bottom, #09090b, #09090b)');
                fs.writeFileSync(fullPath, content);
                console.log(`Disabled gradients in ${fullPath}`);
            }
        }
    }
}

disableGradients('./src');
