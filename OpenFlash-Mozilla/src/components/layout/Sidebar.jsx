import { Plus, Library, Sun, Moon, User, HelpCircle, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { id: 'create', icon: Plus, title: 'Create Set', href: '/create' },
    { id: 'library', icon: Library, title: 'Library', href: '/' },
    { id: 'daily', icon: Clock, title: 'Daily Review', href: '/daily' },
  ];

  return (
    <aside className="w-20 flex-shrink-0 flex flex-col items-center py-6 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen sticky top-0">
      <div className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.id}
              to={item.href}
              title={item.title}
              className={`p-3 rounded-xl transition-all duration-300 group ${
                item.id === 'create'
                  ? 'bg-yellow-400 text-neutral-900 hover:bg-yellow-300 shadow-lg shadow-yellow-400/20'
                  : isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-yellow-600 dark:text-yellow-400 border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              <item.icon size={24} className={item.id === 'create' ? 'stroke-[2.5px]' : 'stroke-2'} />
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-3 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-300 transition-all duration-300"
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>

        <Link
          to="/help"
          title="Help & Support"
          className={`p-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/help'
              ? 'bg-neutral-100 dark:bg-neutral-800 text-yellow-600 dark:text-yellow-400 border border-neutral-200 dark:border-neutral-700'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-300'
          }`}
        >
          <HelpCircle size={24} />
        </Link>


        <Link
          to="/account"
          title="Account"
          className={`p-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/account'
              ? 'bg-neutral-100 dark:bg-neutral-800 text-yellow-600 dark:text-yellow-400 border border-neutral-200 dark:border-neutral-700'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-300'
          }`}
        >
          <User size={24} />
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
