import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

const AddProduct = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    price: 0,
    name: "",
  });
  const { price, name } = inputValue;
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
        sender_email: username,
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
        "http://localhost:4000/seller/add-product",
        {
            sender_email: username,
          ...inputValue,
        },
        { withCredentials: true }
      );
      if(data.status === 200){
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
      price: "",
      name: 0,
    });
  };

  return (
    <div className="form_container">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="price">Price</label>
          <input
            type="number"
            name="price"
            value={price}
            placeholder="Enter product's price"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            name="name"
            value={name}
            placeholder="Enter product name"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddProduct;