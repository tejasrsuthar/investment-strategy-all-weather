import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, FileText, Briefcase } from 'lucide-react';

export default function AdminPortfolio() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [stocks, setStocks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stockForm, setStockForm] = useState({ id: '', ticker: '', name: '', entry_price: '', target_price: '', stop_loss: '', weightage: '', transaction_type: 'BUY' });
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchStocks();
  }, [token, page]);

  const fetchStocks = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/portfolio?page=${page}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStocks(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    const url = stockForm.id ? `http://localhost:8000/api/portfolio/stocks/${stockForm.id}` : 'http://localhost:8000/api/portfolio/stocks';
    const method = stockForm.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticker: stockForm.ticker,
          name: stockForm.name,
          entry_price: parseFloat(stockForm.entry_price),
          target_price: parseFloat(stockForm.target_price),
          stop_loss: parseFloat(stockForm.stop_loss),
          weightage: parseFloat(stockForm.weightage),
          transaction_type: stockForm.transaction_type
        })
      });
      if (res.ok) {
        showToast("Stock Saved", `Stock has been successfully ${stockForm.id ? 'updated' : 'added'} to portfolio.`, "success");
        setStockForm({ id: '', ticker: '', name: '', entry_price: '', target_price: '', stop_loss: '', weightage: '', transaction_type: 'BUY' });
        fetchStocks();
      } else {
        const d = await res.json();
        showToast("Save Failed", d.detail, "error");
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  const handleDeleteStock = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/portfolio/stocks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Deleted", "Stock has been removed from portfolio.", "success");
        fetchStocks();
      } else {
        const d = await res.json();
        showToast("Delete Failed", d.detail, "error");
      }
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Admin Menu Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-forest">Admin Console</h1>
        <div className="flex bg-[#EDEEE9]/50 p-1.5 rounded-full border border-bordercolor text-xs font-bold uppercase tracking-widest text-textmuted gap-2">
          <Link to="/admin/investors" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Users className="w-3.5 h-3.5" /> Investors
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <FileText className="w-3.5 h-3.5" /> Reports
          </Link>
          <Link to="/admin/portfolio" className="flex items-center gap-1.5 bg-forest text-[#FAF9F6] px-5 py-2.5 rounded-full shadow-sm">
            <Briefcase className="w-3.5 h-3.5" /> Portfolio
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-forest">Stocks Portfolio</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-bordercolor text-textmuted uppercase tracking-widest">
                    <th className="py-2">Stock</th>
                    <th className="py-2">Prices</th>
                    <th className="py-2">Weight</th>
                    <th className="py-2">Type</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-semibold">
                  {stocks.map((stock) => (
                    <tr key={stock.id} className="border-b border-bordercolor/40">
                      <td className="py-3">
                        <span className="block font-bold text-forest">{stock.ticker}</span>
                        <span className="text-[10px] text-textmuted font-normal">{stock.name}</span>
                      </td>
                      <td className="py-3">
                        <span className="block">Buy: ₹{stock.entry_price}</span>
                        <span className="block text-[10px] text-green-700">Tgt: ₹{stock.target_price}</span>
                        <span className="block text-[10px] text-red-600">SL: ₹{stock.stop_loss}</span>
                      </td>
                      <td className="py-3">{stock.weightage}%</td>
                      <td className="py-3 capitalize">{stock.transaction_type}</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => setStockForm(stock)}
                          className="bg-transparent border border-bordercolor text-forest px-2 py-1 rounded text-[10px] font-bold uppercase hover:bg-sage/20 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              show: true,
                              message: `Are you sure you want to remove ${stock.ticker} from the model portfolio?`,
                              onConfirm: () => {
                                handleDeleteStock(stock.id);
                                setConfirmModal({ show: false, message: '', onConfirm: null });
                              }
                            });
                          }}
                          className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase hover:bg-red-700 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-textmuted">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-transparent border border-bordercolor px-4 py-2.5 rounded-full hover:bg-sand transition-colors disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-transparent border border-bordercolor px-4 py-2.5 rounded-full hover:bg-sand transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Form Card */}
        <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-6 text-forest">{stockForm.id ? 'Edit Stock' : 'Add Stock'}</h3>
          <form onSubmit={handleSaveStock} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-0.5">Ticker</label>
              <input
                type="text"
                required
                placeholder="e.g. RELIANCE"
                value={stockForm.ticker}
                onChange={(e) => setStockForm({ ...stockForm, ticker: e.target.value })}
                className="w-full px-3 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-0.5">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Reliance Industries"
                value={stockForm.name}
                onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textmuted mb-0.5">Entry (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stockForm.entry_price}
                  onChange={(e) => setStockForm({ ...stockForm, entry_price: e.target.value })}
                  className="w-full px-2 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textmuted mb-0.5">Target (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stockForm.target_price}
                  onChange={(e) => setStockForm({ ...stockForm, target_price: e.target.value })}
                  className="w-full px-2 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textmuted mb-0.5">SL (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stockForm.stop_loss}
                  onChange={(e) => setStockForm({ ...stockForm, stop_loss: e.target.value })}
                  className="w-full px-2 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textmuted mb-0.5">Weight (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stockForm.weightage}
                  onChange={(e) => setStockForm({ ...stockForm, weightage: e.target.value })}
                  className="w-full px-2 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textmuted mb-0.5">Action</label>
                <select
                  value={stockForm.transaction_type}
                  onChange={(e) => setStockForm({ ...stockForm, transaction_type: e.target.value })}
                  className="w-full px-2 py-2 bg-sand border border-bordercolor rounded-xl focus:outline-none text-xs font-bold"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full btn-forest text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest mt-2 hover:bg-forest-hover transition-all"
            >
              {stockForm.id ? 'Update Stock' : 'Add Stock'}
            </button>
            {stockForm.id && (
              <button
                type="button"
                onClick={() => setStockForm({ id: '', ticker: '', name: '', entry_price: '', target_price: '', stop_loss: '', weightage: '', transaction_type: 'BUY' })}
                className="w-full bg-transparent text-textmuted py-1 text-xs font-bold uppercase hover:underline"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50 justify-end">
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white border border-bordercolor shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-xs font-bold text-forest uppercase tracking-wider">{notification.title}</p>
                  <p className="mt-1 text-sm text-textmuted">{notification.message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className="inline-flex rounded-md bg-white text-textmuted hover:text-forest focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* React Frontend Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-sm shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 animate-pulse">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-forest mb-2">Confirm Delete</h3>
            <p className="text-xs text-textmuted mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                className="px-5 py-2.5 bg-transparent border border-bordercolor text-textmuted rounded-full text-xs font-bold uppercase tracking-wider hover:bg-sand transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
