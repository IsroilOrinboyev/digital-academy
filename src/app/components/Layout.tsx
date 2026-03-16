import { Outlet } from 'react-router';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Digital Academy Business</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Teach on Digital Academy</a></li>
                <li><a href="#" className="hover:text-white">Get the app</a></li>
                <li><a href="#" className="hover:text-white">About us</a></li>
                <li><a href="#" className="hover:text-white">Contact us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Careers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Help and Support</a></li>
                <li><a href="#" className="hover:text-white">Affiliate</a></li>
                <li><a href="#" className="hover:text-white">Investors</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Terms</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Cookie Settings</a></li>
                <li><a href="#" className="hover:text-white">Sitemap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Forums</a></li>
                <li><a href="#" className="hover:text-white">Language</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xl font-bold">D</span>
              </div>
              <span className="font-bold text-xl">Digital Academy</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 Digital Academy, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}