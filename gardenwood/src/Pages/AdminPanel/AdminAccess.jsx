import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAccess() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAccess = async () => {
    try {
      const response = await fetch(`${window.BASE_URL}/api/admin/product/validate`, {
        headers: {
          "X-API-KEY": apiKey
        }
      });
console.log(apiKey);
      if (response.ok) {
        localStorage.setItem("adminKey", apiKey);
        localStorage.setItem('adminAccess', 'true');
        navigate("/adminpanel/dashboard");
      } else {
        setError("Invalid API Key");
      }
    } catch (err) {
      setError("ERR_CONNECTION_REFUSED");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel Login</h2>
      <input
        type="password"
        placeholder="Please Api Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ padding: "0.5rem", width: "300px", marginBottom: "1rem" }}
      />
      <br />
      <button onClick={handleAccess} style={{ padding: "0.5rem 1rem" }}>
        Sign in
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AdminAccess;
