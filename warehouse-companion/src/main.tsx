import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// The <BrowserRouter> must wrap the entire App to provide the routing context
// necessary for hooks like useLocation(), useNavigate(), and useParams().
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
