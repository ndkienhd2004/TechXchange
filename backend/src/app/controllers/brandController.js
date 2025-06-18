export default function getAllCategories(req, res) {
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Books" },
    { id: 3, name: "Clothing" },
  ];

  res.status(200).json(categories);
}
export function getCategoryById(req, res) {
  const categoryId = parseInt(req.params.id, 10);
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Books" },
    { id: 3, name: "Clothing" },
  ];

  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json(category);
}
export function createCategory(req, res) {
  const newCategory = req.body;
  // Logic to save the category to the database would go here
  newCategory.id = Date.now(); // Simulate an ID for the new category
  res.status(201).json(newCategory);
}
export function updateCategory(req, res) {
  const categoryId = parseInt(req.params.id, 10);
  const updatedCategory = req.body;
  // Logic to update the category in the database would go here
  updatedCategory.id = categoryId; // Ensure the ID remains the same
  res.status(200).json(updatedCategory);
}
