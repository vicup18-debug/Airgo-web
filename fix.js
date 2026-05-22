const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Add toast import
content = content.replace(
  `import React, { useState, useEffect } from 'react';\nimport Link from 'next/link';`,
  `import React, { useState, useEffect } from 'react';\nimport toast from 'react-hot-toast';\nimport Link from 'next/link';`
);

// 2. Replace alerts with toasts
content = content.replace(
  `alert("Please sign in to secure your escrow reservation.");`,
  `toast.success("Please sign in to secure your escrow reservation.");`
);

content = content.replace(
  `alert("✅ Booking Confirmed! Your Escrow hold is active and PDF Invoice has been generated.");`,
  `toast.success("Booking Confirmed! Your Escrow hold is active and PDF Invoice has been generated.");`
);

content = content.replace(
  `alert(\`❌ \${error.message}\`);`,
  `toast.error(\`❌ \${error.message}\`);`
);

// 3. Fix price object bug
content = content.replace(
  `  const calculateTotal = (pricePerNight: number) => {
    if (!checkIn || !checkOut) return pricePerNight;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (nights > 0 ? nights : 1) * pricePerNight;
  };`,
  `  const calculateTotal = (room: any) => {
    let price = room.pricePerNight || room.price || 0;
    if (typeof price === 'object' && price.$numberDecimal) {
      price = Number(price.$numberDecimal);
    } else if (typeof price === 'string') {
      price = Number(price.replace(/[^0-9]/g, '')) || 0;
    }
    const numericPrice = Number(price);

    if (!checkIn || !checkOut) return numericPrice;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (nights > 0 ? nights : 1) * numericPrice;
  };`
);

// Update calls to calculateTotal
content = content.replace(
  /calculateTotal\(selectedRoom\.pricePerNight\)/g,
  `calculateTotal(selectedRoom)`
);

content = content.replace(
  /calculateTotal\(room\.pricePerNight\)/g,
  `calculateTotal(room)`
);


// 4. Fix image fallback bug
content = content.replace(
  `<img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />`,
  `<img src={room.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />`
);

fs.writeFileSync('app/page.tsx', content);
console.log('Fixed page.tsx');
