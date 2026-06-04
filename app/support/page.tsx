"use client";

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FAQ {
    question: string;
    answer: string;
    category: 'general' | 'payments' | 'bookings' | 'partners';
}

const FAQS: FAQ[] = [
    {
        category: 'payments',
        question: "How does the Airgo Escrow system work?",
        answer: "When you book a stay or a car, your payment is held securely in the Airgo Escrow ledger. The funds are only disbursed to the partner after your check-in or booking starts successfully, ensuring 100% protection against scams and overbookings."
    },
    {
        category: 'payments',
        question: "What is your cancellation and refund policy?",
        answer: "Reservations covered under our Escrow framework are eligible for a 70% refund of the total booking price directly back to your payout account, provided cancellation is requested within the standard policy window."
    },
    {
        category: 'bookings',
        question: "How do I check in or pick up my car?",
        answer: "Once payment is verified, your official VAT invoice and secure itinerary PDF are sent to your email. This document contains exact instructions, pick-up points, and the verified partner's direct hotline for check-in."
    },
    {
        category: 'bookings',
        question: "Can I modify my booking dates?",
        answer: "Yes, you can request changes to check-in/out dates from your Client Dashboard. Any adjustments are subject to availability and will automatically recalculate the pricing based on seasonal rates."
    },
    {
        category: 'partners',
        question: "How do I list my hotel or vehicle fleet?",
        answer: "Sign up via the Partner portal. Once our compliance team reviews your business documentation and approves your profile, you will be able to list items directly on the live matrix pool."
    },
    {
        category: 'partners',
        question: "When are payouts disbursed to partners?",
        answer: "Once a booking commences, the escrow funds are authorized by our super admin team. Partner disbursements are initiated via direct bank transfer to your registered payout credentials."
    }
];

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'message'>('chat');
    const [faqSearch, setFaqSearch] = useState('');
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
    
    // Contact Form State
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Inquiry', message: '' });
    
    // Chat Bot State
    const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
        { sender: 'bot', text: "Hello! I'm the Airgo Concierge Assistant. Ask me anything about our Stays, Car Rentals, Escrow ledger, or Partner protocols!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isBotTyping]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setChatMessages(prev => [...prev, { sender: 'user', text: userMessage, time: timeString }]);
        setChatInput('');
        setIsBotTyping(true);

        // Simulate AI thinking and reply
        setTimeout(() => {
            let reply = "I'm sorry, I couldn't fully capture that. Feel free to contact our support lines or submit a direct message in the 'Contact form' tab above!";
            const q = userMessage.toLowerCase();

            if (q.includes('escrow') || q.includes('safe') || q.includes('money') || q.includes('secure')) {
                reply = "All payments are secured in the Airgo Escrow ledger. Funds are only disbursed to the service partner after you check-in or start your booking successfully.";
            } else if (q.includes('refund') || q.includes('cancel') || q.includes('return')) {
                reply = "Cancellations inside the policy window qualify for a 70% refund directly to your payout account. You can request a cancellation from your dashboard.";
            } else if (q.includes('book') || q.includes('invoice') || q.includes('reserve')) {
                reply = "Choose an item from Stays or Cars, click book, and complete the Pay Escrow process. You'll instantly receive a VAT Invoice PDF in your inbox.";
            } else if (q.includes('partner') || q.includes('join') || q.includes('host') || q.includes('list')) {
                reply = "To list your hotel or fleet, sign up under the Partner tab. Once verified by compliance, you will get access to list your properties.";
            } else if (q.includes('payout') || q.includes('payouts') || q.includes('disburse')) {
                reply = "Partner payouts are processed securely after a client checks in or booking commences. Funds are sent via bank transfer.";
            } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
                reply = "Hello! How can I help you today? Ask me about escrow, refunds, bookings, or joining as a partner.";
            }

            setChatMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            setIsBotTyping(false);
        }, 800);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill out all required fields.");
            return;
        }
        toast.success("Message dispatch verified! A concierge ticket has been generated.");
        setFormData({ name: '', email: '', subject: 'Inquiry', message: '' });
    };

    const filteredFaqs = FAQS.filter(faq => {
        const query = faqSearch.toLowerCase();
        return faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-grow max-w-6xl mx-auto py-12 px-6 w-full">
                
                {/* 🌟 HEADER HEADER ACCENT */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="bg-[#EBF5FF] text-[#004A99] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        Concierge Assistance
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 tracking-tight">
                        How can we help you today?
                    </h1>
                    <p className="text-gray-500 mt-3 text-base">
                        Get prompt assistance for your stays, fleet rentals, escrow transactions, and affiliate earnings.
                    </p>
                </div>

                {/* 🌟 SPLIT VIEW GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* 📞 LEFT PANEL: CONTACT CHANNELS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Official Channels</h3>
                            
                            <div className="space-y-4">
                                <a href="tel:+2347078344409" className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50/50 hover:border-[#004A99] border border-transparent transition duration-300">
                                    <div className="w-10 h-10 bg-[#EBF5FF] text-[#004A99] flex items-center justify-center rounded-xl text-lg mr-4">📞</div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Call Support 24/7</h4>
                                        <p className="text-sm font-black text-gray-900">+234 707 834 4409</p>
                                    </div>
                                </a>

                                <a href="mailto:support@airgo.ng" className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50/50 hover:border-[#004A99] border border-transparent transition duration-300">
                                    <div className="w-10 h-10 bg-[#EBF5FF] text-[#004A99] flex items-center justify-center rounded-xl text-lg mr-4">✉️</div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">General Inquiries</h4>
                                        <p className="text-sm font-black text-gray-900">info@airgo.ng</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#000080] to-blue-900 p-6 rounded-3xl shadow-md text-white">
                            <h3 className="font-black text-lg mb-2">🛡️ Airgo Escrow Guarantee</h3>
                            <p className="text-xs text-blue-200 leading-relaxed">
                                Every reservation made on Airgo is fully backed by multi-sig partner protocol escrows. Your funds are secured until check-in or delivery is confirmed, protecting both clients and partners.
                            </p>
                        </div>
                    </div>

                    {/* ⚙️ RIGHT PANEL: SMART CUSTOMER TABS */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        
                        {/* 🌟 TAB SELECTOR */}
                        <div className="flex border-b border-gray-100 bg-gray-50/80 shrink-0">
                            <button 
                                onClick={() => setActiveTab('chat')} 
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition ${activeTab === 'chat' ? 'bg-white text-[#004A99] border-b-2 border-[#004A99]' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                💬 Smart AI Support
                            </button>
                            <button 
                                onClick={() => setActiveTab('faqs')} 
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition ${activeTab === 'faqs' ? 'bg-white text-[#004A99] border-b-2 border-[#004A99]' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                ❓ Categorized FAQs
                            </button>
                            <button 
                                onClick={() => setActiveTab('message')} 
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition ${activeTab === 'message' ? 'bg-white text-[#004A99] border-b-2 border-[#004A99]' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                ✉️ Contact Form
                            </button>
                        </div>

                        {/* 🌟 TAB CONTENT AREAS */}
                        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                            
                            {/* 💬 TAB 1: AI CONCIERGE CHATBOT */}
                            {activeTab === 'chat' && (
                                <div className="flex flex-col flex-1 h-[420px]">
                                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 max-h-[350px]">
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#004A99] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                    <p className="leading-relaxed font-medium">{msg.text}</p>
                                                    <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {isBotTyping && (
                                            <div className="flex justify-start animate-pulse">
                                                <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-tl-none text-xs font-bold shadow-sm">
                                                    Concierge Assistant is typing...
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    
                                    <form onSubmit={handleSendMessage} className="flex gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 shrink-0">
                                        <input 
                                            type="text" 
                                            placeholder="Ask about refunds, escrow ledger, or listing updates..." 
                                            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-700 outline-none"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                        />
                                        <button type="submit" className="bg-[#004A99] hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition">
                                            Send
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* ❓ TAB 2: FAQ ACCORDIONS */}
                            {activeTab === 'faqs' && (
                                <div className="space-y-4">
                                    <div className="relative mb-6">
                                        <input 
                                            type="text" 
                                            placeholder="Filter FAQs by keyword..." 
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#004A99] focus:bg-white transition-all"
                                            value={faqSearch}
                                            onChange={(e) => setFaqSearch(e.target.value)}
                                        />
                                        <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
                                    </div>

                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                        {filteredFaqs.length === 0 ? (
                                            <p className="text-center text-gray-500 py-8">No FAQs match your search criteria.</p>
                                        ) : filteredFaqs.map((faq, index) => {
                                            const isOpen = expandedFaqIndex === index;
                                            return (
                                                <div key={index} className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                                                    <button 
                                                        onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                                                        className="w-full text-left p-5 flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition"
                                                    >
                                                        <span className="font-bold text-gray-900 text-sm">{faq.question}</span>
                                                        <span className="text-[#004A99] font-black">{isOpen ? '▲' : '▼'}</span>
                                                    </button>
                                                    {isOpen && (
                                                        <div className="p-5 border-t border-gray-100 bg-white text-sm text-gray-600 leading-relaxed">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ✉️ TAB 3: CONTACT FORM */}
                            {activeTab === 'message' && (
                                <form onSubmit={handleFormSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Full Name</label>
                                            <input 
                                                required 
                                                type="text" 
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" 
                                                placeholder="e.g. John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Email Address</label>
                                            <input 
                                                required 
                                                type="email" 
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" 
                                                placeholder="e.g. john@example.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Subject</label>
                                        <select 
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="Inquiry">General Inquiry</option>
                                            <option value="Booking">Booking Dispute</option>
                                            <option value="Escrow">Escrow Ledger / Payments</option>
                                            <option value="Partner">Partner Registration</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase mb-1">How can we assist you?</label>
                                        <textarea 
                                            required 
                                            rows={4}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white resize-none" 
                                            placeholder="Include booking reference numbers or specific details..."
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-[#004A99] hover:bg-blue-800 text-white font-black text-sm py-3.5 rounded-xl shadow-md transition-all">
                                        Send Direct Support Message
                                    </button>
                                </form>
                            )}

                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}