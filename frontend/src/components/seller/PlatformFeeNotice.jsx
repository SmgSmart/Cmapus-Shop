// Component to display platform fee information to sellers
import React from 'react';
import { Info, Calculator, DollarSign, TrendingUp } from 'lucide-react';

function PlatformFeeNotice({ isVisible, onClose, basePrice = 100 }) {
  const PLATFORM_FEE_PERCENTAGE = 7.5; // 7.5% platform fee
  const platformFee = (basePrice * PLATFORM_FEE_PERCENTAGE) / 100;
  const displayPrice = basePrice + platformFee;

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-600 mt-1" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Platform Fee Information
          </h3>
          <div className="text-sm text-blue-700 space-y-3">
            <p>
              <strong>Good news!</strong> There are no listing fees or upfront charges to post your products on our platform.
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                How Our Pricing Works:
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Your Product Price:</span>
                  <span className="font-medium">₵{basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-600">
                  <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%):</span>
                  <span className="font-medium">+₵{platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center font-semibold text-gray-900">
                    <span>Customer Sees:</span>
                    <span>₵{displayPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                What This Means:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You receive <strong>100% of your listed price</strong></li>
                <li>Platform fee is automatically added to customer price</li>
                <li>Fee covers payment processing, hosting, and platform maintenance</li>
                <li>Transparent pricing - customers see total price upfront</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-800 text-sm">
                <strong>💡 Pro Tip:</strong> Price your products competitively knowing that our small platform fee 
                helps us provide you with secure payments, marketing exposure, and 24/7 customer support.
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              I understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Price calculator component for real-time fee display
export function PriceCalculator({ basePrice, onChange, className = "" }) {
  const PLATFORM_FEE_PERCENTAGE = 7.5;
  const platformFee = basePrice ? (parseFloat(basePrice) * PLATFORM_FEE_PERCENTAGE) / 100 : 0;
  const displayPrice = basePrice ? parseFloat(basePrice) + platformFee : 0;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <Calculator className="h-4 w-4 mr-2" />
        Price Breakdown
      </h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Your Price:</span>
          <span className="font-medium">₵{basePrice ? parseFloat(basePrice).toFixed(2) : '0.00'}</span>
        </div>
        
        <div className="flex justify-between text-blue-600">
          <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%):</span>
          <span className="font-medium">+₵{platformFee.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Customer Price:</span>
            <span>₵{displayPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        This is the price customers will see and pay
      </div>
    </div>
  );
}

export default PlatformFeeNotice;