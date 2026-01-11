export default function Footer() {
  return (
    <footer className="bg-adinkra-bg text-white py-6 mt-10">
      <div className="max-w-screen-xl mx-auto px-4 text-center text-sm">
        © {new Date().getFullYear()} Adinkra Media. All rights reserved.
      </div>
    </footer>
  );
}
