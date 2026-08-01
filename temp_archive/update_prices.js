const fs = require('fs');

// 1. Update app/cars/page.tsx
const carsPath = 'airgo-web/app/cars/page.tsx';
let carsContent = fs.readFileSync(carsPath, 'utf8');

const carBadgeOld = `<div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                                                {car.type}
                                            </div>`;
const carBadgeNew = `<div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                                                {car.type}
                                            </div>
                                            {car.discountPercentage > 0 && (
                                                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                                                    {car.discountPercentage}% OFF
                                                </div>
                                            )}`;

const carPriceOld = `                                                <div>
                                                    <p className="text-2xl font-black text-[#000080]">
                                                        {typeof car.price === 'number' ? \`₦\${car.price.toLocaleString()}\` : car.price}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">per day</p>
                                                </div>`;
const carPriceNew = `                                                <div>
                                                    {car.discountPercentage > 0 && (
                                                        <p className="text-xs text-gray-400 font-bold line-through mb-0.5">
                                                            {typeof car.price === 'number' ? \`₦\${car.price.toLocaleString()}\` : car.price}
                                                        </p>
                                                    )}
                                                    <p className="text-2xl font-black text-[#000080]">
                                                        {typeof car.price === 'number' ? \`₦\${(car.price * (1 - (car.discountPercentage || 0) / 100)).toLocaleString()}\` : car.price}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">per day</p>
                                                </div>`;

carsContent = carsContent.replace(carBadgeOld, carBadgeNew);
carsContent = carsContent.replace(carPriceOld, carPriceNew);
fs.writeFileSync(carsPath, carsContent);


// 2. Update app/hotels/page.tsx
const hotelsPath = 'airgo-web/app/hotels/page.tsx';
let hotelsContent = fs.readFileSync(hotelsPath, 'utf8');

const hotelBadgeOld = `<div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md">
                                                <span className="text-xs font-black text-gray-900">⭐ {hotel.rating || 'New'}</span>
                                            </div>`;
const hotelBadgeNew = `<div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md">
                                                <span className="text-xs font-black text-gray-900">⭐ {hotel.rating || 'New'}</span>
                                            </div>
                                            {hotel.discountPercentage > 0 && (
                                                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                                                    {hotel.discountPercentage}% OFF
                                                </div>
                                            )}`;

const hotelPriceOld = `<div className="absolute bottom-4 right-4 bg-[#FFB81C] text-[#004A99] font-black px-4 py-1.5 rounded-xl shadow-lg">
                                                ₦{hotel.price?.toLocaleString()}
                                            </div>`;
const hotelPriceNew = `<div className="absolute bottom-4 right-4 flex flex-col items-end">
                                                {hotel.discountPercentage > 0 && (
                                                    <span className="text-xs text-white font-bold line-through mb-1 drop-shadow-md">
                                                        ₦{hotel.price?.toLocaleString() || hotel.pricePerNight?.toLocaleString()}
                                                    </span>
                                                )}
                                                <div className="bg-[#FFB81C] text-[#004A99] font-black px-4 py-1.5 rounded-xl shadow-lg">
                                                    ₦{((hotel.price || hotel.pricePerNight) * (1 - (hotel.discountPercentage || 0) / 100))?.toLocaleString()}
                                                </div>
                                            </div>`;

hotelsContent = hotelsContent.replace(hotelBadgeOld, hotelBadgeNew);
hotelsContent = hotelsContent.replace(hotelPriceOld, hotelPriceNew);
fs.writeFileSync(hotelsPath, hotelsContent);

console.log('Prices updated successfully!');
