// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShipmentContract {
    event ShipmentRouteCreated(uint shipment_id, string[] route);
    event ShipmentCreated(
        uint shipment_id,
        string sender_email,
        string buyer_email,
        string current_authority,
        string next_authority,
        uint duration,
        string status,
        string action,
        uint product_id
    );

    struct ShipmentRoute {
        uint shipment_id;
        string[] route;
    }

    struct Shipment {
        uint shipment_id;
        string sender_email;
        string buyer_email;
        string current_authority;
        string next_authority;
        uint duration;
        string status;
        string action;
        uint product_id;
    }

    uint[] public shipmentIds;
    mapping(uint => ShipmentRoute) public shipmentRoutes;
    mapping(uint => Shipment) public shipments;

    function createShipmentRoute(uint shipment_id, string[] memory route) public {
        require(route.length > 0, "Route should not be empty");
        ShipmentRoute storage shipmentRoute = shipmentRoutes[shipment_id];
        shipmentRoute.shipment_id = shipment_id;
        shipmentRoute.route = route;
        emit ShipmentRouteCreated(shipment_id, route);
    }

    function createShipment(
        uint shipment_id,
        string memory sender_email,
        string memory buyer_email,
        string memory current_authority,
        string memory next_authority,
        uint duration,
        string memory status,
        string memory action,
        uint product_id
    ) public {
        // Add input validation if needed

        Shipment storage shipment = shipments[shipment_id];
        shipment.shipment_id = shipment_id;
        shipment.sender_email = sender_email;
        shipment.buyer_email = buyer_email;
        shipment.current_authority = current_authority;
        shipment.next_authority = next_authority;
        shipment.duration = duration;
        shipment.status = status;
        shipment.action = action;
        shipment.product_id = product_id;

        shipmentIds.push(shipment_id); // Add the shipment_id to the list of shipmentIds
        emit ShipmentCreated(shipment_id, sender_email, buyer_email, current_authority, next_authority, duration, status, action, product_id);
    }

    function getShipmentsBySenderAndAuthority(string memory sender_email, string memory current_authority) public view returns (Shipment[] memory) {
        uint count = 0;
        for (uint i = 0; i < shipmentIds.length; i++) {
            uint shipmentId = shipmentIds[i];
            Shipment storage shipment = shipments[shipmentId];
            if (keccak256(bytes(shipment.sender_email)) == keccak256(bytes(sender_email)) && keccak256(bytes(shipment.current_authority)) == keccak256(bytes(current_authority))) {
                count++;
            }
        }

        Shipment[] memory result = new Shipment[](count);
        count = 0;
        for (uint i = 0; i < shipmentIds.length; i++) {
            uint shipmentId = shipmentIds[i];
            Shipment storage shipment = shipments[shipmentId];
            if (keccak256(bytes(shipment.sender_email)) == keccak256(bytes(sender_email)) && keccak256(bytes(shipment.current_authority)) == keccak256(bytes(current_authority))) {
                result[count] = shipment;
                count++;
            }
        }

        return result;
    }

    function getShipmentsByBuyerAndAuthority(string memory buyer_email) public view returns (Shipment[] memory) {
        uint count = 0;
        for (uint i = 0; i < shipmentIds.length; i++) {
            uint shipmentId = shipmentIds[i];
            Shipment storage shipment = shipments[shipmentId];
            if (keccak256(bytes(shipment.buyer_email)) == keccak256(bytes(buyer_email))) {
                count++;
            }
        }

        Shipment[] memory result = new Shipment[](count);
        count = 0;
        for (uint i = 0; i < shipmentIds.length; i++) {
            uint shipmentId = shipmentIds[i];
            Shipment storage shipment = shipments[shipmentId];
            if (keccak256(bytes(shipment.buyer_email)) == keccak256(bytes(buyer_email))) {
                result[count] = shipment;
                count++;
            }
        }

        return result;
    }

    function getShipmentsByManagerAndAuthority(string memory current_authority) public view returns (Shipment[] memory) {
        uint count = 0;
        for (uint i = 0; i < shipmentIds.length; i++) {
            uint shipmentId = shipmentIds[i];
            Shipment storage shipment = shipments[shipmentId];
            if (keccak256(bytes(shipment.current_authority)) == keccak256(bytes(current_authority))) {
                count++;
            }
        }

        Shipment[] memory result = new Shipment[](count);
        count = 0;
        for (uint i = 0; i < shipmentIds.length; i++) {
            uint shipmentId = shipmentIds[i];
            Shipment storage shipment = shipments[shipmentId];
            if (keccak256(bytes(shipment.current_authority)) == keccak256(bytes(current_authority))) {
                result[count] = shipment;
                count++;
            }
        }

        return result;
    }

    function handleShipmentAction(uint shipment_id) public {
        ShipmentRoute storage route = shipmentRoutes[shipment_id];
        Shipment storage shipment = shipments[shipment_id];
        if (keccak256(bytes(shipment.action)) == keccak256(bytes("dispatch"))) {
            handleDispatch(route, shipment);
        }
        if (keccak256(bytes(shipment.action)) == keccak256(bytes("dispatch"))) {
            handleDispatchAuthority(shipment);
        } else if (keccak256(bytes(shipment.action)) == keccak256(bytes("recieved"))) {
            handlerecievedAuthority(shipment);
        }
    }

    function handleDispatch(ShipmentRoute storage route, Shipment storage shipment) internal {
        if (keccak256(bytes(shipment.action)) == keccak256(bytes("dispatch")) && route.route.length > 0) {
            route.route.pop();
        }
    }

    function handleDispatchAuthority(Shipment storage shipment) internal {
        if (keccak256(bytes(shipment.action)) == keccak256(bytes("dispatch"))) {
            if (keccak256(bytes(shipment.next_authority)) == keccak256(bytes("buyer"))) {
                shipment.current_authority = shipment.next_authority;
                shipment.next_authority = "none";
                shipment.duration = shipment.duration - 1;
                shipment.status = "delivered";
                shipment.action = "recieved";
            } else {
                string memory next1 = shipmentRoutes[shipment.shipment_id].route.length > 0
                    ? shipmentRoutes[shipment.shipment_id].route[shipmentRoutes[shipment.shipment_id].route.length -1]
                    : "buyer";

                shipment.current_authority = shipment.next_authority;
                shipment.next_authority = next1;
                shipment.duration = shipment.duration - 1;
                shipment.status = "not recieved";
                shipment.action = "recieved";
            }
        }
    }

    function handlerecievedAuthority(Shipment storage shipment) internal {
        if (keccak256(bytes(shipment.action)) == keccak256(bytes("recieved"))) {
            shipment.status = "recieved";
            shipment.action = "dispatch";
        }
    }
}
