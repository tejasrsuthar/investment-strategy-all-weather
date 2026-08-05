import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [reportsSubscribed, setReportsSubscribed] = useState(false);
  const [portfolioSubscribed, setPortfolioSubscribed] = useState(false);

  // Pagination states
  const [reportPage, setReportPage] = useState(1);
  const [reportPages, setReportPages] = useState(1);
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [portfolioPages, setPortfolioPages] = useState(1);

  // Payment states
  const [upiTxId, setUpiTxId] = useState('');
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiSuccess, setUpiSuccess] = useState('');
  const [upiError, setUpiError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    checkSubscriptions();
  }, [token, reportPage, portfolioPage]);

  const checkSubscriptions = async () => {
    // Attempt fetching reports (checks reports status)
    try {
      const repRes = await fetch(`http://localhost:8000/api/reports?page=${reportPage}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (repRes.ok) {
        const data = await repRes.json();
        setReports(data.items);
        setReportPages(data.pages);
        setReportsSubscribed(true);
      } else {
        setReportsSubscribed(false);
      }
    } catch (e) {
      setReportsSubscribed(false);
    }

    // Attempt fetching portfolio (checks portfolio status)
    try {
      const portRes = await fetch(`http://localhost:8000/api/portfolio?page=${portfolioPage}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (portRes.ok) {
        const data = await portRes.json();
        setPortfolio(data.items);
        setPortfolioPages(data.pages);
        setPortfolioSubscribed(true);
      } else {
        setPortfolioSubscribed(false);
      }
    } catch (e) {
      setPortfolioSubscribed(false);
    }
  };

  const handleStripeCheckout = async (serviceType) => {
    try {
      const res = await fetch('http://localhost:8000/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service_type: serviceType })
      });
      const data = await res.json();
      if (data.checkout_url) {
        // Redirect to mock stripe success flow directly for testing/local experience
        // In real execution, open the URL. Here, we mock immediate checkout complete via webhook:
        const mockWebhookRes = await fetch('http://localhost:8000/api/payments/stripe-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: "checkout.session.completed",
            data: {
              object: {
                id: "cs_mock_success_id_" + Math.random().toString(36).substr(2, 9),
                customer_details: { email: localStorage.getItem('email') }
              }
            }
          })
        });
        if (mockWebhookRes.ok) {
          alert("Stripe sandbox transaction simulation succeeded! Access granted.");
          checkSubscriptions();
        }
      }
    } catch (err) {
      alert("Checkout error: " + err.message);
    }
  };

  const handleUPIConfirm = async (e, serviceType) => {
    e.preventDefault();
    setUpiLoading(true);
    setUpiError('');
    setUpiSuccess('');

    try {
      const res = await fetch('http://localhost:8000/api/payments/upi-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transaction_id: upiTxId, service_type: serviceType })
      });
      const data = await res.json();
      if (res.ok) {
        setUpiSuccess(data.message);
        setUpiTxId('');
        checkSubscriptions();
      } else {
        throw new Error(data.detail || 'Failed to submit UPI verification');
      }
    } catch (err) {
      setUpiError(err.message);
    } finally {
      setUpiLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      <div className="flex justify-between items-end mb-12 flex-wrap gap-4 border-b border-bordercolor pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-forest mb-2">Investor Dashboard</h1>
          <p className="text-sm text-textmuted">Welcome, {localStorage.getItem('username') || 'Investor'}</p>
        </div>
        <Link to="/investor/settings" className="btn-forest text-[#FAF9F6] text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-full shadow-md flex items-center gap-1 hover:bg-forest-hover transition-all">
          Account Settings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Reports Panel */}
        <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-forest">Research Reports</h2>
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${reportsSubscribed ? 'bg-lime text-forest' : 'bg-red-50 text-red-600'}`}>
                {reportsSubscribed ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>

            {reportsSubscribed ? (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-sm text-textmuted text-center py-8">No research reports published yet.</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="p-4 bg-sand border border-bordercolor rounded-2xl">
                      <h4 className="font-bold text-forest text-base mb-1">{report.title}</h4>
                      <p className="text-sm text-textmuted mb-2 line-clamp-2">{report.content}</p>
                      <span className="text-[10px] text-textmuted font-medium">Published: {new Date(report.published_at).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
                {reportPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={reportPage === 1}
                      onClick={() => setReportPage(reportPage - 1)}
                      className="px-4 py-2 border border-bordercolor rounded-xl text-xs font-bold uppercase disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-textmuted">Page {reportPage} of {reportPages}</span>
                    <button
                      disabled={reportPage === reportPages}
                      onClick={() => setReportPage(reportPage + 1)}
                      className="px-4 py-2 border border-bordercolor rounded-xl text-xs font-bold uppercase disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-textmuted mb-6">Gain immediate access to our equity research reports for ₹999/month.</p>
                <div className="space-y-4">
                  <button
                    onClick={() => handleStripeCheckout('reports')}
                    className="w-full btn-forest text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest text-center"
                  >
                    Pay with Card (Stripe)
                  </button>
                  <form onSubmit={(e) => handleUPIConfirm(e, 'reports')} className="p-4 bg-sand border border-bordercolor rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-forest">Pay via UPI (GPay/PhonePe)</h4>
                    <p className="text-[10px] text-textmuted">Transfer to UPI ID: <strong>rc@upi</strong> and input Transaction ID below:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Transaction ID / Ref No"
                        required
                        value={upiTxId}
                        onChange={(e) => setUpiTxId(e.target.value)}
                        className="flex-grow px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={upiLoading}
                        className="bg-forest text-white px-4 rounded-xl text-xs font-bold uppercase tracking-widest"
                      >
                        Confirm
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Panel */}
        <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-forest">Model Portfolio</h2>
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${portfolioSubscribed ? 'bg-lime text-forest' : 'bg-red-50 text-red-600'}`}>
                {portfolioSubscribed ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>

            {portfolioSubscribed ? (
              <div className="space-y-4">
                {portfolio.length === 0 ? (
                  <p className="text-sm text-textmuted text-center py-8">No stocks in portfolio currently.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-bordercolor text-xs uppercase text-textmuted tracking-widest">
                          <th className="py-2">Stock</th>
                          <th className="py-2">Buy Price</th>
                          <th className="py-2">Target</th>
                          <th className="py-2">SL</th>
                          <th className="py-2">Weight</th>
                          <th className="py-2">Type</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {portfolio.map((stock) => (
                          <tr key={stock.id} className="border-b border-bordercolor/40 text-forest font-semibold">
                            <td className="py-3">
                              <span className="block font-bold">{stock.ticker}</span>
                              <span className="text-[10px] text-textmuted font-normal">{stock.name}</span>
                            </td>
                            <td className="py-3">₹{stock.entry_price}</td>
                            <td className="py-3 text-green-700">₹{stock.target_price}</td>
                            <td className="py-3 text-red-600">₹{stock.stop_loss}</td>
                            <td className="py-3">{stock.weightage}%</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${stock.transaction_type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {stock.transaction_type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {portfolioPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={portfolioPage === 1}
                      onClick={() => setPortfolioPage(portfolioPage - 1)}
                      className="px-4 py-2 border border-bordercolor rounded-xl text-xs font-bold uppercase disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-textmuted">Page {portfolioPage} of {portfolioPages}</span>
                    <button
                      disabled={portfolioPage === portfolioPages}
                      onClick={() => setPortfolioPage(portfolioPage + 1)}
                      className="px-4 py-2 border border-bordercolor rounded-xl text-xs font-bold uppercase disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-textmuted mb-6">Gain full transparency into our active model portfolios for ₹1,999/month.</p>
                <div className="space-y-4">
                  <button
                    onClick={() => handleStripeCheckout('portfolio')}
                    className="w-full btn-forest text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest text-center"
                  >
                    Pay with Card (Stripe)
                  </button>
                  <form onSubmit={(e) => handleUPIConfirm(e, 'portfolio')} className="p-4 bg-sand border border-bordercolor rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-forest">Pay via UPI (GPay/PhonePe)</h4>
                    <p className="text-[10px] text-textmuted">Transfer to UPI ID: <strong>rc@upi</strong> and input Transaction ID below:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Transaction ID / Ref No"
                        required
                        value={upiTxId}
                        onChange={(e) => setUpiTxId(e.target.value)}
                        className="flex-grow px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={upiLoading}
                        className="bg-forest text-white px-4 rounded-xl text-xs font-bold uppercase tracking-widest"
                      >
                        Confirm
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
