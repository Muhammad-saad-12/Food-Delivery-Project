import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Printer,
  Download,
  X,
  Receipt,
  UtensilsCrossed,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react';

interface InvoiceViewProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const textData = `
===================================================
             ${order.restaurantName.toUpperCase()}
          FBR / PRA OFFICIAL TAX INVOICE
===================================================
Invoice / Order #: ${order.orderNumber}
Issued At:         ${new Date(order.createdAt || Date.now()).toLocaleString()}
NTN Registration:  849201-9
STRN:              3277876123456

CUSTOMER DETAILS:
Name:    ${order.customerName}
Phone:   ${order.customerPhone}
Address: ${order.deliveryAddress?.street}, ${order.deliveryAddress?.areaOrLandmark}, ${order.deliveryAddress?.city}
Notes:   ${order.deliveryAddress?.specialNotes || 'None'}

ITEMIZED ORDER BREAKDOWN:
---------------------------------------------------
${(order.items || [])
  .map(
    (item: any, i: number) =>
      `${i + 1}. ${item.name} x${item.quantity} - $${item.itemTotal.toFixed(2)}
   Portion: ${item.size?.name || 'Standard'} | Spice: ${item.spiceLevel || 'None'}
   ${item.selectedAddOns?.length ? `Add-ons: ${item.selectedAddOns.map((a: any) => a.name).join(', ')}` : ''}`
  )
  .join('\n\n')}

FINANCIAL SUMMARY:
---------------------------------------------------
Subtotal:         $${order.pricing?.subtotal?.toFixed(2)}
Sales Tax (8.5%): $${order.pricing?.tax?.toFixed(2)}
Delivery Charges: ${order.pricing?.deliveryFee === 0 ? 'FREE' : `$${order.pricing?.deliveryFee?.toFixed(2)}`}
Driver Tip:       $${order.pricing?.tip?.toFixed(2)}
---------------------------------------------------
TOTAL AMOUNT:     $${order.pricing?.total?.toFixed(2)}
PAYMENT METHOD:   ${order.payment?.method?.toUpperCase()} [Status: ${order.payment?.status?.toUpperCase()}]
${order.payment?.transactionRef ? `Transaction Ref: ${order.payment?.transactionRef}` : ''}
===================================================
Thank you for dining with ${order.restaurantName}!
`;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in no-print" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl z-50 overflow-hidden">
          {/* Action Header - Hidden during print */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Official Itemized Tax Invoice</span>
              <span className="font-mono text-slate-400 font-normal">
                ({order.orderNumber})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900 printable-invoice">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-200">
              {/* Invoice Top Branding */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">
                        {order.restaurantName}
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Restaurant Management System • GourmetOS
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right space-y-1 text-xs">
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    FBR / PRA Tax Invoice
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">
                    STRN: 3277876123456 • NTN: 849201-9
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Invoice #: <strong className="text-white font-mono">{order.orderNumber}</strong>
                  </p>
                  <p className="text-slate-400 text-[11px] flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(order.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Delivery & Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Billed & Delivered To:
                  </span>
                  <p className="text-sm font-bold text-white">{order.customerName}</p>
                  <p className="text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {order.customerPhone}
                  </p>
                  <p className="text-slate-400 truncate">{order.customerEmail}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Drop-off Location & Landmark:
                  </span>
                  <p className="text-slate-200 flex items-start gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.areaOrLandmark}, {order.deliveryAddress?.city}
                    </span>
                  </p>
                  {order.deliveryAddress?.coordinates && (
                    <p className="text-[11px] font-mono text-emerald-400/80 mt-1">
                      GPS: {order.deliveryAddress.coordinates.lat?.toFixed(4)}, {order.deliveryAddress.coordinates.lng?.toFixed(4)}
                    </p>
                  )}
                  {order.deliveryAddress?.specialNotes && (
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      Note: "{order.deliveryAddress.specialNotes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Itemized Order Breakdown
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Item & Customizations</th>
                        <th className="py-2.5 px-2 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {(order.items || []).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="py-3 px-3">
                            <p className="font-bold text-white">{item.name}</p>
                            <div className="text-[11px] text-slate-400 space-y-0.5 mt-0.5">
                              {item.size && (
                                <p>
                                  Portion: <span className="text-slate-200">{item.size.name}</span>
                                </p>
                              )}
                              {item.spiceLevel && (
                                <p>
                                  Spice: <span className="text-orange-400">{item.spiceLevel}</span>
                                </p>
                              )}
                              {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                                <p className="text-slate-300">
                                  Add-ons: {item.selectedAddOns.map((a: any) => a.name).join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-semibold">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            ${item.unitPrice?.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">
                            ${item.itemTotal?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Payment Badge */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Payment Verification
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          order.payment?.method === 'cod'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {order.payment?.method === 'cod'
                          ? 'Cash on Delivery (Pending)'
                          : `Paid via ${order.payment?.method?.toUpperCase()}`}
                      </span>
                    </div>
                  </div>

                  {order.payment?.transactionRef && (
                    <p className="text-xs font-mono text-slate-300">
                      Ref: <strong className="text-white">{order.payment.transactionRef}</strong>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    This is an electronically generated restaurant order tax invoice.
                  </p>
                </div>

                {/* Subtotals & Grand Total */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="font-mono text-white">
                      ${order.pricing?.subtotal?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sales Tax (8.5%):</span>
                    <span className="font-mono text-white">
                      ${order.pricing?.tax?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Fee:</span>
                    <span className="font-mono text-white">
                      {order.pricing?.deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE</span>
                      ) : (
                        `$${order.pricing?.deliveryFee?.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Driver Tip:</span>
                    <span className="font-mono text-white">
                      ${order.pricing?.tip?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                    <span>Net Amount:</span>
                    <span className="text-emerald-400 font-mono">
                      ${order.pricing?.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
