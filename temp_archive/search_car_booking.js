const fs = require('fs');

function searchFile(filepath, keywords) {
    console.log(`\n--- SEARCHING: ${filepath} ---`);
    if (!fs.existsSync(filepath)) {
        console.log("File does not exist.");
        return;
    }
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        if (keywords.some(kw => lowerLine.includes(kw.toLowerCase()))) {
            console.log(`${index + 1}: ${line.trim()}`);
        }
    });
}

searchFile('c:/Users/USER/Desktop/VIU/Above/My websites/Hotel/hotel-booking-system/airgo-web/app/cars/page.tsx', ['modal', 'confirm booking', 'delivery address', 'pickup', 'escrow']);
searchFile('c:/Users/USER/Desktop/VIU/Above/My websites/Hotel/hotel-booking-system/airgo-web/app/page.tsx', ['modal', 'confirm booking', 'delivery address', 'pickup', 'escrow']);
