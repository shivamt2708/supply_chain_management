import { Route, Routes } from "react-router-dom";
import { Login, Signup } from "./pages";
import Home from "./pages/Home";
import BuyerHome from "./components/buyer/BuyerHome";
import SellerHome from "./components/seller/SellerHome";
import CreateShipment from "./components/seller/CreateShipment";
import CreateShipment2 from "./components/buyer/CreateShipment";
import ManagerHome from "./components/manager/ManagerHome";
import MyShipments from "./components/seller/MyShipments";
import MyShipments2 from "./components/buyer/MyShipments";
import MyShipments3 from "./components/manager/MyShipments";
import AddProduct from "./components/seller/AddProduct";
import GetProduct from "./components/GetProduct";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buyer-home" element={<BuyerHome />} />
        <Route path="/seller-home" element={<SellerHome />} />
        <Route path="/seller/create-shipment" element={<CreateShipment />} />
        <Route path="/buyer/create-shipment" element={<CreateShipment2 />} />
        <Route path="/manager-home" element={<ManagerHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/seller/my-shipments" element={<MyShipments />} />
        <Route path="/buyer/my-shipments" element={<MyShipments2 />} />
        <Route path="/manager/my-shipments" element={<MyShipments3 />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/get-product" element={<GetProduct />} />
      </Routes>
    </div>
  );
}

export default App;