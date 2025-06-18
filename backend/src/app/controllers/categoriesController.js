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
