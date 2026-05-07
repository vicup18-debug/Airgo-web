"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CarsPage() {
    const [cars] = useState([
        { id: 1, name: "Toyota Prado SUV", type: "Executive/Corporate", price: "₦120,000/day", image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1000", features: "5 Seats · Auto · AC" },
        { id: 2, name: "Mercedes Benz S-Class", type: "Luxury Chauffeur", price: "₦250,000/day", image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=1000", features: "4 Seats · Auto · AC" },
        { id: 3, name: "Toyota Camry", type: "Standard City Drive", price: "₦65,000/day", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=1000", features: "5 Seats · Auto · AC" },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-[#004A99] text-white py-4 px-8 flex justify-between items-center shadow-md">
                <Link href="/">
                    <div className="text-2xl font-black tracking-tight cursor-pointer">
                        Airgo<span className="text-[#FFB81C]">.ng</span>
                    </div>
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto py-8 px-6">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Premium Car Rentals & Airport Transfers</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cars.map((car) => (
                        <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="h-48 relative bg-gray-200">
                                <Image src={car.image} alt={car.name} layout="fill" objectFit="cover" />
                            </div>
                            <div className="p-6">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{car.type}</span>
                                <h2 className="text-xl font-black text-[#004A99] mt-1 mb-2">{car.name}</h2>
                                <p className="text-sm text-gray-600 font-medium mb-4">{car.features}</p>
                                <div className="flex justify-between items-center mt-6 border-t border-gray-100 pt-4">
                                    <span className="text-xl font-black text-gray-900">{car.price}</span>
                                    <button className="bg-[#004A99] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition">Book Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}