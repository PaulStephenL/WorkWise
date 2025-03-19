import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#101d42] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-6 w-6" />
              <span className="text-lg font-bold">WorkWise</span>
            </div>
            <p className="text-sm text-gray-300">
              Connecting talent with opportunities, making every career move count.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#ffdde2]">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#ffdde2]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#ffdde2]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-[#ffdde2]">Post a Job</Link></li>
              <li><Link to="/about" className="hover:text-[#ffdde2]">Find Talent</Link></li>
              <li><Link to="/contact" className="hover:text-[#ffdde2]">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@workwise.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Business Ave, Suite 100<br />San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} WorkWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;