import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

const GetProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [shipments, setShipments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const usernameFromParams = searchParams.get("product_id");
    setUsername(usernameFromParams);
    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/get-product?product_id=${username}`);
            const { success, shipments } = response.data;

            if (success) {
            setShipments(shipments); 
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching shipments", { position: "bottom-left" });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [username]);


return (
    <div style={{ width: '100%' }}>
      <h1>Product Details</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
            <th>sender's email</th>
              <th>price</th>
              <th>product name</th>
              <th>product id</th>
            </tr>
          </thead>
          <tbody>
              <tr>
              <td>{shipments.sender_email}</td>
                <td>{shipments.price}</td>
                <td>{shipments.name}</td>
                <td>{shipments.product_id}</td>
              </tr>
          </tbody>
        </table>
      )}
      <ToastContainer />
    </div>
  );
};

export default GetProduct;