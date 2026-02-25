import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessCard from '../../components/SuccessCard';

const C_Success: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-page-dark-01 min-h-screen">
            <SuccessCard
                title="Operation Complete"
                description="Security scan clear. Your request has been logged successfully and synchronized with the shop ledger."
                actionLabel="Return to Dashboard"
                onAction={() => navigate('/c/home')}
                variant="client"
            />
        </div>
    );
};

export default C_Success;
