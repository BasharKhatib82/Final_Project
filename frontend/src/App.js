import { BrowserRouter } from "react-router-dom";
import MyRoutes from "./components/MyRoutes";
import { UserProvider } from "./components/Tools/UserContext";
import useInactivityLogout from "./utils/useInactivityLogout.js";



function App() {
  useInactivityLogout();

  return (
    <BrowserRouter>
      <UserProvider>
        <MyRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
