import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, CreditCard, Truck, MessageCircle, ThumbsUp } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-10 bg-white">
      {/* Services Section */}
      <div className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-pharmacy-primary p-4 text-white mb-4">
                <ThumbsUp size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">High-quality Goods</h3>
              <p className="text-gray-600">Enjoy top quality items for less</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-pharmacy-primary p-4 text-white mb-4">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">24/7 Live chat</h3>
              <p className="text-gray-600">Get instant assistance whenever you need it</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-pharmacy-primary p-4 text-white mb-4">
                <Truck size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Express Shipping</h3>
              <p className="text-gray-600">Fast & reliable delivery options</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-pharmacy-primary p-4 text-white mb-4">
                <CreditCard size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
              <p className="text-gray-600">Multiple safe payment methods</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Pharmacy Care</h3>
              <p className="text-gray-300 mb-4">
                Your trusted source for all pharmaceutical needs. We provide high-quality medicines and health products.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-pharmacy-accent">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-white hover:text-pharmacy-accent">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-white hover:text-pharmacy-accent">
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-white">Products</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-white">FAQ</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={20} className="mr-2 mt-1 flex-shrink-0 text-pharmacy-accent" />
                  <span className="text-gray-300">Basundhara, Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="mr-2 flex-shrink-0 text-pharmacy-accent" />
                  <a href="https://wa.me/01842263370" className="text-gray-300 hover:text-white">01842263370 (WhatsApp)</a>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="mr-2 flex-shrink-0 text-pharmacy-accent" />
                  <span className="text-gray-300">pharmacycare70@gmail.com</span>
                </li>
                <li className="flex items-center">
                  <Clock size={20} className="mr-2 flex-shrink-0 text-pharmacy-accent" />
                  <span className="text-gray-300">Mon - Sat: 9AM - 9PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-900 text-gray-400 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Pharmacy Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;