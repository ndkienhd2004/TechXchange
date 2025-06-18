export default function getAllOrders(req, res) {
  const orders = [
    { id: 1, userId: 1, total: 100, status: "pending" },
    { id: 2, userId: 2, total: 200, status: "shipped" },
    { id: 3, userId: 1, total: 300, status: "delivered" },
  ];

  res.status(200).json(orders);
}

export function getOrderById(req, res) {
  const orderId = parseInt(req.params.id, 10);
  const orders = [
    { id: 1, userId: 1, total: 100, status: "pending" },
    { id: 2, userId: 2, total: 200, status: "shipped" },
    { id: 3, userId: 1, total: 300, status: "delivered" },
  ];

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json(order);
}

export function createOrder(req, res) {
  const newOrder = req.body;
  // Logic to save the order to the database would go here
  newOrder.id = Date.now(); // Simulate an ID for the new order
  res.status(201).json(newOrder);
}

export function updateOrder(req, res) {
  const orderId = parseInt(req.params.id, 10);
  const updatedOrder = req.body;
  // Logic to update the order in the database would go here
  updatedOrder.id = orderId; // Ensure the ID remains the same
  res.status(200).json(updatedOrder);
}

export function deleteOrder(req, res) {
  const orderId = parseInt(req.params.id, 10);
  // Logic to delete the order from the database would go here
  res.status(204).send(); // No content to return after deletion
}

export function getOrdersByUserId(req, res) {
  const userId = parseInt(req.params.userId, 10);
  const orders = [
    { id: 1, userId: 1, total: 100, status: "pending" },
    { id: 2, userId: 2, total: 200, status: "shipped" },
    { id: 3, userId: 1, total: 300, status: "delivered" },
  ];

  const userOrders = orders.filter((o) => o.userId === userId);

  if (userOrders.length === 0) {
    return res.status(404).json({ message: "No orders found for this user" });
  }

  res.status(200).json(userOrders);
}
