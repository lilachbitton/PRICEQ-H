import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// FIX: Import SubcontractorProposalData from types.ts for consistency and remove local definition.
import { WorkItem, PaymentTerm, SubcontractorDetails, MaterialClause, SubcontractorSignatoryDetails, SubcontractorProposalData } from './types';
import { Watermark } from './SharedComponents';
import SubcontractorTerms from './SubcontractorTerms';
import SignaturePad from './SignaturePad';
import { decodeData, encodeData } from './App';

const SUBCONTRACTOR_WEBHOOK_URL = 'https://hook.eu2.make.com/5uadx69swrpxp2wt58i6y2ygls61qo94';


const SubcontractorProposalPreview: React.FC = () => {
    const { data: encodedData } = useParams<{ data: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // FIX: Use SubcontractorProposalData type.
    const data = useMemo(() => decodeData<SubcontractorProposalData>(encodedData), [encodedData]);

    const [signatory, setSignatory] = useState<SubcontractorSignatoryDetails>({ fullName: '', idNumber: '', signature: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FIX: Wrapped the signature handler in useCallback to prevent re-renders from breaking the signature pad.
    const handleSignatureChange = useCallback((signature: string) => {
        setSignatory(prev => ({ ...prev, signature }));
    }, []);

    // Check if we are in PDF generation mode
    const isPdfMode = useMemo(() => {
        return new URLSearchParams(location.search).get('mode') === 'pdf';
    }, [location.search]);

    if (!data) return <div className="text-center p-10 bg-white shadow-lg rounded-md"><h2 className="text-2xl font-bold text-red-600">שגיאה בנתונים</h2></div>;

    const { subcontractor, totalAmount } = data;
    const isFormValid = signatory.fullName.trim() && signatory.idNumber.trim() && signatory.signature;
    
    const handleConfirm = async () => {
        if (!isFormValid || !data) return;
        setIsSubmitting(true);
        
        const finalData = { ...data, signatory };
        const encodedFinalData = encodeData(finalData);
        const finalLink = `${window.location.origin}${window.location.pathname}#/subcontractor/final/${encodedFinalData}`;
        const pdfCleanLink = `${finalLink}?mode=pdf`;

        const payload = {
            'שלב': 'הסכם קבלן משנה נחתם',
            'ID_מסמך': data.documentId,
            'לינק למסמך חתום': finalLink,
            'מזהה_קבלן_CRM': data.subcontractorId,
            'מזהה_פרויקט_CRM': data.projectId, 
            'pdfDownloadUrl': pdfCleanLink
        };

        try {
            await fetch(SUBCONTRACTOR_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Subcontractor Webhook (Stage 2) failed:', error);
            // Non-critical error, so we continue the flow
        }
        
        navigate(`/subcontractor/final/${encodedFinalData}`);
    };

    const formattedStartDate = data.workStartDate ? new Date(data.workStartDate).toLocaleDateString('he-IL') : 'לא צוין';

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl my-10 relative print:shadow-none print:my-0" dir="rtl">
                <Watermark />
                <div className="p-8 md:p-12 relative z-10">
                    <div className="text-center mb-4"><p className="text-sm">עמוד 1 מתוך 3</p></div>
                    <h1 className="text-3xl font-serif text-center font-bold underline mb-4">הנדון: הזמנת עבודה והסכם לביצוע עבודות{data.workTitle && `: ${data.workTitle}`}</h1>
                    <div className="flex justify-between mb-6">
                        <span><strong className="font-semibold">תאריך:</strong> {data.proposalDate}</span>
                        <span><strong className="font-semibold">בכתובת:</strong> {data.projectAddress}</span>
                    </div>

                    <p className="mb-4">בין חגי תדמור מעיין גנים בע"מ, ח.פ. 516519857, מרח' הורד 40 גן יבנה - להלן הקבלן הראשי</p>
                    <p className="mb-4">ל: <strong className="font-semibold">{subcontractor.name}</strong> ע.מ./ח.פ <strong className="font-semibold">{subcontractor.idNumber}</strong> בכתובת: <strong className="font-semibold">{subcontractor.address}</strong> - להלן קבלן המשנה.</p>
                    
                    <p>מר <strong className="font-semibold">{subcontractor.managerName}</strong> המנהל והבעלים של הקבלן - קבלן המשנה מצהיר בזאת כי הינו מנהל פעיל בעסק שלו, ובעל ידע וניסיון רב בעבודות נושא הסכם זה. מר <strong className="font-semibold">{subcontractor.managerName}</strong>, יהיה הנציג והאחראי הראשי להתחייבויות קבלן המשנה לפי הסכם זה. ומנהל העבודה בפועל.</p>
                    <p>הואיל וחגי תדמור מעיין גנים בע"מ שהינו קבלן פיתוח וגינון, קיבל עבודות <strong className="font-semibold">{data.workTitle}</strong> שונות בבית הלקוח: <strong className="font-semibold">{data.clientName}</strong> בכתובת: <strong className="font-semibold">{data.projectAddress}</strong> ובכללן עבודות כמפורט בטבלה להלן.</p>
                    <p>והואיל ומר <strong className="font-semibold">{subcontractor.managerName}</strong> – קבלן המשנה מצהיר כי בדק את השטח באתר, קיבל הסברים, ראה את העבודה והרי הוא מעוניין לבצע את העבודה הנ"ל, ובכתובת הנ"ל עבור חגי תדמור מעיין גנים בע"מ.</p>

                    <h2 className="font-bold text-lg mt-6 mb-2 underline">הוסכם בין הצדדים כדלקמן:</h2>
                    <p>קבלן המשנה יבצע את עבודות הריצוף החל מתאריך <strong className="font-semibold">{formattedStartDate}</strong>, ויבצע אותה באופן רצוף בכל ימי העבודה הבאים.</p>
                    <p>כל החומרים לעבודה <strong className="font-semibold">{data.materials.included ? 'כלולים' : 'אינם כלולים'}</strong> במחיר העבודה ויסופקו ע"י <strong className="font-semibold">{data.materials.provider === 'main_contractor' ? 'הקבלן הראשי' : 'קבלן המשנה'}</strong>.</p>
                    
                    <div className="my-8 page-break-avoid">
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-right border-collapse preview-table">
                                <thead className="bg-gray-100"><tr><th className="p-2 border">מס'</th><th className="p-2 border">תיאור העבודה</th><th className="p-2 border">יח' מידה</th><th className="p-2 border">כמות</th><th className="p-2 border">מחיר</th><th className="p-2 border">סה"כ</th></tr></thead>
                                <tbody>
                                    {data.workItems.map((item, i) => <tr key={i}>
                                        <td data-label="מס'" className="p-2 border text-center">{i+1}</td>
                                        <td data-label="תיאור העבודה" className="p-2 border whitespace-pre-wrap">{item.description}</td>
                                        <td data-label="יח' מידה" className="p-2 border text-center"><span className="td-value">{item.unit}</span></td>
                                        <td data-label="כמות" className="p-2 border text-center"><span className="td-value">{item.quantity}</span></td>
                                        <td data-label="מחיר" className="p-2 border text-center"><span className="td-value">{(item.price).toLocaleString('he-IL',{style:'currency',currency:'ILS'})}</span></td>
                                        <td data-label='סה"כ' className="p-2 border text-center font-semibold"><span className="td-value">{(item.price*item.quantity).toLocaleString('he-IL',{style:'currency',currency:'ILS'})}</span></td>
                                    </tr>)}
                                </tbody>
                                <tfoot><tr className="bg-gray-100 font-bold"><td colSpan={5} className="p-2 border text-left">סה"כ לעבודה זו</td><td className="p-2 border text-center">{totalAmount.toLocaleString('he-IL',{style:'currency',currency:'ILS'})}</td></tr></tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <div className="text-center my-4 page-break-avoid"><p className="text-sm">עמוד 2 מתוך 3</p></div>
                    
                     <div className="my-8 page-break-avoid">
                        <h3 className="text-xl font-serif font-bold text-center mb-4">תשלומים לפרויקט</h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-right border-collapse preview-table">
                                <thead className="bg-gray-100"><tr><th className="p-2 border">מס'</th><th className="p-2 border">מועד התשלום</th><th className="p-2 border">סכום התשלום לפני מע"מ</th></tr></thead>
                                <tbody>
                                    {data.paymentTerms.map((term, i) => <tr key={i}>
                                        <td data-label="מס'" className="p-2 border text-center">{i+1}</td>
                                        <td data-label="מועד התשלום" className="p-2 border"><span className="td-value">{term.milestone}</span></td>
                                        <td data-label="הסכום" className="p-2 border text-center"><span className="td-value">{((term.percentage / 100) * totalAmount).toLocaleString('he-IL',{style:'currency',currency:'ILS'})}</span></td>
                                    </tr>)}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 font-bold">
                                        <td colSpan={2} className="p-2 border text-left">סה"כ תשלומים לפרויקט</td>
                                        <td className="p-2 border text-center">{totalAmount.toLocaleString('he-IL',{style:'currency',currency:'ILS'})}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <p className="text-sm mt-2">כל תשלום יתבצע בהעברה לאחר קבלת חשבונית תקינה, ובתוך שבוע ימים.</p>
                    </div>

                    <div className="my-8 page-break-avoid">
                        <h3 className="text-xl font-serif font-bold text-center mb-4">הערות להסכם</h3>
                        <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
                           {data.notes && data.notes.trim() !== '' ? (
                                <p>{data.notes}</p>
                            ) : (
                                <p className="text-gray-500">לא נרשמו הערות.</p>
                            )}
                        </div>
                    </div>

                    <SubcontractorTerms managerName={subcontractor.managerName} />

                    <div className="text-center my-4 page-break-avoid"><p className="text-sm">עמוד 3 מתוך 3</p></div>
                     <div className="mt-8 page-break-avoid">
                        <h3 className="font-bold text-lg mb-4">אישור וחתימה</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div><label className="block text-sm font-medium">שם מלא (חותם)</label><input type="text" value={signatory.fullName} onChange={e => setSignatory(p => ({...p, fullName: e.target.value}))} className="mt-1 w-full p-2 border-b" required /></div>
                            <div>
                                <label className="block text-sm font-medium">ת.ז.</label>
                                <input 
                                    type="text" 
                                    value={signatory.idNumber} 
                                    onChange={e => {
                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                        setSignatory(p => ({...p, idNumber: numericValue}));
                                    }} 
                                    className="mt-1 w-full p-2 border-b" 
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 mt-10 items-end">
                            <div>
                                <SignaturePad onSignatureChange={handleSignatureChange} />
                                <p className="text-center font-bold mt-1">חתימת קבלן המשנה</p>
                            </div>
                            <div><img src="/signature.png" alt="חתימת חגי תדמור" className="h-16 mx-auto"/><p className="text-center font-bold mt-1">חתימת הקבלן הראשי</p></div>
                        </div>
                    </div>

                </div>
            </div>
             {!isPdfMode && (
                 <div className="my-8 flex flex-col md:flex-row justify-center items-center gap-4 print:hidden max-w-4xl mx-auto">
                    <button onClick={handleConfirm} disabled={!isFormValid || isSubmitting} className="bg-green-600 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-green-700 disabled:bg-gray-400 order-1 w-full">
                        {isSubmitting ? 'שולח...' : 'אשר וחתום על ההסכם'}
                    </button>
                    <button
                        onClick={() => navigate(`/subcontractor/edit/${encodedData}`)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors order-2 w-full md:w-auto"
                    >
                        חזור לעריכה
                    </button>
                </div>
            )}
        </div>
    );
};
export default SubcontractorProposalPreview;