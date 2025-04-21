import InputField from "../../components/InputField/InputField";
const Login = () => {
  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.appInfo}>
          <a style={styles.brandGradient}>TechXchange</a>
        </div>
        <div style={styles.navContent}>
          <a style={styles.login}>Login</a>
        </div>
      </nav>{" "}
      <div style={styles.content}>
        <div style={styles.leftOutlined}>
          <h1>Your gateway to top tech at unbeatable prices</h1>
        </div>
        <div style={styles.rightOutlined}>
          <div style={styles.LoginForm}>
            <h2 style={styles.loginTitle}>Login</h2>
            <InputField
              placeholder="Email"
              className="email"
              style={styles.inputField}
            />
            <InputField
              placeholder="Password"
              type="password"
              className="password"
              style={styles.inputField}
            />
            <button style={styles.loginButton}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#353535",
    height: "8vh",
    gap: "1vw",
    width: "100vw",
  },
  navContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1200px",
  },
  appInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: "2vw",
  },
  brandGradient: {
    fontWeight: "bold",
    background: "linear-gradient(to right, #D2B3F0, #F4B5C6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: "clamp(16px, 4vw, 24px)",
    whiteSpace: "nowrap",
  },
  login: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: "clamp(12px, 4vw, 24px)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    background: "radial-gradient(ellipse at center, #a689bf, #0a0a0a)",
  },
  content: {
    color: "white",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100vw",
    height: "50vh",
  },
  leftOutlined: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "50vw",
  },
  rightOutlined: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "50vw",
  },
  LoginForm: {
    backgroundColor: "#1f1b24",
    padding: "36px",
    borderRadius: "12px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 0 15px rgba(192, 132, 252, 0.3)",
    gap: "16px",
  },

  loginTitle: {
    color: "white",
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "24px",
    textAlign: "left",
  },

  inputField: {
    width: "90%",
  },

  loginButton: {
    marginTop: "24px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#c084fc",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};
