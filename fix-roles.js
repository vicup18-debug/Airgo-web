const fs = require('fs');
const path = require('path');
const d = 'backend/routes';

fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if(fs.statSync(p).isFile() && p.endsWith('.js')) {
        let c = fs.readFileSync(p, 'utf8');
        let original = c;
        
        // Replace auth(['admin', 'superadmin'].includes(user.role))
        c = c.replace(/auth\(\['admin', 'superadmin'\]\.includes\(user\.role\)\)/g, "['admin', 'superadmin'].includes(authUser.role)");
        
        // Also check if there's any other variations like authUser instead of user in the bad regex
        c = c.replace(/auth\(\['admin', 'superadmin'\]\.includes\(authUser\.role\)\)/g, "['admin', 'superadmin'].includes(authUser.role)");
        
        // Also check for user.role (where it should be authUser.role) in regular arrays without auth()
        // Wait, maybe some places use `user.role` when `user` doesn't exist? Let's be careful.
        
        if (c !== original) {
            fs.writeFileSync(p, c);
            console.log('Fixed ' + f);
        }
    }
});
