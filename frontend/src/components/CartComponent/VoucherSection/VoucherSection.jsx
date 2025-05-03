// VoucherSection.js
import React, { useState } from "react";

import { Gift, X } from "lucide-react";
import "./VoucherSection.css"; // Import CSS riêng cho VoucherSection

const VoucherSection = ({
  onApplyVoucher,
  appliedVoucher,
  onRemoveVoucher,
}) => {
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);

  const handleApply = () => {
    onApplyVoucher(voucherCode);
    setVoucherCode(""); // Clear input after applying
    setShowVoucherInput(false);
  };

  return (
    <div className="voucher-section">
      <div className="voucher-header">
        <h2 className="voucher-title">
          <Gift className="w-5 h-5" />
          Khuyến mãi
        </h2>
        {appliedVoucher && (
          <div className="applied-voucher">
            <span className="applied-voucher-text">
              Đã áp dụng: {appliedVoucher.code}
            </span>
            <button
              variant="ghost"
              size="icon"
              onClick={onRemoveVoucher}
              className="remove-voucher-button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!showVoucherInput && !appliedVoucher && (
        <button
          variant="outline"
          size="sm"
          onClick={() => setShowVoucherInput(true)}
          className="w-full"
        >
          Nhập mã giảm giá
        </button>
      )}

      {showVoucherInput && (
        <div className="voucher-input-group">
          <div className="flex-1">
            <label htmlFor="voucher-code" className="sr-only">
              Mã giảm giá
            </label>
            <input
              id="voucher-code"
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full"
            />
          </div>
          <button
            size="sm"
            onClick={handleApply}
            disabled={!voucherCode.trim()}
            className="whitespace-nowrap"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
};

export default VoucherSection;
