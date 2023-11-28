import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
    role: "",
  });
  const [formValue, setFormValue] = useState({
    warehouse: "",
  });
  const { email, password, username, role } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:4000/signup",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        if(inputValue.role === "seller"){
          function getLocation() {
            navigator.geolocation.getCurrentPosition(async (position) =>{
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              try{
                const res = await axios.post('http://localhost:4000/seller-location', {
                  email: inputValue.email,
                  location: {
                    type: 'Point',
                    coordinates: [latitude, longitude],
                  }
                });
              }
              catch (error) {
                console.log(error);
              }
            });
          }
          getLocation();
        }

        else if(inputValue.role === "buyer"){
          function getLocation() {
            navigator.geolocation.getCurrentPosition(async (position) =>{
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              try{
                const res = await axios.post('http://localhost:4000/buyer-location', {
                  email: inputValue.email,
                  location: {
                    type: 'Point',
                    coordinates: [latitude, longitude],
                  }
                });
              }
              catch (error) {
                console.log(error);
              }
            });
          }
          getLocation();
        }

        else if(inputValue.role === "manager"){
          function getLocation() {
            navigator.geolocation.getCurrentPosition(async (position) =>{
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              try{
                const res = await axios.post('http://localhost:4000/manager-location', {
                  email: inputValue.email,
                  location: {
                    type: 'Point',
                    coordinates: [latitude, longitude],
                  }
                });
              }
              catch (error) {
                console.log(error);
              }
            });
          }
          getLocation();
        }

        handleSuccess(message);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
      username: "",
      role: "",
    });
  };

  return (
    <div className="form_container">
      <h2>Signup Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="email">Username</label>
          <input
            type="text"
            name="username"
            value={username}
            placeholder="Enter your username"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label>Role</label>
          <select
            name="role"
            value={role}
            onChange={handleOnChange}
          >
            <option></option>
            <option value="seller">Seller</option>
            <option value="manager">Manager</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
        <button type="submit">Submit</button>
        <span>
          Already have an account? <Link to={"/login"}>Login</Link>
        </span>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;