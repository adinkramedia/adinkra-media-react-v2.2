export default function Footer() {
  return (
    <footer className="bg-adinkra-bg text-adinkra-gold py-12">
      <div className="max-w-screen-xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-4">Adinkra Media</h3>
          <p className="text-sm text-adinkra-gold/80 leading-relaxed">
            Professional audio production for media, film, advertising, and digital projects. Custom music, sound design, mixing, and mastering tailored to your vision.
          </p>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-bold mb-4">Services</h3>
          <ul className="space-y-2 text-sm text-adinkra-gold/80">
            <li>• Custom Music Composition</li>
            <li>• Film Scoring & Foley</li>
            <li>• Sound Design & Editing</li>
            <li>• Mixing & Mastering</li>
            <li>• Audio Consulting</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>
          <p className="text-sm text-adinkra-gold/80">
            Email: <a href="mailto:info@adinkramedia.com" className="underline hover:text-adinkra-highlight">info@adinkramedia.com</a>
          </p>
          <p className="text-sm text-adinkra-gold/80">Phone: +27 72 076 1243</p>
          <p className="text-sm text-adinkra-gold/80">Johannesburg, South Africa</p>
        </div>
      </div>

      <div className="mt-8 border-t border-adinkra-gold/30 pt-4 text-center text-sm text-adinkra-gold/60">
        © {new Date().getFullYear()} Adinkra Media Pty LTD. All rights reserved.
      </div>
    </footer>
  );
}