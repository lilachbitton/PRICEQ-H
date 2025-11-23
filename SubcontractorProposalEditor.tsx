import React, { useState, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
// FIX: Import SubcontractorProposalData to correctly type the initial data from the URL.
import { UnitOfMeasure, WorkItem, PaymentTerm, SubcontractorDetails, MaterialClause, SubcontractorProposalData } from './types';
import { HeaderLogo, TrashIcon } from './SharedComponents';
import { encodeData, decodeData } from './App';

// Re-usable components copied from ProposalEditor to maintain separation
const WorkItemRow = React.memo(({ item, index, onUpdate, onRemove }: { item: WorkItem; index: number; onUpdate: (id: string, field: keyof Omit<WorkItem, 'id'>, value: any) => void; onRemove: (id: string) => void; }) => {
    const total = useMemo(() => item.quantity * item.price, [item.quantity, item.price]);
    return (
        <tr className="border-t border-gray-200 md:border-t-0">
            <td data-label="מס'" className="p-2 text-center align-top">{index + 1}</td>
            <td data-label="תיאור העבודה" className="p-2 align-top"><textarea value={item.description} onChange={(e) => onUpdate(item.id, 'description', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" rows={2} /></td>
            <td data-label="יח' מידה" className="p-2 md:w-32 align-top"><select value={item.unit} onChange={(e) => onUpdate(item.id, 'unit', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">{Object.values(UnitOfMeasure).map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></td>
            <td data-label="כמות" className="p-2 md:w-32 align-top"><input type="number" value={item.quantity} onChange={(e) => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" min="0" /></td>
            <td data-label="מחיר" className="p-2 md:w-32 align-top"><input type="number" value={item.price} onChange={(e) => onUpdate(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" min="0" /></td>
            <td data-label='סה"כ' className="p-2 md:w-32 align-top font-semibold text-center">{total.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
            <td className="p-2 md:w-16 text-center align-top actions-cell"><button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button></td>
        </tr>
    );
});

const PaymentTermRow = React.memo(({ item, index, totalAmount, onUpdate, onRemove }: { item: PaymentTerm; index: number; totalAmount: number; onUpdate: (id: string, field: keyof Omit<PaymentTerm, 'id'>, value: any) => void; onRemove: (id: string) => void; }) => {
    const amount = useMemo(() => (item.percentage / 100) * totalAmount, [item.percentage, totalAmount]);
    return (
        <tr className="border-t border-gray-200 md:border-t-0">
            <td data-label="מס'" className="p-2 text-center align-top">{index + 1}</td>
            <td data-label="מועד התשלום" className="p-2 align-top"><input type="text" value={item.milestone} onChange={(e) => onUpdate(item.id, 'milestone', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></td>
            <td data-label="אחוז" className="p-2 md:w-40 align-top"><div className="relative"><input type="number" value={item.percentage} onChange={(e) => onUpdate(item.id, 'percentage', parseFloat(e.target.value) || 0)} className="w-full p-2 pr-6 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" min="0" max="100"/><span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span></div></td>
            <td data-label="סכום" className="p-2 md:w-40 align-top font-semibold text-center">{amount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
            <td className="p-2 md:w-16 text-center align-top actions-cell"><button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button></td>
        </tr>
    );
});

const SUBCONTRACTOR_WEBHOOK_URL = 'https://hook.eu2.make.com/5uadx69swrpxp2wt58i6y2ygls61qo94';
const SHORT_IO_API_KEY = 'sk_ttPvaUqfU5VHropl';
const SHORT_IO_DOMAIN = 'mganim.short.gy';
const CORS_PROXY_URL = 'https://corsproxy.io/?';
const SHORT_IO_API_URL = 'https://api.short.io/links';


const SubcontractorProposalEditor: React.FC = () => {
    const { data: encodedData } = useParams();
    const location = useLocation();
    // FIX: Provide a type to decodeData to ensure initialData is correctly typed.
    const [initialData] = useState(() => decodeData<SubcontractorProposalData>(encodedData));
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    
    const [proposalDate, setProposalDate] = useState(initialData?.proposalDate || new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    const [workTitle, setWorkTitle] = useState(initialData?.workTitle || params.get('workTitle') || '');
    const [projectAddress, setProjectAddress] = useState(initialData?.projectAddress || params.get('projectAddress') || '');
    const [clientName, setClientName] = useState(() => {
        if (initialData) return initialData.clientName;
        const firstName = params.get('firstName') || '';
        const lastName = params.get('lastName') || '';
        return [firstName, lastName].filter(Boolean).join(' ').trim();
    });
    const [subcontractor, setSubcontractor] = useState<SubcontractorDetails>(initialData?.subcontractor || {
        name: params.get('subName') || '',
        idNumber: params.get('subId') || '',
        address: params.get('subAddress') || '',
        managerName: params.get('subManager') || '',
    });
    // Ensure subcontractorId and projectId are captured from URL or initialData
    const [subcontractorId, setSubcontractorId] = useState(initialData?.subcontractorId || params.get('subcontractorId') || '');
    const [projectId, setProjectId] = useState(initialData?.projectId || params.get('projectId') || '');

    const [workStartDate, setWorkStartDate] = useState(initialData?.workStartDate || '');
    const [materials, setMaterials] = useState<MaterialClause>(initialData?.materials || { included: false, provider: 'main_contractor' });
    const [workItems, setWorkItems] = useState<WorkItem[]>(initialData?.workItems || [{ id: crypto.randomUUID(), description: '', unit: UnitOfMeasure.UNIT, quantity: 1, price: 0 }]);
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(initialData?.paymentTerms || [{ id: crypto.randomUUID(), percentage: 100, milestone: 'בסיום כל העבודה ומסירת שטח נקי ללקוח' }]);
    const [notes, setNotes] = useState(initialData?.notes || '');
    
    const [generatedLink, setGeneratedLink] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');


    const handleSubcontractorChange = (field: keyof SubcontractorDetails, value: string) => {
        setSubcontractor(prev => ({ ...prev, [field]: value }));
        setGeneratedLink('');
    };

    const addWorkItem = () => setWorkItems(prev => [...prev, { id: crypto.randomUUID(), description: '', unit: UnitOfMeasure.UNIT, quantity: 1, price: 0 }]);
    const updateWorkItem = (id: string, field: keyof Omit<WorkItem, 'id'>, value: any) => {
        setWorkItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        setGeneratedLink('');
    };
    const removeWorkItem = (id: string) => {
        if (workItems.length > 1) setWorkItems(prev => prev.filter(item => item.id !== id));
        setGeneratedLink('');
    };

    const addPaymentTerm = () => {
        setPaymentTerms(prev => {
            const newTerm = { id: crypto.randomUUID(), percentage: 0, milestone: '' };
            if (prev.length === 0) {
                return [newTerm];
            }
            const allButLast = prev.slice(0, -1);
            const lastTerm = prev[prev.length - 1];
            return [...allButLast, newTerm, lastTerm];
        });
        setGeneratedLink('');
    };
    const updatePaymentTerm = (id: string, field: keyof Omit<PaymentTerm, 'id'>, value: any) => {
        setPaymentTerms(prev => prev.map(term => term.id === id ? { ...term, [field]: value } : term));
        setGeneratedLink('');
    };
    const removePaymentTerm = (id: string) => {
        if (paymentTerms.length > 1) setPaymentTerms(prev => prev.filter(item => item.id !== id));
        setGeneratedLink('');
    };

    const totalAmount = useMemo(() => workItems.reduce((sum, item) => sum + (item.quantity * item.price), 0), [workItems]);
    const totalPaymentPercentage = useMemo(() => paymentTerms.reduce((sum, term) => sum + Number(term.percentage), 0), [paymentTerms]);
    const isPaymentScheduleValid = Math.round(totalPaymentPercentage) === 100;

    const handleGenerateLink = async () => {
        if (!isPaymentScheduleValid || totalAmount <= 0) return;
        setIsGenerating(true);
        setCopySuccess('');

        const currentData = { 
            proposalDate, 
            workTitle, 
            projectAddress, 
            clientName, 
            subcontractor, 
            workStartDate, 
            materials, 
            workItems, 
            paymentTerms, 
            totalAmount,
            subcontractorId,
            projectId,
            notes,
        };
        
        let documentIdToUse: string;
        if (initialData?.documentId) {
            documentIdToUse = initialData.documentId;
        } else {
            const tempEncoded = encodeData(currentData);
            documentIdToUse = tempEncoded.substring(0, 10);
        }

        const finalData: Omit<SubcontractorProposalData, 'documentId'> & { documentId: string } = {
            ...currentData,
            documentId: documentIdToUse,
        };

        const encoded = encodeData(finalData);
        const longLink = `${window.location.origin}${window.location.pathname}#/subcontractor/preview/${encoded}`;
        const editLink = `${window.location.origin}${window.location.pathname}#/subcontractor/edit/${encoded}`;
        
        let finalLink = longLink;

        try {
            const response = await fetch(`${CORS_PROXY_URL}${SHORT_IO_API_URL}`, {
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
            'שלב': 'יצירת הסכם קבלן משנה',
            'ID_מסמך': documentIdToUse,
            'לינק לחתימת קבלן משנה': finalLink,
            'לינק לעריכת המסמך': editLink,
            'מזהה_קבלן_CRM': subcontractorId,
            'מזהה_פרויקט_CRM': projectId, // Project ID included in webhook
            'סה"כ ההסכם לפני מע"מ': totalAmount
        };
        
        try {
            await fetch(SUBCONTRACTOR_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Subcontractor Webhook (Stage 1) failed:', error);
            // Non-critical error, so we continue the flow
        }

        setGeneratedLink(finalLink);
        setIsGenerating(false);
    };

    const copyToClipboard = () => {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = generatedLink;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopySuccess('הועתק!');
                setTimeout(() => setCopySuccess(''), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
                setCopySuccess('נכשל');
            }
            return;
        }
        navigator.clipboard.writeText(generatedLink).then(() => {
            setCopySuccess('הועתק!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('נכשל');
            console.error('Async copy failed', err);
        });
    };

    return (
        <div className="bg-white shadow-xl rounded-lg p-4 md:p-8 my-10" dir="rtl">
            <input type="hidden" name="subcontractorId" value={subcontractorId} />
            <input type="hidden" name="projectId" value={projectId} />
             <div className="text-left mb-4">
                <Link to="/" className="text-sm text-blue-600 hover:underline font-semibold">
                    &larr; עבור ליצירת הצעת מחיר ללקוח
                </Link>
            </div>
            <HeaderLogo />
            <h1 className="text-3xl font-serif text-center text-gray-800 mb-6">הזמנת עבודה והסכם לביצוע עבודות</h1>

            {/* Header Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div><label className="font-bold">תאריך:</label><input type="text" value={proposalDate} onChange={e => setProposalDate(e.target.value)} className="w-full p-1 border-b" /></div>
                <div><label className="font-bold">בכתובת (פרויקט):</label><input type="text" value={projectAddress} onChange={e => {setProjectAddress(e.target.value); setGeneratedLink('');}} className="w-full p-1 border-b" placeholder="הכתובת בה תתבצע העבודה"/></div>
            </div>

            {/* Parties */}
            <div className="mb-6 p-4 border rounded-md">
                <h2 className="font-bold text-lg mb-2">פרטי קבלן משנה</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label>שם:</label><input value={subcontractor.name} onChange={e => handleSubcontractorChange('name', e.target.value)} className="w-full p-1 border-b"/></div>
                    <div><label>ח.פ./ע.מ:</label><input value={subcontractor.idNumber} onChange={e => handleSubcontractorChange('idNumber', e.target.value)} className="w-full p-1 border-b"/></div>
                    <div><label>כתובת:</label><input value={subcontractor.address} onChange={e => handleSubcontractorChange('address', e.target.value)} className="w-full p-1 border-b"/></div>
                    <div><label>שם המנהל:</label><input value={subcontractor.managerName} onChange={e => handleSubcontractorChange('managerName', e.target.value)} className="w-full p-1 border-b"/></div>
                </div>
            </div>
             <div className="mb-6 p-4 border rounded-md">
                <h2 className="font-bold text-lg mb-2">פרטי הפרויקט</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label>נושא העבודות:</label><input value={workTitle} onChange={e => {setWorkTitle(e.target.value); setGeneratedLink('')}} className="w-full p-1 border-b" placeholder="לדוגמה: עבודות גינון ופיתוח"/></div>
                    <div><label>שם הלקוח בבית הלקוח:</label><input value={clientName} onChange={e => {setClientName(e.target.value); setGeneratedLink('')}} className="w-full p-1 border-b"/></div>
                </div>
            </div>
            
            {/* Work Details */}
            <div className="mb-6 p-4 border rounded-md grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="font-bold block mb-2">תאריך התחלת עבודה:</label>
                    <input type="date" value={workStartDate} onChange={e => setWorkStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="font-bold block mb-2">אספקת חומרים:</label>
                    <div className="space-y-2">
                        <div>
                            <label><input type="radio" name="included" checked={!materials.included} onChange={() => setMaterials(p => ({...p, included: false}))} className="ml-2"/>אינם כלולים</label>
                            <label className="mr-4"><input type="radio" name="included" checked={materials.included} onChange={() => setMaterials(p => ({...p, included: true}))} className="ml-2"/>כלולים במחיר</label>
                        </div>
                        <div>
                            <label><input type="radio" name="provider" checked={materials.provider === 'main_contractor'} onChange={() => setMaterials(p => ({...p, provider: 'main_contractor'}))} className="ml-2"/>יסופקו ע"י הקבלן הראשי</label>
                            <label className="mr-4"><input type="radio" name="provider" checked={materials.provider === 'sub_contractor'} onChange={() => setMaterials(p => ({...p, provider: 'sub_contractor'}))} className="ml-2"/>יסופקו ע"י קבלן המשנה</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Items Table */}
            <div className="mb-10">
                <table className="w-full text-right border-collapse responsive-table">
                    <thead className="bg-gray-100"><tr><th className="p-3 w-12">מס'</th><th className="p-3">תיאור העבודה</th><th className="p-3 md:w-32">יח' מידה</th><th className="p-3 md:w-32">כמות</th><th className="p-3 md:w-32">מחיר</th><th className="p-3 md:w-32">סה"כ</th><th className="p-3 md:w-16"></th></tr></thead>
                    {/* FIX: Corrected typo from `removeItem` to `removeWorkItem`. */}
                    <tbody>{workItems.map((item, index) => <WorkItemRow key={item.id} item={item} index={index} onUpdate={updateWorkItem} onRemove={removeWorkItem} />)}</tbody>
                </table>
                <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={addWorkItem} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto">הוסף שורה</button>
                    <div className="text-xl font-bold bg-gray-100 p-3 rounded-md text-center w-full md:w-auto">סה"כ לעבודה זו: {totalAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</div>
                </div>
            </div>

            {/* Payment Terms Table */}
            <div className="mb-10">
                <h3 className="text-2xl font-serif mb-4">תשלומים לפרויקט</h3>
                <table className="w-full text-right border-collapse responsive-table">
                    <thead className="bg-gray-100"><tr><th className="p-3 w-12">מס'</th><th className="p-3">מועד התשלום</th><th className="p-3 md:w-40">אחוז</th><th className="p-3 md:w-40">סכום</th><th className="p-3 md:w-16"></th></tr></thead>
                    <tbody>{paymentTerms.map((term, index) => <PaymentTermRow key={term.id} item={term} index={index} totalAmount={totalAmount} onUpdate={updatePaymentTerm} onRemove={removePaymentTerm} />)}</tbody>
                </table>
                <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={addPaymentTerm} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto">הוסף שלב</button>
                    <div className={`text-xl font-bold p-3 rounded-md ${isPaymentScheduleValid ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'} w-full md:w-auto text-center`}>סה"כ: {totalPaymentPercentage.toFixed(2)}%</div>
                </div>
            </div>

            <div className="mb-10">
                <h3 className="text-2xl font-serif mb-4">הערות להסכם</h3>
                <textarea
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); setGeneratedLink(''); }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={4}
                    placeholder="הזן הערות נוספות להסכם..."
                />
            </div>

            <div className="mt-12 text-center">
                <button 
                    onClick={handleGenerateLink} 
                    disabled={!isPaymentScheduleValid || totalAmount <= 0 || !!generatedLink || isGenerating} 
                    className="bg-green-600 text-white px-6 md:px-10 py-3 rounded-lg text-lg md:text-xl font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full md:w-auto"
                >
                    {isGenerating ? 'יוצר קישור...' : (isPaymentScheduleValid ? 'צור קישור להסכם' : 'יש להתאים את התשלומים ל-100%')}
                </button>
            </div>
            {generatedLink && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center border border-green-200">
                     <h3 className="text-lg font-semibold">קישור להסכם מוכן לשליחה</h3>
                    <div className="flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto">
                        <input 
                            type="text" 
                            readOnly value={generatedLink} 
                            className="w-full p-2 border rounded-md bg-gray-100" 
                            onFocus={(e) => e.target.select()}
                        />
                        <button 
                            onClick={copyToClipboard} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full md:w-24 mt-2 md:mt-0 shrink-0"
                        >
                            {copySuccess || 'העתק'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubcontractorProposalEditor;