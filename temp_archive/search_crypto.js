const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.expo' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('expo-crypto')) {
                console.log('Found in:', fullPath);
            }
        }
    }
}

search('c:\\Users\\USER\\Desktop\\VIU\\Above\\My websites\\Hotel\\hotel-booking-system\\mobile-app');
