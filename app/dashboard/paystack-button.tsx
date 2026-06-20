"use client";

import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import toast from 'react-hot-toast';

interface PaystackPaymentButtonProps {
    booking: any;
    user: any;
    onSuccess: (bookingId: string, reference: string) => void;
    onClose?: () => void;
    autoTrigger?: boolean;
}

export default function PaystackPaymentButton({ booking, user, onSuccess, onClose, autoTrigger }: PaystackPaymentButtonProps) {
    const rawAmount = typeof booking.totalPrice === 'string'
        ? parseInt(booking.totalPrice.replace(/[^0-9]/g, ''))
        : booking.totalPrice;

    const config = {
        reference: `arg_${booking._id}_${Date.now()}`,
        email: user?.email || booking.clientEmail || 'client@airgo.ng',
        amount: rawAmount * 100, // Paystack expects amount in Kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_bf666485cc4f378e80bee5df06b1dff2fc327c04',
        metadata: {
            bookingId: booking._id,
            itemName: booking.itemName,
            custom_fields: []
        }
    };

    const initializePayment = usePaystackPayment(config);

    React.useEffect(() => {
        if (autoTrigger) {
            initializePayment({
                onSuccess: (ref: any) => {
                    onSuccess(booking._id, ref.reference);
                },
                onClose: () => {
                    toast.error("Payment window closed.");
                    if (onClose) onClose();
                }
            });
        }
    }, [autoTrigger, booking._id, initializePayment, onSuccess, onClose]);

    if (autoTrigger) {
        return null;
    }

    return (
        <button
            onClick={() => {
                initializePayment({
                    onSuccess: (ref: any) => {
                        onSuccess(booking._id, ref.reference);
                    },
                    onClose: () => {
                        toast.error("Payment window closed.");
                        if (onClose) onClose();
                    }
                });
            }}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md transition-colors"
        >
            💳 Pay Escrow (₦{rawAmount.toLocaleString()})
        </button>
    );
}
