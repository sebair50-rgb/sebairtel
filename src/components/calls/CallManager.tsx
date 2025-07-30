
"use client";

import React from 'react';
import { useAppContext } from '@/store/AppContext';
import CallView from './CallView';
import { AnimatePresence } from 'framer-motion';

const CallManager = () => {
    const { callState, answerCall, endCall } = useAppContext();

    const isActive = callState.status !== 'idle';
    
    return (
       <AnimatePresence>
         {isActive && callState.user && (
            <CallView 
                status={callState.status}
                user={callState.user}
                type={callState.type || 'audio'}
                onAnswer={answerCall}
                onEnd={endCall}
            />
         )}
       </AnimatePresence>
    );
};

export default CallManager;
