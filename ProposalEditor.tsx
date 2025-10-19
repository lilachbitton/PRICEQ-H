import React, { useState, useMemo } from 'react';
import { UnitOfMeasure, WorkItem, PaymentTerm } from './types';
import { HeaderLogo, TrashIcon } from './SharedComponents';
import { encodeData } from './App';

interface WorkItemRowProps {
  item: WorkItem;
  index: number;
  onUpdate: (id: string, field: keyof Omit<WorkItem, 'id'>, value: string | number) => void;
  onRemove: (id: string) => void;
}

const WorkItemRow = React.memo(({ item, index, onUpdate, onRemove }: WorkItemRowProps) => {
    const total = useMemo(() => item.quantity * item.price, [item.quantity, item.price]);

    return (
        <tr className="border-t border-gray-200 md:border-t-0">
            <td data-label="מס'" className="p-2 text-center align-top">{index + 1}</td>
            <td data-label="פירוט העבודה" className="p-2 align-top full-width-input">
                <textarea
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={2}
                    aria-label={`Description for item ${index + 1}`}
                />
            </td>
            <td data-label="יח' מידה" className="p-2 w-full md:w-32 align-top">
                <select
                    value={item.unit}
                    onChange={(e) => onUpdate(item.id, 'unit', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    aria-label={`Unit for item ${index + 1}`}
                >
                    {Object.values(UnitOfMeasure).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
            </td>
            <td data-label="כמות" className="p-2 w-full md:w-32 align-top">
                <input
                    type="number"
                    value={item.quantity === 0 ? '' : item.quantity}
                    placeholder="0"
                    onChange={(e) => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    min="0"
                    aria-label={`Quantity for item ${index + 1}`}
                />
            </td>
            <td data-label="מחיר יח'" className="p-2 w-full md:w-32 align-top">
                <input
                    type="number"
                    value={item.price === 0 ? '' : item.price}
                    placeholder="0"
                    onChange={(e) => onUpdate(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    min="0"
                    aria-label={`Price for item ${index + 1}`}
                />
            </td>
            <td data-label='סה"כ' className="p-2 w-full md:w-32 align-top font-semibold text-left md:text-center">
                {total.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
            </td>
            <td className="p-2 w-full md:w-16 text-center align-top actions-cell">
                <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 transition-colors" aria-label={`Remove item ${index + 1}`}>
                    <TrashIcon className="h-5 w-5"/>
                </button>
            </td>
        </tr>
    );
});


interface PaymentTermRowProps {
  item: PaymentTerm;
  index: number;
  totalProposalAmount: number;
  onUpdate: (id: string, field: keyof Omit<PaymentTerm, 'id'>, value: string | number) => void;
  onRemove: (id: string) => void;
}

const PaymentTermRow = React.memo(({ item, index, totalProposalAmount, onUpdate, onRemove }: PaymentTermRowProps) => {
    const amount = useMemo(() => {
        if (totalProposalAmount === 0 || item.percentage === 0) return 0;
        return (item.percentage / 100) * totalProposalAmount;
    }, [item.percentage, totalProposalAmount]);

    return (
        <tr className="border-t border-gray-200 md:border-t-0">
            <td data-label="מס'" className="p-2 text-center align-top">{index + 1}</td>
            <td data-label="הסכום" className="p-2 w-full md:w-40 align-top font-semibold text-left md:text-center">
                {amount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}
            </td>
            <td data-label="חלק התשלום (%)" className="p-2 w-full md:w-40 align-top">
                 <div className="relative">
                    <input
                        type="number"
                        value={item.percentage}
                        onChange={(e) => onUpdate(item.id, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 pr-6 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                        min="0"
                        max="95"
                        aria-label={`Percentage for payment term ${index + 1}`}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
            </td>
            <td data-label="מועד התשלום" className="p-2 align-top full-width-input">
                <input
                    type="text"
                    value={item.milestone}
                    onChange={(e) => onUpdate(item.id, 'milestone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    aria-label={`Milestone for payment term ${index + 1}`}
                />
            </td>
            <td className="p-2 w-full md:w-16 text-center align-top actions-cell">
                <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 transition-colors" aria-label={`Remove payment term ${index + 1}`}>
                    <TrashIcon className="h-5 w-5"/>
                </button>
            </td>
        </tr>
    );
});

const WEBHOOK_URL = 'https://hook.eu2.make.com/5uadx69swrpxp2wt58i6y2ygls61qo94';
const SHORT_IO_API_KEY = 'sk_ttPvaUqfU5VHropl';
const SHORT_IO_DOMAIN = 'mganim.short.gy';

const ProposalEditor: React.FC = () => {
    // Using native URLSearchParams on the window.location.search for robust initial state population.
    const initialSearchParams = new URLSearchParams(window.location.search);
    
    const [leadId, setLeadId] = useState(initialSearchParams.get('leadId') || '');
    const [customerName, setCustomerName] = useState(() => {
        const firstName = initialSearchParams.get('firstName') || '';
        const lastName = initialSearchParams.get('lastName') || '';
        return [firstName, lastName].filter(Boolean).join(' ').trim();
    });
    const [customerAddress, setCustomerAddress] = useState(initialSearchParams.get('address') || '');
    const [proposalDate, setProposalDate] = useState(new Date().toLocaleDateString('he-IL'));
    const [workItems, setWorkItems] = useState<WorkItem[]>([
        { id: crypto.randomUUID(), description: '', unit: UnitOfMeasure.UNIT, quantity: 1, price: 0 }
    ]);
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([
        { id: crypto.randomUUID(), percentage: 95, milestone: 'עם תחילת העבודה' }
    ]);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);


    const addWorkItem = () => {
        setWorkItems(prev => [...prev, { id: crypto.randomUUID(), description: '', unit: UnitOfMeasure.UNIT, quantity: 1, price: 0 }]);
    };
    
    const updateWorkItem = (id: string, field: keyof Omit<WorkItem, 'id'>, value: string | number) => {
        setWorkItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        setGeneratedLink('');
    };

    const removeWorkItem = (id: string) => {
        if (workItems.length > 1) {
            setWorkItems(prev => prev.filter(item => item.id !== id));
        }
        setGeneratedLink('');
    };
    
    const addPaymentTerm = () => {
        setPaymentTerms(prev => {
            const currentPercentage = prev.reduce((sum, term) => sum + Number(term.percentage), 0);
            // The total should be 100, and 5% is fixed for the end. So we work with 95%.
            const remaining = 95 - currentPercentage;
            
            // Ensure the new percentage isn't negative.
            const newPercentage = Math.max(0, remaining);

            return [...prev, { id: crypto.randomUUID(), percentage: newPercentage, milestone: '' }];
        });
        setGeneratedLink('');
    };
    
    const updatePaymentTerm = (id: string, field: keyof Omit<PaymentTerm, 'id'>, value: string | number) => {
        setPaymentTerms(prev => prev.map(term => term.id === id ? { ...term, [field]: value } : term));
        setGeneratedLink('');
    };

    const removePaymentTerm = (id: string) => {
        if (paymentTerms.length > 1) {
            // FIX: The filter callback parameter is `term`, but `item.id` was being used. Corrected to `term.id`.
            setPaymentTerms(prev => prev.filter(term => term.id !== id));
        }
        setGeneratedLink('');
    };

    const totalProposalAmount = useMemo(() => {
        return workItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }, [workItems]);

    const finalPaymentAmount = useMemo(() => totalProposalAmount * 0.05, [totalProposalAmount]);

    const totalPaymentPercentage = useMemo(() => {
        const userTermsPercentage = paymentTerms.reduce((sum, term) => sum + Number(term.percentage), 0);
        return userTermsPercentage + 5;
    }, [paymentTerms]);
    
    const isPaymentScheduleValid = Math.round(totalPaymentPercentage) === 100;

    const handleGenerateLink = async () => {
        if (!isPaymentScheduleValid || totalProposalAmount <= 0) return;
        setIsGenerating(true);
        setCopySuccess('');

        const proposalBaseData = {
            leadId,
            customerName,
            customerAddress,
            proposalDate,
            workItems,
            paymentTerms,
            totalProposalAmount,
            finalPaymentAmount,
        };
        const encoded = encodeData(proposalBaseData);
        const longLink = `${window.location.origin}${window.location.pathname}#/proposal/${encoded}`;
        
        let finalLink = longLink;

        try {
            const response = await fetch('https://api.short.io/links', {
                method: 'POST',
                headers: {
                    'Authorization': SHORT_IO_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    originalURL: longLink,
                    domain: SHORT_IO_DOMAIN,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                finalLink = data.shortURL;
            } else {
                 console.error("Failed to shorten URL, using long URL.", await response.text());
            }
        } catch (error) {
            console.error("Error shortening URL, using long URL:", error);
        }

        const payload = {
            'שלב': 1,
            'לינק למילוי הלקוח': finalLink,
            'מזהה_לקוח_CRM': leadId,
            'סה"כ ההצעה לפני מע"מ': totalProposalAmount
        };

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Webhook for stage 1 failed:', error);
            // Non-critical error, so we continue the flow
        }

        setGeneratedLink(finalLink);
        setIsGenerating(false);
    };
    
    const copyToClipboard = () => {
        const textArea = document.createElement('textarea');
        textArea.value = generatedLink;

        // Make the textarea invisible to the user
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setCopySuccess('הועתק!');
                setTimeout(() => setCopySuccess(''), 2000);
            } else {
                setCopySuccess('נכשל');
            }
        } catch (err) {
            console.error('Copy to clipboard failed', err);
            setCopySuccess('נכשל');
        }

        document.body.removeChild(textArea);
    };

    return (
        <div className="bg-white shadow-xl rounded-lg p-4 md:p-8 my-10" dir="rtl">
            <HeaderLogo />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-2 border-gray-200 pb-4 gap-4">
                <div className="space-y-2 text-lg w-full">
                    <div className="flex items-center">
                        <label htmlFor="customerName" className="font-bold w-24">לכבוד:</label>
                        <input
                            id="customerName"
                            type="text"
                            placeholder="שם הלקוח"
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); setGeneratedLink(''); }}
                            className="p-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none flex-grow"
                        />
                    </div>
                     <div className="flex items-center">
                        <label htmlFor="customerAddress" className="font-bold w-24">כתובת:</label>
                        <input
                            id="customerAddress"
                            type="text"
                            placeholder="כתובת הלקוח"
                            value={customerAddress}
                            onChange={(e) => { setCustomerAddress(e.target.value); setGeneratedLink(''); }}
                            className="p-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none flex-grow"
                        />
                    </div>
                </div>
                <div className="text-lg w-full md:w-auto shrink-0">
                    <label htmlFor="proposalDate" className="font-bold">תאריך: </label>
                    <input
                        id="proposalDate"
                        type="text"
                        value={proposalDate}
                        onChange={(e) => { setProposalDate(e.target.value); setGeneratedLink(''); }}
                        className="p-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full md:w-32"
                    />
                </div>
            </div>

            <h2 className="text-3xl font-serif text-center text-gray-800 mb-4">הצעה/הזמנה לביצוע עבודה</h2>
            <p className="text-lg mb-6">שלום רב, לבקשתך הריני מציע לבצע עבורך את העבודות הבאות, המחירים אינם כוללים מע"מ:</p>

            {/* Work Items Section */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <button onClick={addWorkItem} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold w-full md:w-auto">הוסף שורה</button>
                    <div className="text-lg md:text-xl font-bold text-gray-800 bg-gray-100 p-3 rounded-md w-full md:w-auto text-center">
                        <span>סה"כ לכל ההצעה לפני מע"מ: </span>
                        <span>{totalProposalAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
                    </div>
                </div>
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-right border-collapse responsive-table" aria-label="Work Items">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 w-12 text-center">מס'</th>
                                <th className="p-3">פירוט העבודה</th>
                                <th className="p-3 w-32">יח' מידה</th>
                                <th className="p-3 w-32">כמות</th>
                                <th className="p-3 w-32">מחיר יח'</th>
                                <th className="p-3 w-32">סה"כ</th>
                                <th className="p-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {workItems.map((item, index) => (
                                <WorkItemRow key={item.id} item={item} index={index} onUpdate={updateWorkItem} onRemove={removeWorkItem} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Terms Section */}
            <div className="mb-10">
                 <h3 className="text-2xl font-serif text-gray-800 mb-4">תנאי תשלום</h3>
                 <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <button onClick={addPaymentTerm} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold w-full md:w-auto">הוסף שלב תשלום</button>
                    <div className={`text-lg md:text-xl font-bold p-3 rounded-md w-full md:w-auto text-center ${isPaymentScheduleValid ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
                       <span>סה"כ תשלומים: </span>
                       <span>{totalPaymentPercentage.toFixed(2)}%</span>
                    </div>
                </div>
                {totalPaymentPercentage > 100 && (
                    <div role="alert" className="mt-4 p-3 text-center bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md">
                        <strong>שימו לב:</strong> סך כל אחוזי התשלום עובר את 100%. יש לתקן את הסכומים.
                    </div>
                )}
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-right border-collapse responsive-table" aria-label="Payment Terms">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 w-12 text-center">מס'</th>
                                <th className="p-3 w-40 text-center">הסכום</th>
                                <th className="p-3 w-40 text-center">חלק התשלום (%)</th>
                                <th className="p-3">מועד התשלום</th>
                                <th className="p-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentTerms.map((term, index) => (
                                <PaymentTermRow key={term.id} item={term} index={index} totalProposalAmount={totalProposalAmount} onUpdate={updatePaymentTerm} onRemove={removePaymentTerm} />
                            ))}
                             <tr className="border-t border-gray-200 bg-gray-50 md:border-t-0">
                                <td data-label="מס'" className="p-3 text-center">{paymentTerms.length + 1}</td>
                                <td data-label="הסכום" className="p-3 font-semibold text-left md:text-center">{finalPaymentAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
                                <td data-label="חלק התשלום (%)" className="p-3 font-semibold text-left md:text-center">5%</td>
                                <td data-label="מועד התשלום" className="p-3 font-semibold">בסיום העבודה</td>
                                <td className="actions-cell"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={handleGenerateLink}
                    disabled={!isPaymentScheduleValid || totalProposalAmount <= 0 || !!generatedLink || isGenerating}
                    className="bg-green-600 text-white px-6 md:px-10 py-3 rounded-lg text-lg md:text-xl font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto"
                >
                    {isGenerating ? 'יוצר קישור...' : (isPaymentScheduleValid ? 'צור קישור לשליחה ללקוח' : 'יש להתאים את התשלומים ל-100%')}
                </button>
            </div>
             {generatedLink && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center page-break-avoid border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800">קישור להצעת מחיר מוכן לשליחה</h3>
                    <p className="text-sm text-gray-600 mb-3">שלח קישור זה ללקוח למילוי פרטים וחתימה. כל שינוי בטפסים יצריך יצירת קישור חדש.</p>
                    <div className="flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto">
                        <input 
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                            aria-label="Generated proposal link"
                            onFocus={(e) => e.target.select()}
                        />
                        <button 
                            onClick={copyToClipboard} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shrink-0 w-full md:w-24 mt-2 md:mt-0"
                        >
                            {copySuccess || 'העתק'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProposalEditor;