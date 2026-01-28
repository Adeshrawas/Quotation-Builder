import React from "react";

function CoolCard({ title, children }) {
  // useEffect to ensure the body background is consistent across the app
  React.useEffect(() => {
    document.body.className = "bg-gray-100";
  }, []);

  return (
    /* Removed py-10 and replaced with pt-0 to eliminate the gap with the header */
    <div className="flex justify-center min-h-screen px-6 pt-0 bg-gray-100">
      <div
        className="w-full max-w-lg p-8 transition-all duration-300 bg-white border-x border-b border-gray-200 shadow-sm rounded-b-[2.5rem] hover:border-gray-300"
      >
        <h2
          className="pb-3 mb-5 text-3xl font-black tracking-tight text-teal-900 border-b border-gray-100"
        >
          {title}
        </h2>

        <div className="font-medium leading-relaxed text-gray-600">
          {children}
        </div>

        <button
          className="
            mt-8
            w-full
            px-6 py-4
            font-black
            uppercase
            tracking-widest
            text-white
            bg-teal-900
            rounded-2xl
            transition-all duration-200
            hover:bg-teal-800
            active:scale-[0.98]
          "
        >
          Learn More
        </button>
      </div>
    </div>
  );
}

export default CoolCard;