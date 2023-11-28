import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies([]);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  useEffect(() => {
    const verifyCookie = async () => {
      if (!cookies.token) {
        navigate("/login");
      } else {
        try {
          const { data } = await axios.post(
            "http://localhost:4000",
            {},
            { withCredentials: true }
          );

          const { status, user, role: userRole } = data;

          if (status) {
            setUsername(user);
            setRole(userRole);

            // Use string interpolation for the query parameter
            const usernameQueryParam = `?username=${user}`;

            // Redirect based on the user's role
            if (userRole === "buyer") {
              navigate("/buyer-home" + usernameQueryParam);
            } else if (userRole === "seller") {
              navigate("/seller-home" + usernameQueryParam);
            } else if (userRole === "manager") {
              navigate("/manager-home" + usernameQueryParam);
            }

            // Display a welcome toast
            toast(`Hello ${user}`, {
              position: "top-right",
            });
          } else {
            // If the server indicates a failure, remove the token and redirect to login
            removeCookie("token");
            navigate("/login");
          }
        } catch (error) {
          // Handle any errors that occur during the axios request
          console.error(error);
          removeCookie("token");
          navigate("/login");
        }
      }
    };
    verifyCookie();
  }, [cookies, navigate, removeCookie]);
  const Logout = () => {
    removeCookie("token");
    navigate("/signup");
  };
};

export default Home;