import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Dashboard() {
  const { user, logout } = useAuth();


  return (
    <div>

      <h1>Dashboard</h1>

      <p>
        Welcome, {user?.email}
      </p>

      <p>
        Role: {user?.role}
      </p>


      <hr />


      <div>

        <Link to="/profile">
          <button>
            My Profile
          </button>
        </Link>

      </div>


      <br />


      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}


export default Dashboard;