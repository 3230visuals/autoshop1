import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessCard from '../../components/SuccessCard';

const S_Success: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-page-dark-01 min-h-screen">
            <SuccessCard
                title="Action Saved"
                description="The update has been synchronized successfully with the shop records."
                actionLabel="Back to Board"
                onAction={() => navigate('/s/board')}
                variant="staff"
            />
        </div>
    );
};

export default S_Success;
