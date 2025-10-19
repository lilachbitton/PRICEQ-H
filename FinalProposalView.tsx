import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkItem, PaymentTerm, ClientDetails } from './types';
import { Watermark } from './SharedComponents';
import TermsAndConditions from './TermsAndConditions';
import { decodeData } from './App';

type FinalProposalData = {
    leadId: string;
    customerName: string;
    customerAddress: string;
    proposalDate: string;
    workItems: WorkItem[];
    totalProposalAmount: number;
    paymentTerms: PaymentTerm[];
    finalPaymentAmount: number;
    clientDetails: ClientDetails;
    clientSignature: string;
};

const Footer: React.FC = () => (
    <div className="text-center text-xs text-gray-700 border-t-2 border-green-700 pt-3 mt-16">
        <img src="/footer.png" alt="Hagay Tadmor contact details" className="w-full" />
    </div>
);

const FinalProposalView: React.FC = () => {
    const { data: encodedData } = useParams<{ data: string }>();
    const navigate = useNavigate();

    const finalData = useMemo(() => decodeData<FinalProposalData>(encodedData), [encodedData]);
    
    if (!finalData) {
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
        clientDetails,
        clientSignature,
    } = finalData;

    const totalWithVat = useMemo(() => totalProposalAmount * 1.17, [totalProposalAmount]);

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
                        <table className="w-full text-right border-collapse responsive-table" aria-label="Work Items Preview">
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
                                        <td data-label="יח' מידה" className="p-2 text-left md:text-center align-top">{item.unit}</td>
                                        <td data-label="כמות" className="p-2 text-left md:text-center align-top">{item.quantity}</td>
                                        <td data-label="מחיר יח'" className="p-2 text-left md:text-center align-top">{(item.price).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
                                        <td data-label='סה"כ' className="p-2 text-left md:text-center align-top font-semibold">{(item.quantity * item.price).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
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
                                <span>סה"כ כולל מע"מ (17%):</span>
                                <span>{totalWithVat.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms Table */}
                    <div className="mb-10 page-break-avoid">
                        <h3 className="text-2xl font-serif text-gray-800 mb-4">תנאי תשלום</h3>
                        <p className="mb-4">לפי התקדמות העבודה כמפורט בטבלה, או עד 5 תשלומים בכרטיס אשראי. יש להוסיף מע"מ לכל תשלום.</p>
                        <table className="w-full text-right border-collapse responsive-table" aria-label="Payment Terms Preview">
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
                                        <td data-label="הסכום" className="p-2 text-left md:text-right">{((term.percentage / 100) * totalProposalAmount).toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
                                        <td data-label="חלק התשלום" className="p-2 text-left md:text-center">{term.percentage}%</td>
                                        <td data-label="מועד התשלום" className="p-2 text-left md:text-right">{term.milestone}</td>
                                    </tr>
                                ))}
                                <tr className="border-t border-gray-200 bg-gray-50 print-exact md:border-t-0">
                                    <td data-label="מס'" className="p-3 text-center">{paymentTerms.length + 1}</td>
                                    <td data-label="הסכום" className="p-3 font-semibold text-left md:text-right">{finalPaymentAmount.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' })}</td>
                                    <td data-label="חלק התשלום" className="p-3 font-semibold text-left md:text-center">5%</td>
                                    <td data-label="מועד התשלום" className="p-3 font-semibold text-left md:text-right">בסיום העבודה</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <TermsAndConditions />

                    {/* Client Agreement Section */}
                    <div className="mt-8 page-break-avoid">
                        <p className="mb-6"><strong className="font-serif">14. הזמנת העבודה:</strong> הריני מאשר/ת את הסכמתי לתנאים ולפרטים לעיל ומזמין/ה בזאת את העבודה.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-6 p-4 border rounded-md bg-gray-50">
                            <div>
                                <p className="block text-sm font-medium text-gray-500">שם פרטי</p>
                                <p className="mt-1 font-semibold text-lg">{clientDetails.firstName || 'לא הוזן'}</p>
                            </div>
                            <div>
                                <p className="block text-sm font-medium text-gray-500">שם משפחה</p>
                                <p className="mt-1 font-semibold text-lg">{clientDetails.lastName || 'לא הוזן'}</p>
                            </div>
                            <div>
                                <p className="block text-sm font-medium text-gray-500">ת.ז</p>
                                <p className="mt-1 font-semibold text-lg">{clientDetails.idNumber || 'לא הוזן'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 items-end">
                            <div className="border-b-2 border-gray-600 pb-2">
                                <p className="text-center text-lg font-serif h-8">{clientSignature || ''}</p>
                                <p className="text-center font-bold mt-1">חתימה</p>
                            </div>
                            <div className="border-t-2 border-dotted border-gray-400 pt-2">
                                <p className="text-center font-bold">לשירותכם תמיד, חגי תדמור</p>
                            </div>
                        </div>
                    </div>
                    
                    <Footer />
                </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between items-center print:hidden max-w-4xl mx-auto gap-4">
                <button onClick={() => navigate(`/proposal/${encodedData}`)} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors w-full md:w-auto">
                    חזרה לטופס החתימה
                </button>
                 <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto">
                    הדפס או שמור כ-PDF
                </button>
            </div>
        </div>
    );
};

export default FinalProposalView;