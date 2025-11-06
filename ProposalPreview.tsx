import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// FIX: Import ProposalData from types.ts for consistency and remove local definition.
import { WorkItem, PaymentTerm, ClientDetails, ProposalData } from './types';
import { Watermark } from './SharedComponents';
import TermsAndConditions from './TermsAndConditions';
import SignaturePad from './SignaturePad';
import { decodeData, encodeData } from './App';

const Footer: React.FC = () => (
    <div className="text-center text-xs text-gray-700 border-t-2 border-green-700 pt-3 mt-16">
        <img src="/footer.png" alt="Hagay Tadmor contact details" className="w-full" />
    </div>
);

const WEBHOOK_URL = 'https://hook.eu2.make.com/5uadx69swrpxp2wt58i6y2ygls61qo94';

const ProposalPreview: React.FC = () => {
    const { data: encodedData } = useParams<{ data: string }>();
    const navigate = useNavigate();

    const proposalData = useMemo(() => decodeData<ProposalData>(encodedData), [encodedData]);

    const [clientDetails, setClientDetails] = useState<ClientDetails>({
        firstName: '',
        lastName: '',
        idNumber: '',
    });
    const [clientSignature, setClientSignature] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onClientDetailsChange = (field: keyof ClientDetails, value: string) => {
        setClientDetails(prev => ({...prev, [field]: value}));
    };

    const handleConfirm = async () => {
        if (!proposalData || !isClientDataValid) return;
        setIsSubmitting(true);

        const finalData = {
            ...proposalData,
            clientDetails,
            clientSignature,
        };
        const encodedFinalData = encodeData(finalData);
        const finalLink = `${window.location.origin}${window.location.pathname}#/final/${encodedFinalData}`;
        
        const payload = {
            'שלב': 2,
            'ID_מסמך': proposalData.documentId,
            'לינק למסמך חתום': finalLink,
            'מזהה_לקוח_CRM': proposalData.leadId,
            'סוג לקוח': proposalData.customerType,
        };

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Webhook for stage 2 failed:', error);
             // Non-critical error, so we continue the flow
        }

        navigate(`/final/${encodedFinalData}`);
    };

    if (!proposalData) {
        return (
            <div className="text-center p-10 bg-white shadow-lg rounded-md">
                <h2 className="text-2xl font-bold text-red-600">שגיאה</h2>
                <p className="mt-4">הנתונים של הצעת המחיר אינם תקינים או שהקישור פגום.</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                    חזור לעמוד הראשי
                </button>
            </div>
        );
    }
    
    const {
        customerName,
        customerAddress,
        proposalDate,
        workItems,
        totalProposalAmount,
        paymentTerms,
        finalPaymentAmount,
    } = proposalData;
    
    const totalWithVat = useMemo(() => totalProposalAmount * 1.18, [totalProposalAmount]);
    const isClientDataValid = clientDetails.firstName && clientDetails.lastName && clientDetails.idNumber && clientSignature;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl my-10 relative print:shadow-none print:my-0" dir="rtl">
                <Watermark />
                <img src="/header.png" alt="Hagay Tadmor Landscape Artist" className="w-full print-exact" />
                <div className="p-4 sm:p-8 md:p-12 relative z-10">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-2 border-gray-200 pb-4 mt-8 gap-4">
                        <div className="space-y-2 text-lg">
                            <p><span className="font-bold">לכבוד:</span> {customerName || '________________'}</p>
                            <p><span className="font-bold">כתובת:</span> {customerAddress || '________________'}</p>
                        </div>
                        <div className="text-lg">
                            <p><span className="font-bold">תאריך:</span> {proposalDate}</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-serif text-center text-gray-800 mb-4">הצעה/הזמנה לביצוע עבודה</h2>
                    <p className="text-lg mb-6">שלום רב, לבקשתך הריני מציע לבצע עבורך את העבודות הבאות. המחירים אינם כוללים מע"מ.</p>

                    {/* Work Items Table */}
                    <div className="mb-10 page-break-avoid">
                        <table className="w-full text-right border-collapse responsive-table preview-table" aria-label="Work Items Preview">
                            <thead className="bg-gray-100 print-exact">
                                <tr>
                                    <th className="p-3 w-12 text-center">מס'</th>
                                    <th className="p-3">פירוט העבודה</th>
                                    <th className="p-3 w-24">יח' מידה</th>
                                    <th className="p-3 w-24 text-center">כמות</th>
                                    <th className="p-3 w-32 text-center">מחיר יח'</th>
                                    <th className="p-3 w-32 text-center">סה"כ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workItems.map((item, index) => (
                                    <tr key={item.id} className="border-t border-gray-200 md:border-t-0">
                                        <td data-label="מס'" className="p-2 text-center align-top">{index + 1}</td>
                                        <td data-label="פירוט העבודה" className="p-2 align-top whitespace-pre-wrap">{item.description}</td>
                                        <td data-label="יח' מידה" className="p-2 md:text-center align-top"><span className="td-value">{item.unit}</span></td>
                                        <td data-label="כמות" className="p-2 md:text-center align-top"><span className="td-value">{item.quantity}</span></td>
                                        <td data-label="מחיר יח'" className="p-2 md:text-center align-top"><span className="td-value">{(item.price).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span></td>
                                        <td data-label='סה"כ' className="p-2 md:text-center align-top font-semibold"><span className="td-value">{(item.quantity * item.price).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col items-end mt-4 space-y-2 text-xl font-bold">
                            <div className="w-full md:w-1/2 flex justify-between p-3 border-t-2 border-gray-300">
                                <span>סה"כ לפני מע"מ:</span>
                                <span>{totalProposalAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
                            </div>
                            <div className="w-full md:w-1/2 flex justify-between p-3 bg-gray-50 print-exact">
                                <span>סה"כ כולל מע"מ (18%):</span>
                                <span>{totalWithVat.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms Table */}
                    <div className="mb-10 page-break-avoid">
                        <h3 className="text-2xl font-serif text-gray-800 mb-4">תנאי תשלום</h3>
                        <p className="mb-4">לפי התקדמות העבודה כמפורט בטבלה, או עד 5 תשלומים בכרטיס אשראי. יש להוסיף מע"מ לכל תשלום.</p>
                        <table className="w-full text-right border-collapse responsive-table preview-table" aria-label="Payment Terms Preview">
                            <thead className="bg-gray-100 print-exact">
                                <tr>
                                    <th className="p-3 w-12 text-center">מס'</th>
                                    <th className="p-3">הסכום</th>
                                    <th className="p-3 text-center">חלק התשלום</th>
                                    <th className="p-3">מועד התשלום</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentTerms.map((term, index) => (
                                    <tr key={term.id} className="border-t border-gray-200 md:border-t-0">
                                        <td data-label="מס'" className="p-2 text-center">{index + 1}</td>
                                        <td data-label="הסכום" className="p-2 md:text-right"><span className="td-value">{((term.percentage / 100) * totalProposalAmount).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span></td>
                                        <td data-label="חלק התשלום" className="p-2 md:text-center"><span className="td-value">{term.percentage}%</span></td>
                                        <td data-label="מועד התשלום" className="p-2 md:text-right"><span className="td-value">{term.milestone}</span></td>
                                    </tr>
                                ))}
                                <tr className="border-t border-gray-200 bg-gray-50 print-exact md:border-t-0">
                                    <td data-label="מס'" className="p-3 text-center">{paymentTerms.length + 1}</td>
                                    <td data-label="הסכום" className="p-3 font-semibold md:text-right"><span className="td-value">{finalPaymentAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span></td>
                                    <td data-label="חלק התשלום" className="p-3 font-semibold md:text-center"><span className="td-value">5%</span></td>
                                    <td data-label="מועד התשלום" className="p-3 font-semibold md:text-right"><span className="td-value">בסיום העבודה</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <TermsAndConditions />

                    {/* Client Agreement Section */}
                    <div className="mt-8 page-break-avoid">
                        <p className="mb-6"><strong className="font-serif">14. הזמנת העבודה:</strong> הריני מאשר/ת את הסכמתי לתנאים ולפרטים לעיל ומזמין/ה בזאת את העבודה.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6">
                            <div>
                                <label htmlFor="clientFirstName" className="block text-sm font-medium text-gray-700">שם פרטי</label>
                                <input
                                    type="text"
                                    id="clientFirstName"
                                    value={clientDetails.firstName}
                                    onChange={(e) => onClientDetailsChange('firstName', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border-b border-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="clientLastName" className="block text-sm font-medium text-gray-700">שם משפחה</label>
                                <input
                                    type="text"
                                    id="clientLastName"
                                    value={clientDetails.lastName}
                                    onChange={(e) => onClientDetailsChange('lastName', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border-b border-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="clientIdNumber" className="block text-sm font-medium text-gray-700">ת.ז</label>
                                <input
                                    type="text"
                                    id="clientIdNumber"
                                    value={clientDetails.idNumber}
                                    onChange={(e) => onClientDetailsChange('idNumber', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border-b border-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 items-end">
                            <div className="w-full">
                                <SignaturePad onSignatureChange={setClientSignature} />
                                <p className="text-center font-bold mt-1">חתימה</p>
                            </div>
                            <div>
                                <img src="/signature.png" alt="חתימת חגי תדמור" className="h-16 mx-auto"/>
                                <p className="text-center font-bold mt-1">לשירותכם תמיד, חגי תדמור</p>
                            </div>
                        </div>
                    </div>
                    
                    <Footer />
                </div>
            </div>

            <div className="my-8 flex flex-col md:flex-row justify-center items-center gap-4 print:hidden max-w-4xl mx-auto">
                 <button 
                    onClick={handleConfirm} 
                    disabled={!isClientDataValid || isSubmitting}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed order-1 w-full"
                >
                    {isSubmitting ? 'שולח...' : 'שלח מסמך'}
                </button>
                <button
                    onClick={() => navigate(`/edit/${encodedData}`)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors order-2 w-full md:w-auto"
                >
                    חזור לעריכה
                </button>
            </div>
        </div>
    );
};

export default ProposalPreview;