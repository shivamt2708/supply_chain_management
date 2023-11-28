import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

const CreateShipment = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    buyer_email: "",
    duration: 0,
    product_id: 0,
  });
  const { buyer_email, duration, product_id } = inputValue;
  const location = useLocation();
  const [cookies, removeCookie] = useCookies([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Parse the query parameters to get the username
    const searchParams = new URLSearchParams(location.search);
    const usernameFromParams = searchParams.get("username");
    setUsername(usernameFromParams);
  }, [location.search]);
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
      position: "bottom-left",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await axios.post(
        "http://localhost:4000/seller/create-shipment",
        {
            sender_email: username,
          ...inputValue,
        },
        { withCredentials: true }
      );
      if(data.status === 201){
        const usernameQueryParam = `?username=${username}`;
        navigate("/seller-home" + usernameQueryParam);
      }
      else if(data.status === 202){
        const { message } = data;
        window.alert('Shipment not possible');
        const usernameQueryParam = `?username=${username}`;
        navigate("/seller-home" + usernameQueryParam);
      }
      console.log(data);
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      buyer_email: "",
      duration: 0,
      product_id: 0,
    });
  };

  return (
    <div className="form_container">
      <h2>Create Shipment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="buyer_email">Buyer's Email</label>
          <input
            type="email"
            name="buyer_email"
            value={buyer_email}
            placeholder="Enter buyer's email"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="duration">duration (in days)</label>
          <input
            type="number"
            name="duration"
            value={duration}
            placeholder="Enter duration in days"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="product_id">Product Id</label>
          <input
            type="number"
            name="product_id"
            value={product_id}
            placeholder="Enter Product Id"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateShipment;