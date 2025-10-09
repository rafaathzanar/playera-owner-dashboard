import React from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export const AlertDialog = ({ isOpen, onClose, title, message, type = 'info', onConfirm, autoClose = false, autoCloseDelay = 3000 }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-8 w-8 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-8 w-8 text-blue-600" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  // Auto-close functionality
  React.useEffect(() => {
    if (isOpen && autoClose && type === 'success') {
      const timer = setTimeout(() => {
        if (onConfirm) onConfirm();
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onConfirm, onClose, type]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {message}
          </p>
          {autoClose && type === 'success' && (
            <p className="text-xs text-gray-500 mt-2">
              This dialog will close automatically in a few seconds...
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getButtonColor()}`}
          >
            OK
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircleIcon className="h-8 w-8 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-8 w-8 text-blue-600" />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getConfirmButtonColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default Dialog;
