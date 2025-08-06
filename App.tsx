import React, { useState, useMemo } from 'react';
import { UnitOfMeasure, WorkItem, PaymentTerm, ClientDetails } from './types';
import ProposalEditor from './ProposalEditor';
import ProposalPreview from './ProposalPreview';
import FinalProposalView from './FinalProposalView';

export default function App() {
    const [step, setStep] = useState(1);

    // Proposal Data State
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [proposalDate, setProposalDate] = useState(new Date().toLocaleDateString('he-IL'));
    const [workItems, setWorkItems] = useState<WorkItem[]>([
        { id: crypto.randomUUID(), description: '', unit: UnitOfMeasure.UNIT, quantity: 1, price: 0 }
    ]);
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([
        { id: crypto.randomUUID(), percentage: 0, milestone: 'עם תחילת העבודה' }
    ]);
    const [clientDetails, setClientDetails] = useState<ClientDetails>({
        firstName: '',
        lastName: '',
        idNumber: '',
    });
    const [clientSignature, setClientSignature] = useState('');


    // Work Item Handlers
    const addWorkItem = () => {
        setWorkItems(prev => [...prev, { id: crypto.randomUUID(), description: '', unit: UnitOfMeasure.UNIT, quantity: 1, price: 0 }]);
    };
    
    const updateWorkItem = (id: string, field: keyof Omit<WorkItem, 'id'>, value: string | number) => {
        setWorkItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeWorkItem = (id: string) => {
        if (workItems.length > 1) {
            setWorkItems(prev => prev.filter(item => item.id !== id));
        }
    };
    
    // Payment Term Handlers
    const addPaymentTerm = () => {
        setPaymentTerms(prev => [...prev, { id: crypto.randomUUID(), percentage: 0, milestone: '' }]);
    };
    
    const updatePaymentTerm = (id: string, field: keyof Omit<PaymentTerm, 'id'>, value: string | number) => {
        setPaymentTerms(prev => prev.map(term => term.id === id ? { ...term, [field]: value } : term));
    };

    const removePaymentTerm = (id: string) => {
        if (paymentTerms.length > 1) {
            setPaymentTerms(prev => prev.filter(term => term.id !== id));
        }
    };

    // Client Details Handler
    const updateClientDetails = (field: keyof ClientDetails, value: string) => {
        setClientDetails(prev => ({...prev, [field]: value}));
    };

    // Memoized Calculations
    const totalProposalAmount = useMemo(() => {
        return workItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }, [workItems]);

    const finalPaymentAmount = useMemo(() => totalProposalAmount * 0.05, [totalProposalAmount]);

    const totalPaymentPercentage = useMemo(() => {
        const userTermsPercentage = paymentTerms.reduce((sum, term) => sum + Number(term.percentage), 0);
        return userTermsPercentage + 5;
    }, [paymentTerms]);
    
    const isPaymentScheduleValid = Math.round(totalPaymentPercentage) === 100;

    const proposalData = {
        customerName,
        customerAddress,
        proposalDate,
        workItems,
        totalProposalAmount,
        paymentTerms,
        finalPaymentAmount,
        clientDetails,
        clientSignature
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-full">
            {step === 1 && (
                <ProposalEditor
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerAddress={customerAddress}
                    setCustomerAddress={setCustomerAddress}
                    proposalDate={proposalDate}
                    setProposalDate={setProposalDate}
                    workItems={workItems}
                    addWorkItem={addWorkItem}
                    updateWorkItem={updateWorkItem}
                    removeWorkItem={removeWorkItem}
                    totalProposalAmount={totalProposalAmount}
                    paymentTerms={paymentTerms}
                    addPaymentTerm={addPaymentTerm}
                    updatePaymentTerm={updatePaymentTerm}
                    removePaymentTerm={removePaymentTerm}
                    finalPaymentAmount={finalPaymentAmount}
                    totalPaymentPercentage={totalPaymentPercentage}
                    isPaymentScheduleValid={isPaymentScheduleValid}
                    onContinue={() => setStep(2)}
                />
            )}
            {step === 2 && (
                <ProposalPreview
                    {...proposalData}
                    onClientDetailsChange={updateClientDetails}
                    clientSignature={clientSignature}
                    onClientSignatureChange={setClientSignature}
                    onBack={() => setStep(1)}
                    onConfirm={() => setStep(3)}
                />
            )}
            {step === 3 && (
                 <FinalProposalView
                    {...proposalData}
                    onBackToPreview={() => setStep(2)}
                />
            )}
        </div>
    );
}