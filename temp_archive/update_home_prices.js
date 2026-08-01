const fs = require('fs');

const path = 'airgo-web/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const calcOld = `  const calculateTotal = (pricePerNight: number) => {
    if (!checkIn || !checkOut) return pricePerNight;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (nights > 0 ? nights : 1) * pricePerNight;
  };`;

const calcNew = `  const calculateTotal = (room: any, skipDiscount = false) => {
    const pricePerNight = skipDiscount ? room.pricePerNight : room.pricePerNight * (1 - (room.discountPercentage || 0) / 100);
    if (!checkIn || !checkOut) return pricePerNight;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return (nights > 0 ? nights : 1) * pricePerNight;
  };`;

content = content.replace(calcOld, calcNew);

// Replace calls
content = content.replace(/calculateTotal\(selectedRoom\.pricePerNight\)/g, 'calculateTotal(selectedRoom)');
content = content.replace(/calculateTotal\(room\.pricePerNight\)/g, 'calculateTotal(room)');

// Update room card prices
const roomPriceOld = `                        <div>
                          <p className="text-2xl font-black text-[#000080]">₦{calculateTotal(room).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{checkIn && checkOut ? 'Total Price' : 'Per Night'}</p>
                        </div>`;
const roomPriceNew = `                        <div>
                          {room.discountPercentage > 0 && (
                              <p className="text-xs text-gray-400 font-bold line-through mb-0.5">₦{calculateTotal(room, true).toLocaleString()}</p>
                          )}
                          <p className="text-2xl font-black text-[#000080]">₦{calculateTotal(room).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{checkIn && checkOut ? 'Total Price' : 'Per Night'}</p>
                        </div>`;
content = content.replace(roomPriceOld, roomPriceNew);

// Add discount badge
const roomBadgeOld = `                      {!available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg text-sm uppercase tracking-wider transform -rotate-12 shadow-xl">Sold Out</span>
                        </div>
                      )}
                    </div>`;
const roomBadgeNew = `                      {!available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg text-sm uppercase tracking-wider transform -rotate-12 shadow-xl">Sold Out</span>
                        </div>
                      )}
                      {room.discountPercentage > 0 && available && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                              {room.discountPercentage}% OFF
                          </div>
                      )}
                    </div>`;
content = content.replace(roomBadgeOld, roomBadgeNew);


// Also update the total Escrow Hold in the modal (strike through original total)
const modalHoldOld = `<div className="flex justify-between items-end mt-4">
                <span className="text-xs uppercase font-black text-gray-400">Total Escrow Hold</span>
                <span className="text-3xl font-black text-[#000080]">₦{calculateTotal(selectedRoom).toLocaleString()}</span>
              </div>`;
const modalHoldNew = `<div className="flex justify-between items-end mt-4">
                <span className="text-xs uppercase font-black text-gray-400">Total Escrow Hold</span>
                <div className="text-right">
                  {selectedRoom.discountPercentage > 0 && (
                    <span className="text-sm text-gray-400 font-bold line-through mr-2">₦{calculateTotal(selectedRoom, true).toLocaleString()}</span>
                  )}
                  <span className="text-3xl font-black text-[#000080]">₦{calculateTotal(selectedRoom).toLocaleString()}</span>
                </div>
              </div>`;
content = content.replace(modalHoldOld, modalHoldNew);

fs.writeFileSync(path, content);
console.log('Homepage prices updated successfully!');
