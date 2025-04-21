import "./Button.css";

const Button = ({ placeHolder, onClick }) => {
  return (
    <button className="btn" onClick={onClick}>
      {placeHolder}
    </button>
  );
};
export default Button;
