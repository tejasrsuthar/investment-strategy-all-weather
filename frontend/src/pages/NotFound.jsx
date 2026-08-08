import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const dashboardPath = role === 'admin' ? '/admin' : '/investor';

  return (
    <div className="pt-32 pb-24 px-6 flex justify-center items-center min-h-[80vh]">
      <div className="bg-white border border-bordercolor p-10 rounded-3xl max-w-lg w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-sand border border-bordercolor rounded-2xl flex items-center justify-center mx-auto mb-6 text-forest">
          <span className="font-extrabold text-xl">404</span>
        </div>
        <span className="inline-block px-3 py-1 bg-sand border border-bordercolor text-textmuted text-[11px] font-bold uppercase tracking-widest rounded-full mb-3">
          Page Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-forest mb-3">
          Page Lost in the Markets
        </h1>
        <p className="text-sm text-textmuted mb-8 leading-relaxed">
          The requested page <code className="bg-sand px-2 py-0.5 rounded text-forest font-semibold">{location.pathname}</code> does not exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {token && (
            <Link
              to={dashboardPath}
              className="w-full sm:w-auto btn-forest text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center space-x-2"
            >
              <span>Go to Investor Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}

          <Link
            to="/"
            className="w-full sm:w-auto bg-sand border border-bordercolor text-forest px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-sage/30 transition-all flex items-center justify-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
