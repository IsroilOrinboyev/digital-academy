import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, Menu, Heart, Bell, User, LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { categories, courses } from '../data/courses';
import { Badge } from './ui/badge';
import { useCart } from '@/app/store/CartContext';
import { useAuth } from '@/app/store/AuthContext';
import { useWishlist } from '@/app/store/WishlistContext';

export function Header() {
  const navigate = useNavigate();
  const { items } = useCart();
  const { isAuthenticated, user, logout, notifications, markNotificationRead, markAllNotificationsRead } = useAuth();
  const { courseIds } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const cartCount = items.length;
  const wishlistCount = courseIds.length;

  const searchResults = searchQuery.trim()
    ? courses
        .filter(c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchDropdown(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center gap-4 px-6 py-3 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
            <span className="text-white text-xl font-bold">D</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">Digital Academy</span>
        </Link>

        {/* Categories Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hidden lg:flex gap-2">
              <Menu className="w-4 h-4" />
              Categories
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {categories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link to={`/courses?category=${category.id}`} className="flex items-center gap-2 w-full">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search for anything"
            className="w-full pl-11 pr-4 py-2 border-gray-300 focus:border-purple-600"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={handleSearchBlur}
          />
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 mt-1">
              {searchResults.map(course => (
                <button
                  key={course.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b last:border-0"
                  onMouseDown={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                    navigate(`/course/${course.id}`);
                  }}
                >
                  <img src={course.image} alt={course.title} className="w-10 h-8 object-cover rounded flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.instructor}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-purple-600 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {notifications.slice(0, 5).map(notif => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`flex flex-col items-start gap-1 px-4 py-3 cursor-pointer ${!notif.read ? 'bg-purple-50' : ''}`}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.link) navigate(notif.link);
                    }}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1" />}
                      <p className={`text-sm ${!notif.read ? 'font-medium' : 'text-gray-600'} line-clamp-2`}>
                        {notif.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Area */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="w-4 h-4" />
                    My Learning
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'instructor' && (
                  <DropdownMenuItem asChild>
                    <Link to="/instructor" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Instructor Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="border-t bg-gray-50">
        <div className="px-6 py-2 max-w-[1400px] mx-auto overflow-x-auto">
          <div className="flex items-center gap-6 text-sm">
            <Link to="/courses?category=development" className="whitespace-nowrap hover:text-purple-600">
              Development
            </Link>
            <Link to="/courses?category=business" className="whitespace-nowrap hover:text-purple-600">
              Business
            </Link>
            <Link to="/courses?category=design" className="whitespace-nowrap hover:text-purple-600">
              Design
            </Link>
            <Link to="/courses?category=marketing" className="whitespace-nowrap hover:text-purple-600">
              Marketing
            </Link>
            <Link to="/courses?category=photography" className="whitespace-nowrap hover:text-purple-600">
              Photography
            </Link>
            <Link to="/courses?category=music" className="whitespace-nowrap hover:text-purple-600">
              Music
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
