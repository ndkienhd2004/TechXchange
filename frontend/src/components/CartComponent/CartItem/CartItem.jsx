// CartItem.js
import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import "./CartItem.css"; // Import CSS riêng cho CartItem

const CartItem = ({ item, onQuantityChange, onRemove, onCheckboxChange }) => {
  return (
    <div className="cart-item">
      <input
        type="checkbox"
        checked={item.isChecked}
        onChange={(e) => onCheckboxChange(item.id, e.target.checked)}
        className="flex-shrink-0"
      />
      <img src={item.image} alt={item.name} className="item-image" />
      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-options">{item.options}</p>
      </div>
      <div className="item-price">{item.price.toLocaleString()} VNĐ</div>
      <div className="item-quantity">
        <button
          variant="outline"
          size="icon"
          onClick={() =>
            onQuantityChange(item.id, Math.max(1, item.quantity - 1))
          } // prevent negative
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) =>
            onQuantityChange(item.id, parseInt(e.target.value, 10) || 1)
          }
          className="w-16 text-center"
        />
        <button
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="item-total">
        {(item.price * item.quantity).toLocaleString()} VNĐ
      </div>
      <button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        className="remove-button"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CartItem;
