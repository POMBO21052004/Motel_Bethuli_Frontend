import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X, UserCircle, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isFr = i18n.language.startsWith('fr');

  const toggleLanguage = () => {
    const newLang = isFr ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine the dashboard route based on role
  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'receptionniste': return '/reception/dashboard';
      default: return '/client/dashboard';
    }
  };

  const getDashboardLabel = () => {
    switch (user?.role) {
      case 'admin': return isFr ? 'Espace Admin' : 'Admin Space';
      case 'receptionniste': return isFr ? 'Espace Réception' : 'Reception Space';
      default: return isFr ? 'Mon Espace' : 'My Space';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ---- Auth buttons (Desktop) ----
  const AuthButtons = ({ isMobile = false }) => {
    const base = isMobile ? 'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors' : 'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors';

    if (isAuthenticated && user) {
      return (
        <div className={isMobile ? 'space-y-3' : 'flex items-center gap-3'}>
          {/* User name chip */}
          {!isMobile && (
            <span className="text-sm font-medium text-slate-600">
              {isFr ? 'Bonjour,' : 'Hello,'} <span className="text-amber-600 font-semibold">{user.prenom}</span>
            </span>
          )}
          <Link
            to={getDashboardPath()}
            className={`${base} bg-amber-500 text-white hover:bg-amber-600 shadow-sm`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {getDashboardLabel()}
          </Link>
          <button
            onClick={handleLogout}
            className={`${base} border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-red-500 hover:border-red-300`}
          >
            <LogOut className="h-4 w-4" />
            {isFr ? 'Déconnexion' : 'Logout'}
          </button>
        </div>
      );
    }

    return (
      <div className={isMobile ? 'space-y-3' : 'flex items-center gap-3'}>
        <Link
          to="/login"
          className={`${base} border border-amber-500 text-amber-600 hover:bg-amber-50`}
        >
          <UserCircle className="h-4 w-4" />
          {isFr ? 'Se connecter' : 'Login'}
        </Link>
        <Link
          to="/register"
          className={`${base} bg-amber-500 text-white hover:bg-amber-600 shadow-sm`}
        >
          <UserPlus className="h-4 w-4" />
          {isFr ? "S'inscrire" : 'Register'}
        </Link>
      </div>
    );
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-serif font-bold text-slate-800">
                  Motel <span className="text-amber-500">Bethuli</span>
                </span>
              </Link>
              {/* Desktop Nav Links */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                {[
                  { to: '/', label: t('home') },
                  { to: '/rooms', label: t('rooms') },
                  { to: '/about', label: t('about') },
                  { to: '/contact', label: t('contact') },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      location.pathname === to
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-600 hover:border-amber-400 hover:text-amber-500'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden sm:flex sm:items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 text-gray-500 hover:text-amber-500 transition-colors px-2 py-1 rounded-md hover:bg-amber-50"
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs font-semibold">{i18n.language.substring(0, 2)}</span>
              </button>
              <AuthButtons />
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-50 sm:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Sidebar — slides from the RIGHT */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out sm:hidden flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
          <span className="text-xl font-serif font-bold text-slate-800">
            Motel <span className="text-amber-500">Bethuli</span>
          </span>
          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 focus:outline-none"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Sidebar greeting if logged in */}
        {isAuthenticated && user && (
          <div className="px-4 pt-4 pb-2">
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-700 font-medium">
                {isFr ? 'Connecté en tant que' : 'Logged in as'}
              </p>
              <p className="text-sm font-bold text-amber-900">{user.prenom} {user.nom}</p>
              <p className="text-[10px] text-amber-600 capitalize">{user.role}</p>
            </div>
          </div>
        )}

        {/* Sidebar Links */}
        <div className="px-4 pt-4 pb-6 space-y-1 flex-grow overflow-y-auto">
          {[
            { to: '/', label: t('home') },
            { to: '/rooms', label: t('rooms') },
            { to: '/about', label: t('about') },
            { to: '/contact', label: t('contact') },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-800 hover:text-amber-500 hover:bg-amber-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 text-slate-700 hover:text-amber-500 transition-colors w-full px-3 py-2.5 rounded-md hover:bg-amber-50 font-medium"
          >
            <Globe className="h-5 w-5" />
            <span>Langue ({i18n.language.substring(0, 2).toUpperCase()})</span>
          </button>
          <AuthButtons isMobile={true} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
