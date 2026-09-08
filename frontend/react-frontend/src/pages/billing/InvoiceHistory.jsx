import React, { useEffect, useState } from 'react';
import { getInvoices } from '../../services/featureService';
import { refundInvoice } from '../../services/featureService';

function downloadReceipt(invoice) {
  const receipt = JSON.stringify(invoice, null, 2);
  const url = URL.createObjectURL(new Blob([receipt], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.id}-receipt.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState('');
  useEffect(() => { getInvoices().then((response) => setInvoices(response.data || [])).catch(() => {}); }, []);
  const requestRefund = async (invoice) => { 
    try { 
      const response = await refundInvoice(invoice.id); 
      setMessage(response.data.message); 
      setInvoices((items) => items.map((item) => item.id === invoice.id ? { ...item, status: 'REFUND_REQUESTED' } : item)); 
    } catch (error) { 
      setMessage(error.response?.data?.message || 'Unable to request a refund.'); 
    } 
  };
  return <div><div className="admin-dashboard"><h1>Invoices & Receipts</h1><p>Review payment status and download receipts for your records.</p></div><section className="table-card">{invoices.length ? <table><thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Receipt</th><th>Refund</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.id}</td><td>{new Date(invoice.createdAt).toLocaleDateString()}</td><td>KES {invoice.amount}</td><td>{invoice.method}</td><td><span className={`status-pill ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td><td><button type="button" onClick={() => downloadReceipt(invoice)}>Download</button></td><td>{invoice.status === 'COMPLETED' && <button type="button" onClick={() => requestRefund(invoice)}>Request refund</button>}</td></tr>)}</tbody></table> : <p>No invoices found.</p>}</section>{message && <div className="panel-note">{message}</div>}</div>;
}
