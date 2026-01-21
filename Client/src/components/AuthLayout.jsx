// components/AuthLayout.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-green-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col  overflow-y-scroll no-scrollbar py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">ReadCycle</span>
          </div>
          
          <div className="mt-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            </div>

            <div className="mt-8 ">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-green-600 to-blue-600 opacity-90"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <BookOpen className="h-24 w-24 mx-auto mb-8 opacity-80" />
            <h3 className="text-4xl font-bold mb-4">Join the ReadCycle Community</h3>
            <p className="text-xl opacity-90">
              Connect with fellow students, save money on textbooks, and promote sustainability through book sharing.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-8 opacity-80">
              {[
                { stat: '10K+', label: 'Students' },
                { stat: '$2M+', label: 'Saved' },
                { stat: '50K+', label: 'Books' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold">{item.stat}</div>
                  <div className="text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;