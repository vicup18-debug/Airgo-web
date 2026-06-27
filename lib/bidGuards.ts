const ONGOING_TRIP_STATUSES = ['Trip Started', 'Trip End Pending', 'Trip Start Pending'];

const AWAITING_TRIP_STATUSES = [
    'Paid',
    'Paid - Escrow Secured',
    'Approved for Disbursement',
    'Confirmed',
    'Accepted'
];

const NEGOTIATION_STATUSES = ['Pending Partner', 'Pending Client'];

export function getDriverBidLockReason(
    bookings: any[],
    availableRequests: any[] = [],
    driverId: string,
    excludeRideRequestId?: string
) {
    const carBookings = bookings.filter((b) => b.itemType === 'car');

    if (carBookings.some((b) => ONGOING_TRIP_STATUSES.includes(b.status))) {
        return 'You have an ongoing trip in progress. Complete it before bidding on new rides.';
    }

    if (carBookings.some((b) => b.isOffer && NEGOTIATION_STATUSES.includes(b.offerStatus))) {
        return 'You have an active price negotiation. Resolve it first before bidding on new rides.';
    }

    if (carBookings.some((b) => AWAITING_TRIP_STATUSES.includes(b.status))) {
        return 'You have an active trip awaiting completion. Finish it before accepting new dispatches.';
    }

    const hasBidElsewhere = availableRequests.some((req) => {
        if (excludeRideRequestId && req._id === excludeRideRequestId) return false;
        return req.driverOffers?.some((offer: any) => offer.driverId === driverId);
    });
    if (hasBidElsewhere) {
        return 'You already have an active bid on another ride. Resolve it before bidding on new rides.';
    }

    return null;
}

export function getClientBidLockReason(
    bookings: any[],
    rideRequests: any[] = [],
    excludeRideRequestId?: string
) {
    const carBookings = bookings.filter((b) => b.itemType === 'car');

    if (carBookings.some((b) => ONGOING_TRIP_STATUSES.includes(b.status))) {
        return 'You have an ongoing trip. Complete it before requesting another ride.';
    }

    const pendingRequests = rideRequests.filter((req) => {
        if (excludeRideRequestId && req._id === excludeRideRequestId) return false;
        return req.status === 'pending';
    });
    if (pendingRequests.length > 0) {
        return 'You already have an active ride request. Cancel or complete it before starting a new one.';
    }

    if (carBookings.some((b) => b.isOffer && NEGOTIATION_STATUSES.includes(b.offerStatus))) {
        return 'You have an active price negotiation. Resolve it before starting a new ride request.';
    }

    if (carBookings.some((b) => [...AWAITING_TRIP_STATUSES, 'Pending Escrow'].includes(b.status))) {
        return 'You have an active trip in progress. Complete or cancel it before starting a new ride request.';
    }

    return null;
}
