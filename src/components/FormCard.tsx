
import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

const FormCard: React.FC<FormCardProps> = ({ children, icon, title, subtitle }) => (
  <div className="bg-light-bg-secondary/70 dark:bg-dark-bg-secondary/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 space-y-4">
    <div className="flex items-start space-x-4 text-gray-800 dark:text-gray-200">
      <div className="flex-shrink-0 w-6 h-6 opacity-80">{icon}</div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">{subtitle}</p>}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

export default FormCard;
