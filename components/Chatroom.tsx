"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface Message {
    _id?: string;
    bookingId: string;
    senderId: string;
    senderName: string;
    senderRole: 'client' | 'partner' | 'admin';
    text: string;
    createdAt: string;
}

interface ChatroomProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    bookingName: string;
    currentUser: {
        id?: string;
        userId?: string;
        _id?: string;
        name: string;
        role: 'client' | 'partner' | 'admin';
    };
}

export default function Chatroom({ isOpen, onClose, bookingId, bookingName, currentUser }: ChatroomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const currentUserId = currentUser.id || currentUser.userId || currentUser._id || '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airgo-backend.onrender.com';

    // 🟢 VoIP STATE & REFS
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connecting' | 'active' | 'ended'>('idle');
    const [callerName, setCallerName] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);
    const incomingOfferRef = useRef<any>(null);

    const callStateRef = useRef(callState);
    useEffect(() => {
        callStateRef.current = callState;
    }, [callState]);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const startTimer = () => {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        setCallDuration(0);
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const handleHangUp = (shouldSignal = true) => {
        if (shouldSignal && socketRef.current) {
            socketRef.current.emit('voip_signal', {
                bookingId,
                type: 'hangup',
                senderId: currentUserId
            });
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }

        setCallState('ended');
        setRemoteStream(null);
        setIsMuted(false);

        setTimeout(() => {
            setCallState('idle');
        }, 2000);
    };

    const handleHangUpRef = useRef<any>(null);
    handleHangUpRef.current = handleHangUp;

    const initPeerConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });
        peerConnectionRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('voip_signal', {
                    bookingId,
                    type: 'candidate',
                    candidate: event.candidate,
                    senderId: currentUserId
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                if (localStreamRef.current) {
                    pc.addTrack(track, localStreamRef.current);
                }
            });
        }

        return pc;
    };

    const getLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            return stream;
        } catch (err) {
            toast.error("🔒 Microphone permission denied or device not found.");
            throw err;
        }
    };

    const handleStartCall = async () => {
        setCallState('calling');
        setCallDuration(0);
        try {
            await getLocalStream();
            const pc = initPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (socketRef.current) {
                socketRef.current.emit('voip_signal', {
                    bookingId,
                    type: 'offer',
                    offer,
                    senderId: currentUserId,
                    senderName: currentUser.name
                });
            }
        } catch (err) {
            handleHangUp();
        }
    };

    const handleAcceptCall = async () => {
        if (!incomingOfferRef.current) return;
        setCallState('connecting');
        try {
            await getLocalStream();
            const pc = initPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (socketRef.current) {
                socketRef.current.emit('voip_signal', {
                    bookingId,
                    type: 'answer',
                    answer,
                    senderId: currentUserId
                });
            }
            setCallState('active');
            startTimer();
        } catch (err) {
            handleHangUp();
        }
    };

    const handleDeclineCall = () => {
        if (socketRef.current) {
            socketRef.current.emit('voip_signal', {
                bookingId,
                type: 'reject',
                senderId: currentUserId
            });
        }
        setCallState('idle');
    };

    const handleToggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const formatDuration = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize messages and socket connection
    useEffect(() => {
        if (!isOpen || !bookingId) return;

        setIsLoading(true);
        setMessages([]);

        // 1. Fetch chat history
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('airgo_token');
                const res = await fetch(`${apiUrl}/api/chats/booking/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                } else {
                    const err = await res.json();
                    toast.error(err.message || "Failed to load chat history.");
                }
            } catch (e) {
                console.error("Chat history fetch error:", e);
                toast.error("Error connecting to chat server.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();

        // 2. Establish Socket connection
        const socket = io(apiUrl, {
            transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join_booking_chat', { bookingId });
            console.log("⚡ Connected to Airgo Socket Server");
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log("❌ Disconnected from Airgo Socket Server");
        });

        // 3. Listen for incoming messages
        socket.on('receive_chat_message', (msg: Message) => {
            setMessages((prev) => {
                const exists = prev.some(m => m._id === msg._id || (m.createdAt === msg.createdAt && m.senderId === msg.senderId && m.text === msg.text));
                if (exists) return prev;
                return [...prev, msg];
            });
        });

        // 4. Listen for VoIP signals
        socket.on('voip_signal', async (data: any) => {
            if (data.senderId === currentUserId) return;

            switch (data.type) {
                case 'offer':
                    if (callStateRef.current !== 'idle') {
                        socket.emit('voip_signal', {
                            bookingId,
                            type: 'reject',
                            reason: 'busy',
                            senderId: currentUserId
                        });
                        return;
                    }
                    setCallerName(data.senderName || 'Partner');
                    setCallState('incoming');
                    incomingOfferRef.current = data.offer;
                    break;
                case 'answer':
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                            setCallState('active');
                            startTimer();
                        } catch (err) {
                            console.error("Error setting remote answer:", err);
                        }
                    }
                    break;
                case 'candidate':
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) {
                            console.error("Error adding candidate:", e);
                        }
                    }
                    break;
                case 'hangup':
                    handleHangUpRef.current(false);
                    break;
                case 'reject':
                    toast.error(data.reason === 'busy' ? "User is busy in another call." : "Call declined.");
                    handleHangUpRef.current(false);
                    break;
                default:
                    break;
            }
        });

        return () => {
            socket.emit('leave_booking_chat', { bookingId });
            socket.disconnect();
            socketRef.current = null;

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, [isOpen, bookingId, apiUrl]);

    if (!isOpen) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        // 🚨 PHONE NUMBER PROTECTION: Block numbers with more than 9 digits
        const phoneRegex = /(?:\d[\s\-\.\(\)\+]*){10,}/;
        if (phoneRegex.test(trimmed)) {
            toast.error("🔒 Phone number exchange is prohibited to prevent off-platform transactions.");
            return;
        }

        try {
            const token = localStorage.getItem('airgo_token');
            // 1. Save message to MongoDB
            const res = await fetch(`${apiUrl}/api/chats/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId,
                    text: trimmed
                })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                
                // 2. Broadcast via Socket.io for real-time delivery
                if (socketRef.current && isConnected) {
                    socketRef.current.emit('new_chat_message', savedMsg);
                }

                // 3. Update local state
                setMessages(prev => [...prev, savedMsg]);
                setNewMessage('');
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to deliver message.");
            }
        } catch (error) {
            toast.error("Network error sending message.");
        }
    };

    const formatMessageTime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#000080]/60 backdrop-blur-sm overflow-hidden">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[85vh] animate-in fade-in zoom-in duration-200 relative">
                
                {/* Header */}
                <div className="bg-[#000080] p-4 text-white rounded-t-3xl flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFB81C] text-[#000080] rounded-full flex items-center justify-center font-black shadow-inner">
                            💬
                        </div>
                        <div>
                            <h3 className="font-black text-sm truncate max-w-[200px]">{bookingName}</h3>
                            <p className="text-[10px] text-blue-200 font-bold flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></span>
                                {isConnected ? 'Secure Connection Active' : 'Connecting to Server...'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isConnected && callState === 'idle' && (
                            <button 
                                onClick={handleStartCall}
                                title="Start Voice Call"
                                className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                            >
                                📞
                            </button>
                        )}
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition cursor-pointer">✕</button>
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-50 border-b border-amber-100 p-2 text-center text-[10px] text-amber-800 font-bold tracking-wide shrink-0">
                    🔒 Security Guard: Exchange of phone numbers (10+ digits) is strictly blocked in this chatroom.
                </div>

                {/* Messages Panel */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000080]"></div>
                            <span className="text-xs font-bold">Synchronizing history...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 gap-2">
                            <span className="text-4xl">👋</span>
                            <h4 className="font-black text-gray-700 mt-2">Start the Conversation</h4>
                            <p className="text-xs max-w-xs leading-relaxed">
                                Chat safely regarding delivery details, check-in logistics, or support questions here on the Airgo platform.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={msg._id || index} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <div className="text-[9px] font-bold text-gray-400 mb-0.5 uppercase tracking-wide px-1">
                                        {isMe ? 'You' : `${msg.senderName} (${msg.senderRole})`}
                                    </div>
                                    <div className={`p-3 rounded-2xl shadow-sm text-sm font-medium ${
                                        isMe 
                                            ? 'bg-[#000080] text-white rounded-tr-none' 
                                            : msg.senderRole === 'admin'
                                                ? 'bg-[#FFB81C] text-[#000080] rounded-tl-none font-bold'
                                                : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                                    }`}>
                                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                                        <p className={`text-[8px] text-right mt-1.5 font-bold ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {formatMessageTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Panel */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0 rounded-b-3xl">
                    <input
                        type="text"
                        placeholder="Type message... (phone numbers blocked)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm outline-none focus:border-[#000080] transition text-gray-900 font-medium"
                        maxLength={500}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition ${
                            newMessage.trim() 
                                ? 'bg-[#000080] text-white hover:bg-blue-900 shadow-md cursor-pointer' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Send
                    </button>
                </form>

                {/* VoIP CALL OVERLAY */}
                {callState !== 'idle' && (
                    <div className="absolute inset-0 bg-[#000080]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white rounded-3xl animate-in fade-in duration-200">
                        {/* Audio Element */}
                        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

                        {/* Caller/Receiver Avatar and Ringing/Pulse Wave */}
                        <div className="relative mb-8">
                            <div className={`w-24 h-24 bg-[#FFB81C] text-[#000080] rounded-full flex items-center justify-center text-4xl font-black shadow-lg z-10 relative ${
                                ['calling', 'incoming', 'connecting'].includes(callState) ? 'animate-bounce' : ''
                            }`}>
                                📞
                            </div>
                            {/* Pulse Waves */}
                            {['calling', 'incoming', 'active'].includes(callState) && (
                                <div className="absolute inset-0 -m-4 bg-white/10 rounded-full animate-ping z-0" />
                            )}
                        </div>

                        {/* Caller Info */}
                        <h4 className="text-xl font-black mb-1 text-center">
                            {callState === 'incoming' ? callerName : bookingName}
                        </h4>
                        <p className="text-sm font-bold text-blue-200 mb-8 uppercase tracking-widest">
                            {callState === 'calling' && 'Ringing...'}
                            {callState === 'incoming' && 'Incoming Call...'}
                            {callState === 'connecting' && 'Connecting WebRTC...'}
                            {callState === 'active' && `Call Active • ${formatDuration(callDuration)}`}
                            {callState === 'ended' && 'Call Ended'}
                        </p>

                        {/* Call Action buttons */}
                        <div className="flex gap-6 justify-center items-center">
                            {callState === 'incoming' ? (
                                <>
                                    {/* Decline Button */}
                                    <button 
                                        type="button"
                                        onClick={handleDeclineCall}
                                        className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-xl shadow-lg transition cursor-pointer select-none"
                                        title="Decline Call"
                                    >
                                        ❌
                                    </button>
                                    {/* Accept Button */}
                                    <button 
                                        type="button"
                                        onClick={handleAcceptCall}
                                        className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-xl shadow-lg transition animate-pulse cursor-pointer select-none"
                                        title="Answer Call"
                                    >
                                        📞
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Mute Button (Only when active) */}
                                    {callState === 'active' && (
                                        <button 
                                            type="button"
                                            onClick={handleToggleMute}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-md transition cursor-pointer select-none ${
                                                isMuted ? 'bg-amber-500 hover:bg-amber-600' : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                                        >
                                            {isMuted ? '🎙️❌' : '🎙️'}
                                        </button>
                                    )}
                                    
                                    {/* Hang Up Button (For caller ringing, connecting, active) */}
                                    {callState !== 'ended' && (
                                        <button 
                                            type="button"
                                            onClick={() => handleHangUp(true)}
                                            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-xl shadow-lg transition cursor-pointer select-none"
                                            title="End Call"
                                        >
                                            🛑
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
