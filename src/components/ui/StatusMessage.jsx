import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

function StatusMessage({ type, message }) {
  if (!message) return null;

  const config = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-700',
      Icon: AlertCircle
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-700',
      Icon: CheckCircle
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-700',
      Icon: Info
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-700',
      Icon: AlertCircle
    }
  };

  const { bgColor, borderColor, textColor, Icon } = config[type] || config.info;

  return (
    <div className={`mb-4 p-4 ${bgColor} border-l-4 ${borderColor} ${textColor} flex items-center`}>
      <Icon className="h-5 w-5 mr-2" />
      <p>{message}</p>
    </div>
  );
}

export default StatusMessage; 