import { Calculator, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { href: '#calculators', label: 'All Calculators' },
    { href: '#how-to-use', label: 'How to Use' },
    { href: '#benefits', label: 'Benefits' },
  ];

  const popularTools = [
    { href: '/calculator/flooring-cost', label: 'Cost Calculator' },
    { href: '/calculator/square-footage', label: 'Square Footage' },
    { href: '/calculator/tile', label: 'Tile Calculator' },
    { href: '/calculator/hardwood', label: 'Hardwood Calculator' },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="text-2xl text-primary" size={28} />
              <h3 className="text-xl font-bold">FlooringCalc Pro</h3>
            </div>
            <p className="text-gray-300">
              Professional flooring calculators for contractors and DIY enthusiasts.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Tools</h4>
            <ul className="space-y-2 text-gray-300">
              {popularTools.map((tool) => (
                <li key={tool.href}>
                  <a href={tool.href} className="hover:text-white transition-colors">
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <Mail size={16} className="mr-2" />
                info@flooringcalc.pro
              </p>
              <p className="flex items-center">
                <Phone size={16} className="mr-2" />
                +1 (555) 123-4567
              </p>
              <p className="flex items-center">
                <MapPin size={16} className="mr-2" />
                Professional Support
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FlooringCalc Pro. All rights reserved. Professional flooring calculation tools.</p>
        </div>
      </div>
    </footer>
  );
}
