const fs = require('fs');
const path = 'airgo-web/app/partner/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add handleUpdateInventory
const newFn = `        } catch (error) {
            toast.error("❌ Error listing item. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateInventory = async (id, updates) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';
            const isCar = user.partnerType === 'car';
            const endpoint = isCar ? \`/api/cars/\${id}\` : \`/api/rooms/\${id}\`;
            
            const response = await fetch(\`\${apiUrl}\${endpoint}\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                toast.success("Inventory updated successfully!");
                fetchPartnerData(user);
            } else {
                toast.error("Failed to update inventory.");
            }
        } catch (error) {
            toast.error("Error updating inventory.");
        }
    };`;

content = content.replace(/\s*\}\s*catch \(error\) \{\s*toast\.error\("❌ Error listing item\. Please try again\."\);\s*\}\s*finally \{\s*setIsUploading\(false\);\s*\}\s*\};\s*/g, '\n' + newFn + '\n\n');

// Update Inventory Tab UI
const oldUI = `<div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                                                        <p className="font-black text-[#004A99]">₦{(item.price || item.pricePerNight)?.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ night</span></p>
                                                        {item.totalAllocated && <span className="bg-blue-50 text-[#004A99] font-bold text-xs px-2.5 py-1 rounded-md">Pool: {item.totalAllocated} Rooms</span>}
                                                    </div>`;

const newUI = `<div className="flex flex-col mt-4 pt-2 border-t border-gray-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="font-black text-[#004A99]">₦{(item.price || item.pricePerNight)?.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">/ {user.partnerType === 'car' ? 'day' : 'night'}</span></p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-500">Discount:</span>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-16 px-2 py-1 border rounded text-xs text-center" 
                                                                    value={item.discountPercentage || 0}
                                                                    onChange={(e) => handleUpdateInventory(item._id, { discountPercentage: parseInt(e.target.value) || 0 })}
                                                                    min="0" max="100"
                                                                />
                                                                <span className="text-xs font-bold text-gray-500">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                                                            <span className="text-xs font-bold text-gray-600">Airgo Pool Allocation</span>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => handleUpdateInventory(item._id, { totalAllocated: Math.max(0, (item.totalAllocated || 0) - 1) })}
                                                                    className="w-6 h-6 bg-white text-[#004A99] rounded font-bold shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                                                                >-</button>
                                                                <span className="font-black text-gray-900 min-w-[20px] text-center">{item.totalAllocated || 0}</span>
                                                                <button 
                                                                    onClick={() => handleUpdateInventory(item._id, { totalAllocated: (item.totalAllocated || 0) + 1 })}
                                                                    className="w-6 h-6 bg-[#004A99] text-white rounded font-bold shadow-sm hover:bg-blue-800 flex items-center justify-center"
                                                                >+</button>
                                                            </div>
                                                        </div>
                                                    </div>`;

content = content.replace(oldUI, newUI);

// Update Inventory MODAL UI
content = content.replace(
    `                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.capacity} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} /></div>`,
    `                                <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Capacity</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.capacity} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-900 uppercase mb-1">Total Allocated</label><input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl text-gray-900" value={newItem.totalAllocated} onChange={e => setNewItem({ ...newItem, totalAllocated: e.target.value })} /></div>`
);

fs.writeFileSync(path, content);
console.log('Partner UI updated');
