import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

const MyShipments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse the query parameters to get the username
    const searchParams = new URLSearchParams(location.search);
    const usernameFromParams = searchParams.get("username");
    setUsername(usernameFromParams);
    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/buyer/my-shipments?buyer_email=${username}`);
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
    <div>
      <h1>Your Shipments</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Sender's Email</th>
              <th>Buyer's Email</th>
              <th>current authority</th>
              <th>next authority</th>
              <th>duration</th>
              <th>Status</th>
              <th>Product Id</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment._id}>
                <td>{shipment.shipment_id}</td>
                <td>{shipment.sender_email}</td>
                <td>{shipment.buyer_email}</td>
                <td>{shipment.current_authority}</td>
                <td>{shipment.next_authority}</td>
                <td>{shipment.duration}</td>
                <td>{shipment.status}</td>
                <td>
                  <span>
                    <Link to={`/get-product?product_id=${shipment.product_id}`}>{shipment.product_id}</Link>
                  </span>
                </td>
                {/* Add more columns as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ToastContainer />
    </div>
  );
};

export default MyShipments;