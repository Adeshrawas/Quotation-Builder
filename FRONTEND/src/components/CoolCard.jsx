import React from 'react';

function CoolCard({ title, children }) {
  return (
    <div className="flex justify-center p-8">
      <div className="max-w-lg p-8 transition duration-300 bg-white shadow-2xl rounded-xl hover:shadow-cyan-400/50">
        <h2 className="pb-2 mb-4 text-3xl font-bold text-indigo-700 border-b-2 border-indigo-200">
          {title}
        </h2>
        <p className="leading-relaxed text-gray-600">{children}</p>
        <button className="px-6 py-2 mt-6 font-semibold text-white transition duration-150 bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg">
          Learn More
        </button>
      </div>
    </div>
  );
}

export default CoolCard;
