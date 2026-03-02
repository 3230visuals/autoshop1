import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/useJobs';

const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { forceClientLogin } = useAuth();
    const { showToast, addJob } = useJobs();

    const clientName = searchParams.get('name');
    const clientIdParam = searchParams.get('clientId');
    const [fallbackClientId] = React.useState(() => `CLT-${Math.floor(Math.random() * 1000000)}`);
    const clientId = clientIdParam ?? fallbackClientId;

    const shopId = searchParams.get('shopId') ?? 'SHOP-01';
    const shopName = searchParams.get('shopName') ?? 'Service Bay Software';
    const vehicle = searchParams.get('vehicle');
    const existingTicketId = searchParams.get('ticketId');

    const handleViewStatus = useCallback(async () => {
        if (!clientId) return;

        let targetTicketId = existingTicketId;

        // If no ticketId was in the QR code, generate one ONLY for local testing.
        // In a real app, the backend would link the client to their active ticket.
        if (!targetTicketId) {
            targetTicketId = `TCK-${Math.floor(Math.random() * 9000) + 1000}`;
            // Use addJob to ensure it's in the JobContext state
            await addJob({
                id: targetTicketId,
                shopId: shopId ?? 'SHOP-01',
                client: clientName ?? 'Guest',
                clientId: clientId,
                vehicle: vehicle ?? 'Vehicle',
                status: 'Checked In',
                priority: 'medium',
                bay: 'Bay 1',
                progress: 0,
                stageIndex: 0,
                services: [],
                financials: { subtotal: 0, tax: 0, total: 0 },
                notes: 'Opened via invite link',
                service: 'Initial Inspection',
            } as unknown as Parameters<typeof addJob>[0]);
        }

        // 2. Log in the client so guards pass
        forceClientLogin({
            clientId,
            name: clientName ?? 'Guest',
            shopId: shopId ?? 'SHOP-01',
            shopName: shopName ?? 'Service Bay',
            phone: undefined
        });

        // 3. Navigate
        void navigate(`/c/ticket/${targetTicketId}`);
    }, [clientId, existingTicketId, shopId, clientName, vehicle, shopName, forceClientLogin, navigate, addJob]);

    const handleBookAppointment = () => {
        try {
            // Force login first
            forceClientLogin({
                clientId,
                name: clientName ?? 'Valued Customer',
                shopId,
                shopName,
            });

            // Navigate to scheduling
            void navigate('/client/schedule');
        } catch (err) {
            console.error('Failed to navigate to scheduling:', err);
            showToast('Unable to open scheduler. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
            >
                <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🛠️</span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome to {shopName}
                </h1>

                <p className="text-slate-400 mb-8">
                    {clientName ? `Hi ${clientName}, we're` : "We're"} ready to take care of your {vehicle ?? 'vehicle'}.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => { void handleViewStatus(); }}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        View Vehicle Status
                    </button>

                    <button
                        onClick={() => { void handleBookAppointment(); }}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl transition-all"
                    >
                        Book Appointment
                    </button>
                </div>

                <p className="mt-8 text-sm text-slate-500">
                    Trusted by local drivers since 2024
                </p>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
