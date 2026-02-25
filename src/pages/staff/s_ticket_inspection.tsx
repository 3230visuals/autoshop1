import React from 'react';
import { useParams } from 'react-router-dom';

const StaffInspection: React.FC = () => {
    const { ticketId } = useParams();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Inspection - Ticket #{ticketId}</h1>
            <p className="text-slate-400">Inspection Form Placeholder</p>
        </div>
    );
};

export default StaffInspection;
