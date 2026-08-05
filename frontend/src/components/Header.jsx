import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Smallcase', href: '/smallcase' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-sand/85 backdrop-blur-md border-b border-bordercolor" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" aria-label="Raghuvir Consultants Home">
          <div className="w-8 h-8 bg-forest rounded flex items-center justify-center">
            <span className="text-lime font-bold text-xs">RC</span>
          </div>
          <span className="font-bold tracking-tight uppercase text-xs text-forest">Raghuvir Consultants</span>
        </Link>
        
        <div className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-widest">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={isActive ? 'text-forest font-bold transition-colors' : 'text-textmuted hover:text-forest transition-colors'}
              >
                {link.label}
              </Link>
            );
          })}
          {token && (
            <Link
              to={role === 'admin' ? '/admin' : '/investor'}
              className="text-textmuted hover:text-forest font-bold transition-colors"
            >
              {role === 'admin' ? 'Admin Console' : 'Investor Portal'}
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-transparent border border-bordercolor text-forest text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-sage/40 transition-all"
            >
              Logout
            </button>
          ) : (
            location.pathname !== '/login' && (
              <Link
                to="/login"
                className="bg-forest text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-forest-hover transition-all"
              >
                Investor Login
              </Link>
            )
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-forest"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-sand border-t border-bordercolor px-6 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-widest text-textmuted hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
          {token && (
            <Link
              to={role === 'admin' ? '/admin' : '/investor'}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-widest text-textmuted hover:text-forest"
            >
              {role === 'admin' ? 'Admin Console' : 'Investor Portal'}
            </Link>
          )}
          {token ? (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full bg-forest text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full text-center mt-4"
            >
              Logout
            </button>
          ) : (
            location.pathname !== '/login' && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-forest text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full text-center mt-4"
              >
                Investor Login →
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
