// Footer.jsx

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-adinkra-bg text-adinkra-gold py-12">
      <div className="max-w-screen-xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-4">Adinkra Media</h3>

          <p className="text-sm text-adinkra-gold/80 leading-relaxed">
            Professional audio production and post-production for film,
            television, advertising, gaming, broadcast, and digital media.
          </p>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-bold mb-4">Services</h3>

          <ul className="space-y-2 text-sm text-adinkra-gold/80">
            <li>Custom Music Production</li>
            <li>Film Scoring</li>
            <li>Sound Design &amp; Foley</li>
            <li>Audio Post-Production</li>
            <li>Mixing &amp; Mastering</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>

          <p className="text-sm text-adinkra-gold/80">
            Project enquiries:{" "}
            <a
              href="mailto:sales@adinkramedia.com"
              className="underline hover:text-adinkra-highlight transition-colors"
            >
              sales@adinkramedia.com
            </a>
          </p>

          <p className="text-sm text-adinkra-gold/80 mt-2">
            Phone: +27 72 076 1243
          </p>

          <p className="text-sm text-adinkra-gold/80 mt-2">
            Johannesburg, South Africa
          </p>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xl font-bold mb-4">Legal</h3>

          <ul className="space-y-2 text-sm text-adinkra-gold/80">
            <li>
              <Link
                to="/terms"
                className="hover:text-adinkra-highlight hover:underline transition-colors"
              >
                Terms of Service
              </Link>
            </li>

            <li>
              <Link
                to="/privacy"
                className="hover:text-adinkra-highlight hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link
                to="/refunds"
                className="hover:text-adinkra-highlight hover:underline transition-colors"
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 border-t border-adinkra-gold/30 pt-4 text-center text-sm text-adinkra-gold/60">
        © {new Date().getFullYear()} Adinkra Media Pty Ltd. All rights reserved.
      </div>
    </footer>
  );
}