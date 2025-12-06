import React, { useState } from "react";

import "./Login.css";
import axios from 'axios';
import Cookies from "js-cookie";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./authContext";

const Login = () => {
    const BASE_URL = 'http://localhost:5001';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {email, password}
      );

      if (response.data.token) {
        Cookies.set("refreshToken",response.data.refreshToken,{secure:true})
        Cookies.set("jwtToken", response.data.token, { secure: true });

        // toast.success("Login successful", {
        //   autoClose: 3000,
        //   theme: "dark",
        // });

        secureLocalStorage.setItem("id", response.data.id);
        secureLocalStorage.setItem("name", response.data.username);
        secureLocalStorage.setItem("email", response.data.email);

        await fetchUserDetails(response.data.id);

        console.log("login successfull");
        setAuthenticated(true);

      } else if (response.data.error) {
        console.log(response.data.error);
      }
    } catch (err) {
      console.error("Login error: ", err);
    }
  };

  const fetchUserDetails = async (userId) => {
      try {
        const token = Cookies.get("jwtToken");
        if (!token) throw new Error("JWT token not found");
  
        const response = await axios.get(
          `${BASE_URL}/user/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        secureLocalStorage.setItem("userDetails", JSON.stringify(response.data));
  
        const isProfileDone = response.data?.isProfileDone;
        navigate("/dashboard");
        
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
            placeholder="Enter email"
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default Login;
