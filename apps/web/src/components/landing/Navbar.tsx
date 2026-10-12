import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚌</span>

          <div>
            <h1 className="text-xl font-bold text-blue-600">
              Smart Bus Tracking
            </h1>

            <p className="text-xs text-gray-500">
              Student Transportation Platform
            </p>
          </div>
        </div>

        {/* Menu */}

        <div className="hidden md:flex gap-8">

          <a href="#" className="hover:text-blue-600">
            Home
          </a>

          <a href="#" className="hover:text-blue-600">
            Features
          </a>

          <a href="#" className="hover:text-blue-600">
            About
          </a>

          <a href="#" className="hover:text-blue-600">
            Contact
          </a>

        </div>

        <Link
  to="/login"
  className="bg-blue-600 text-white px-6 py-3 rounded-lg"
>
  Login
</Link>

      </div>
    </nav>
  );
}

export default Navbar;