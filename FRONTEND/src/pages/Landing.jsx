import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  // Disable scroll for this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="relative w-full max-w-md p-10 overflow-hidden bg-white shadow-2xl rounded-3xl">
        {/* Decorative Gradient Circles */}
        <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20 blur-3xl"></div>
        <div className="absolute w-56 h-56 rounded-full -bottom-16 -left-16 bg-gradient-to-bl from-indigo-400 to-blue-500 opacity-20 blur-3xl"></div>

        <h1 className="mb-10 text-4xl font-extrabold text-center text-indigo-700">
          Welcome to Quotation System
        </h1>

        <div className="flex flex-col gap-5">
          <Link
            to="/login"
            className="py-3 font-semibold text-center text-white bg-indigo-600 shadow-lg rounded-2xl hover:bg-indigo-700 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="py-3 font-semibold text-center text-indigo-600 bg-indigo-100 shadow-lg rounded-2xl hover:bg-indigo-200 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Quotation System. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
