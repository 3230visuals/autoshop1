import React from 'react';
import { useParams } from 'react-router-dom';

const StaffEstimate: React.FC = () => {
    const { ticketId } = useParams();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Estimate - Ticket #{ticketId}</h1>
            <p className="text-slate-400">Estimate Tool Placeholder</p>
        </div>
    );
};

export default StaffEstimate;
