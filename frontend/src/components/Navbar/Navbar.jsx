import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="app-info">
        <a className="brand-gradient">TechXchange</a>
      </div>
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search For Products..."
          className="search-input"
        />
        <select className="category-dropdown">
          <option>ALL Category</option>
          <option>Laptop</option>
          <option>PC</option>
          <option>RAM</option>
          <option>CPU</option>
          <option>Screen</option>
          <option>Camera</option>
        </select>
      </div>
      <div className="nav-icons">
        <span className="icon">🛒</span>
        <span className="icon">❤️</span>
        <span className="icon account">
          👤 <span className="account-text">My Account</span>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
