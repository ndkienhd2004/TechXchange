import React, { useState } from "react";
import "./InputField.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
const InputField = ({
  placeholder,
  style,
  value,
  onChange,
  error,
  onKeyDown,
  type,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && !showPassword ? "password" : "text";

  return (
    <div style={{ position: "relative", ...style }}>
      <input
        type={inputType}
        autoComplete="off"
        name="text"
        className={`input ${error ? "error" : ""}`}
        placeholder={placeholder}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      {isPassword && (
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          style={styles.eyeIcon}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </span>
      )}
      {error && <p style={styles.errorText}>{error}</p>}{" "}
    </div>
  );
};

export default InputField;

const styles = {
  input: {
    border: "none",
    outline: "none",
    borderRadius: "15px",
    padding: "1em",
    backgroundColor: "#ccc",
    boxShadow: "inset 2px 5px 10px rgba(0,0,0,0.3)",
    transition: "300ms ease-in-out",
    width: "100%",
    color: "#000",
  },
  inputError: {
    border: "2px solid red",
    boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)",
  },
  errorText: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "bold",
    textAlign: "left",
  },
  eyeIcon: {
    position: "absolute",
    right: "-10px",
    top: "64%",
    transform: "translateY(-50%)",
    fontSize: "1.2em",
    cursor: "pointer",
    color: "#555",
  },
};
