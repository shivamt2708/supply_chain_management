const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
let {Web3} = require('web3');
const SellerLocation = require("../Models/SellerLocation");
const BuyerLocation = require("../Models/BuyerLocation");
const ManagerLocation = require("../Models/ManagerLocation");
const ShipmentRoute = require("../Models/ShipmentRoute");
const Shipment = require("../Models/Shipment");
const Product = require("../Models/Product");
const providerUrl = 'http://127.0.0.1:7545';
const web3 = new Web3(providerUrl);
const contractABI = require('../artifacts/contracts/ShipmentContract.sol/ShipmentContract.json').abi;
const accountAddress = "0x85C1d07FBD4C04888f91d269f2A04c73DdA7d0db";
const contractAddress = "0xb9b4B2779348FD2c9692a4c62C32899339D6eAc6";
const contract = new web3.eth.Contract(contractABI, contractAddress);
const { v4: uuidv4 } = require('uuid');
const BigNumber = require('bignumber.js');


module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, role, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, role, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Shipment = async (req, res, next) => {

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
    return distance;
  }
  
  function dijkstra(graph, source, destination) {
    const numNodes = graph.length;
    const distance = new Array(numNodes).fill(Number.MAX_SAFE_INTEGER);
    distance[source] = 0;
    
    const previous = new Array(numNodes).fill(-1);
    const pq = [{ node: source, distance: 0 }];
  
    while (pq.length > 0) {
        pq.sort((a, b) => a.distance - b.distance);
        const { node: currentNode, distance: currentDistance } = pq.shift();
        if (currentDistance > distance[currentNode]) {
            continue;
        }
        for (let neighbor = 0; neighbor < numNodes; ++neighbor) {
            if (graph[currentNode][neighbor] !== -1) {
                const newDistance = distance[currentNode] + graph[currentNode][neighbor];
                if (newDistance < distance[neighbor]) {
                    distance[neighbor] = newDistance;
                    previous[neighbor] = currentNode;
                    pq.push({ node: neighbor, distance: newDistance });
                }
            }
        }
    }
  
    const path = [];
    let current = destination;
    while (current !== -1) {
        path.push(current);
        current = previous[current];
    }
    path.reverse();
    return path;
  }

  try {
    console.log('Received POST request to /seller/create-shipment');
    const { sender_email, buyer_email, duration, product_id } = req.body;
    const existingUser = await User.findOne({ email: sender_email });
    const sellerLocation = await SellerLocation.findOne({ email: sender_email });
    const buyerLocation = await BuyerLocation.findOne({ email: buyer_email });
    const shipment_id = uuidv4();
    const current_authority = "seller"; 

    let ware_house = 0;
      try {
        ware_house = await ManagerLocation.countDocuments({});
      } catch (error) {
        console.error('Error counting documents:', error);
        return next(error);
      }
    
    let min_dist = 1e9;
    let source = -1;
    for(let i=0;i<ware_house;i++){
      const manager = await ManagerLocation.findOne({ ware_house: i });
      const dist = calculateDistance(manager.location.coordinates[0], manager.location.coordinates[1], sellerLocation.location.coordinates[0], sellerLocation.location.coordinates[1]);
      if(dist<min_dist && dist<300){
        min_dist = dist;
        source = i;
      }
    }
    console.log(min_dist);

    min_dist = 1e9;
    let destination = -1;
    for(let i=0;i<ware_house;i++){
      const manager = await ManagerLocation.findOne({ ware_house: i });
      const dist = calculateDistance(manager.location.coordinates[0], manager.location.coordinates[1], buyerLocation.location.coordinates[0], buyerLocation.location.coordinates[1]);
      if(dist<min_dist && dist<300){
        min_dist = dist;
        destination = i;
      }
    }
    console.log(min_dist);

    const graph = [];
    for(let i=0;i<ware_house;i++){
      graph[i] = [];
      const manager1 = await ManagerLocation.findOne({ ware_house: i });
      for(let j=0;j<ware_house;j++){
        const manager2 = await ManagerLocation.findOne({ ware_house: j });
        let dist = calculateDistance(manager1.location.coordinates[0], manager1.location.coordinates[1], manager2.location.coordinates[0], manager2.location.coordinates[1]);
        if(dist > 300){
          dist = -1;
        }
        graph[i][j] = dist;
      }
    }
    let route = [];
    if(source>=0 && destination>=0){
      route = dijkstra(graph, source, destination);
    }
    if(route.length == 0){
      res
        .status(202)
        .json({ message: 'Shipment not possible' });
    }

    else{
      const ship_id = parseInt(shipment_id.replace(/-/g, ''), 16);
      console.log(ship_id);
      const route2 = route.map(String);
      const route1 = route2.slice().reverse();
      console.log(route1);
      await contract.methods.createShipmentRoute( ship_id, route1).send({
        from: '0x85C1d07FBD4C04888f91d269f2A04c73DdA7d0db',
        gas: '10000000',
      });
      let next_authority;
      if(route.length === 0 || (duration < route.length + 1)){
        next_authority = "not deliverable";
      }
      else{
        next_authority = route1[route1.length - 1];
      }
      const action = "recieved";
      const status = "not recieved";
      console.log(sender_email);
      console.log('after sender' );
      if (existingUser && existingUser.role ==="seller") {
        const existingUser1 = await User.findOne({ email: buyer_email });
        console.log('after buyer');
        if (existingUser1 && existingUser1.role ==="buyer") {
          const shipment = await contract.methods.createShipment( ship_id, sender_email, buyer_email, current_authority, next_authority, duration, status, action, product_id).send({
            from: '0x85C1d07FBD4C04888f91d269f2A04c73DdA7d0db',
            gas: '10000000',
          });
          console.log('after create' );
          res
          .status(201)
          .json({ message: 'Created Shipment successfully', success: true});
        }
      }
    }
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.BuyerShipment = async (req, res, next) => {
  
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
    return distance;
  }
  
  function dijkstra(graph, source, destination) {
    const numNodes = graph.length;
    const distance = new Array(numNodes).fill(Number.MAX_SAFE_INTEGER);
    distance[source] = 0;
    
    const previous = new Array(numNodes).fill(-1);
    const pq = [{ node: source, distance: 0 }];
  
    while (pq.length > 0) {
        pq.sort((a, b) => a.distance - b.distance);
        const { node: currentNode, distance: currentDistance } = pq.shift();
        if (currentDistance > distance[currentNode]) {
            continue;
        }
        for (let neighbor = 0; neighbor < numNodes; ++neighbor) {
            if (graph[currentNode][neighbor] !== -1) {
                const newDistance = distance[currentNode] + graph[currentNode][neighbor];
                if (newDistance < distance[neighbor]) {
                    distance[neighbor] = newDistance;
                    previous[neighbor] = currentNode;
                    pq.push({ node: neighbor, distance: newDistance });
                }
            }
        }
    }
  
    const path = [];
    let current = destination;
    while (current !== -1) {
        path.push(current);
        current = previous[current];
    }
    path.reverse();
    return path;
  }

  try {
    console.log('Received POST request to /seller/create-shipment');
    const { sender_email, buyer_email, duration, product_id } = req.body;
    const existingUser = await User.findOne({ email: sender_email });
    const sellerLocation = await SellerLocation.findOne({ email: sender_email });
    const buyerLocation = await BuyerLocation.findOne({ email: buyer_email });
    const shipment_id = uuidv4();
    const current_authority = "seller"; 

    let ware_house = 0;
      try {
        ware_house = await ManagerLocation.countDocuments({});
      } catch (error) {
        console.error('Error counting documents:', error);
        return next(error);
      }
    
    let min_dist = 1e9;
    let source = -1;
    for(let i=0;i<ware_house;i++){
      const manager = await ManagerLocation.findOne({ ware_house: i });
      const dist = calculateDistance(manager.location.coordinates[0], manager.location.coordinates[1], sellerLocation.location.coordinates[0], sellerLocation.location.coordinates[1]);
      if(dist<min_dist && dist<300){
        min_dist = dist;
        source = i;
      }
    }
    console.log(min_dist);

    min_dist = 1e9;
    let destination = -1;
    for(let i=0;i<ware_house;i++){
      const manager = await ManagerLocation.findOne({ ware_house: i });
      const dist = calculateDistance(manager.location.coordinates[0], manager.location.coordinates[1], buyerLocation.location.coordinates[0], buyerLocation.location.coordinates[1]);
      if(dist<min_dist && dist<300){
        min_dist = dist;
        destination = i;
      }
    }
    console.log(min_dist);

    const graph = [];
    for(let i=0;i<ware_house;i++){
      graph[i] = [];
      const manager1 = await ManagerLocation.findOne({ ware_house: i });
      for(let j=0;j<ware_house;j++){
        const manager2 = await ManagerLocation.findOne({ ware_house: j });
        let dist = calculateDistance(manager1.location.coordinates[0], manager1.location.coordinates[1], manager2.location.coordinates[0], manager2.location.coordinates[1]);
        if(dist > 300){
          dist = -1;
        }
        graph[i][j] = dist;
      }
    }
    let route = [];
    if(source>=0 && destination>=0){
      route = dijkstra(graph, source, destination);
    }
    if(route.length == 0 || (duration < route.length + 1)){
      res
        .status(202)
        .json({ message: 'Shipment not possible' });
    }

    else{
      const ship_id = parseInt(shipment_id.replace(/-/g, ''), 16);
      console.log(ship_id);
      const route2 = route.map(String);
      const route1 = route2.slice().reverse();
      console.log(route1);
      await contract.methods.createShipmentRoute( ship_id, route1).send({
        from: '0x85C1d07FBD4C04888f91d269f2A04c73DdA7d0db',
        gas: '10000000',
      });
      let next_authority;
      if(route.length === 0){
        next_authority = "not deliverable";
      }
      else{
        next_authority = route1[route1.length - 1];
      }
      const action = "recieved";
      const status = "not recieved";
      console.log(sender_email);
      console.log('after sender' );
      if (existingUser && existingUser.role ==="seller") {
        const existingUser1 = await User.findOne({ email: buyer_email });
        console.log('after buyer');
        if (existingUser1 && existingUser1.role ==="buyer") {
          const shipment = await contract.methods.createShipment( ship_id, sender_email, buyer_email, current_authority, next_authority, duration, status, action, product_id).send({
            from: '0x85C1d07FBD4C04888f91d269f2A04c73DdA7d0db',
            gas: '10000000',
          });
          console.log('after create' );
          res
          .status(201)
          .json({ message: 'Created Shipment successfully', success: true});
        }
      }
    }
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.AddProduct = async (req, res, next) => {
  try {
    console.log('Received POST request to /seller/add-product');
    const { sender_email, price, name } = req.body;
    let product_id = 0;
      try {
        product_id = await Product.countDocuments({});
      } catch (error) {
        console.error('Error counting documents:', error);
        return next(error);
      }
      try {
        await Product.create({ sender_email, price, name, product_id });
        console.log('Data saved to the database');
        res.sendStatus(200);
        
      } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data to the database');
      }
    next();
  } catch (error) {
    console.error(error);
  }
};


module.exports.MyShipments = async (req, res, next) => {
  try {
    console.log('Received GET request to seller shipments');
    const { sender_email } = req.query;
    const existingUser = await User.findOne({ email: sender_email });
    console.log('after sender' );
    const current_authority = "seller";
    if (existingUser && existingUser.role ==="seller") {
      const shipments = await contract.methods.getShipmentsBySenderAndAuthority( sender_email,  current_authority).call();
      console.log(shipments);
      console.log(shipments[0].toString());
      const shipmentsStringified = shipments.map((shipment) => {
        return {
          shipment_id: shipment[0].toString(),
          sender_email: shipment[1],
          buyer_email: shipment[2],
          current_authority: shipment[3],
          next_authority: shipment[4],
          duration: shipment[5].toString(),
          status: shipment[6],
          action: shipment[7],
          product_id: shipment[8].toString(),
        };
      });
      res.status(200).json({ success: true, shipments: shipmentsStringified });
    }
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.GetProduct = async (req, res, next) => {
  try {
    console.log('Received GET request to seller shipments');
    const { product_id } = req.query;
      const shipments = await Product.findOne( {product_id: product_id});

      console.log(shipments.price);
      res.status(200).json({ success: true, shipments});
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.ManagerMyShipments = async (req, res, next) => {
  try {
    console.log('Received GET request to ManagerMyShipments');
    const { sender_email } = req.query;
    const existingUser = await User.findOne({ email: sender_email });
    const ml = await ManagerLocation.findOne({ email: sender_email });
    const ware_house1 = ml.ware_house;

    console.log(sender_email);
    console.log('after sender' );
    if (existingUser && existingUser.role ==="manager") {
      const shipments = await contract.methods.getShipmentsByManagerAndAuthority(ware_house1).call();
      console.log(shipments);
      console.log(shipments[0].toString());
      const shipmentsStringified = shipments.map((shipment) => {
        return {
          shipment_id: shipment[0].toString(),
          sender_email: shipment[1],
          buyer_email: shipment[2],
          current_authority: shipment[3],
          next_authority: shipment[4],
          duration: shipment[5].toString(),
          status: shipment[6],
          action: shipment[7],
          product_id: shipment[8].toString(),
        };
      });
      res.status(200).json({ success: true, shipments: shipmentsStringified });
    }
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.BuyerMyShipments = async (req, res, next) => {
  try {
    console.log('Received GET request to /seller/my-shipments');
    const { buyer_email } = req.query;
    const existingUser = await User.findOne({ email: buyer_email });
    console.log(buyer_email);
    console.log('after sender' );
    if (existingUser && existingUser.role ==="buyer") {
      const shipments = await contract.methods.getShipmentsByBuyerAndAuthority(buyer_email).call();
      console.log(shipments);
      console.log(shipments[0].toString());
      const shipmentsStringified = shipments.map((shipment) => {
        return {
          shipment_id: shipment[0].toString(),
          sender_email: shipment[1],
          buyer_email: shipment[2],
          current_authority: shipment[3],
          next_authority: shipment[4],
          duration: shipment[5].toString(),
          status: shipment[6],
          action: shipment[7],
          product_id: shipment[8].toString(),
        };
      });
      res.status(200).json({ success: true, shipments: shipmentsStringified });
    }
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Action = async (req, res, next) => {
  try {
    console.log('Received GET request to action');
    const { shipment_id } = req.query;
    const ship_id = BigInt(shipment_id);
    console.log(shipment_id);
    console.log(ship_id);
    const shipment = await contract.methods.handleShipmentAction( ship_id ).send({
      from: '0x85C1d07FBD4C04888f91d269f2A04c73DdA7d0db',
      gas: '10000000',
    });

    if (shipment) {
      res.status(200).json({ success: true});
    }
    next();
  } catch (error) {
    console.error(error);
  }
};



module.exports.Login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if(!email || !password ){
        return res.json({message:'All fields are required'})
      }
      const user = await User.findOne({ email });
      if(!user){
        return res.json({message:'Incorrect password or email' }) 
      }
      const auth = await bcrypt.compare(password,user.password)
      if (!auth) {
        return res.json({message:'Incorrect password or email' }) 
      }
       const token = createSecretToken(user._id);
       res.cookie("token", token, {
         withCredentials: true,
         httpOnly: false,
       });
       if(user.role === "buyer"){
        console.log("buyer");
        res.status(201).json({ message: "User logged in successfully", success: true });
       }
       else if(user.role === "seller"){
        console.log("seller");
        res.status(202).json({ message: "User logged in successfully", success: true });
       }
       else if(user.role === "manager"){
        console.log("manager");
        res.status(203).json({ message: "User logged in successfully", success: true });
       }
       next()
    } catch (error) {
      console.error(error);
    }
  };

  module.exports.SellerLocation = async (req, res, next) => {
    try{  
      const {email ,location} = req.body;
      const formData = {
        email: email,
        location: location,
      };
      if (formData) {
        try {
          await SellerLocation.create(formData);
          console.log('Data saved to the database');
          res.sendStatus(200);
          
        } catch (error) {
          console.error('Error saving data:', error);
          res.status(500).send('Error saving data to the database');
        }
      } else {
        console.log('Bad Request: formData is missing or invalid');
        res.status(400).send('Bad Request: formData is missing or invalid');
        
      }
      next();
    }
    catch (error) {
      console.error(error);
    }
  };

  module.exports.BuyerLocation = async (req, res, next) => {
    try{  
      const {email ,location} = req.body;
      const formData = {
        email: email,
        location: location,
      };
      if (formData) {
        try {
          await BuyerLocation.create(formData);
          console.log('Data saved to the database');
          res.sendStatus(200);
          
        } catch (error) {
          console.error('Error saving data:', error);
          res.status(500).send('Error saving data to the database');
        }
      } else {
        console.log('Bad Request: formData is missing or invalid');
        res.status(400).send('Bad Request: formData is missing or invalid');
        
      }
      next();
    }
    catch (error) {
      console.error(error);
    }
  };

  module.exports.ManagerLocation = async (req, res, next) => {
    try{  
      const {email ,location} = req.body;
      let ware_house = 0;
      try {
        ware_house = await ManagerLocation.countDocuments({});
      } catch (error) {
        console.error('Error counting documents:', error);
        return next(error);
      }
  
      ware_house = String(ware_house);
        try {
          await ManagerLocation.create({email ,location, ware_house});
          console.log('Data saved to the database');
          res.sendStatus(200);
          
        } catch (error) {
          console.error('Error saving data:', error);
          res.status(500).send('Error saving data to the database');
        }
      next();
    }
    catch (error) {
      console.error(error);
    }
  };