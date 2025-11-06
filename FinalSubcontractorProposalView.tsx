import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// FIX: Import FinalSubcontractorProposalData from types.ts for consistency and remove local definition.
import { WorkItem, PaymentTerm, SubcontractorDetails, MaterialClause, SubcontractorSignatoryDetails, FinalSubcontractorProposalData } from './types';
import { Watermark } from './SharedComponents';
import SubcontractorTerms from './SubcontractorTerms';
import { decodeData } from './App';

const FinalSubcontractorProposalView: React.FC = () => {
    const { data: encodedData } = useParams<{ data: string }>();
    const navigate = useNavigate();
    // FIX: Use FinalSubcontractorProposalData type.
    const data = useMemo(() => decodeData<FinalSubcontractorProposalData>(encodedData), [encodedData]);

    if (!data) return <div className="text-center p-10 bg-white shadow-lg rounded-md"><h2 className="text-2xl font-bold text-red-600">שגיאה בנתונים</h2></div>;

    const { subcontractor, totalAmount, signatory } = data;
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

                    <SubcontractorTerms managerName={subcontractor.managerName} />

                    <div className="text-center my-4 page-break-avoid"><p className="text-sm">עמוד 3 מתוך 3</p></div>
                     <div className="mt-8 page-break-avoid">
                        <h3 className="font-bold text-lg mb-4">אישור וחתימה</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 border rounded-md bg-gray-50">
                            <div><p className="block text-sm font-medium text-gray-500">שם מלא (חותם)</p><p className="font-semibold text-lg">{signatory.fullName}</p></div>
                            <div><p className="block text-sm font-medium text-gray-500">ת.ז.</p><p className="font-semibold text-lg">{signatory.idNumber}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 mt-10 items-end">
                            <div>
                                {signatory.signature ? (
                                    <img src={signatory.signature} alt="חתימת קבלן המשנה" className="mx-auto h-20 object-contain" />
                                ) : (
                                    <div className="h-20 border-b-2 border-gray-600"></div>
                                )}
                                <p className="text-center font-bold mt-1">חתימת קבלן המשנה</p>
                            </div>
                            <div><img src="/signature.png" alt="חתימת חגי תדמור" className="h-16 mx-auto"/><p className="text-center font-bold mt-1">חתימת הקבלן הראשי</p></div>
                        </div>
                    </div>

                </div>
            </div>
             <div className="mt-8 flex justify-between items-center print:hidden max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">חזרה</button>
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">הדפס הסכם</button>
            </div>
        </div>
    );
};
export default FinalSubcontractorProposalView;