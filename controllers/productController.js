import Product from "../models/product.js";
import Category from "../models/category.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, stock = 0, category_id } = req.body;
    if (!name || price == null) return res.status(400).json({ error: "name and price required" });
    // optional check category exists
    if (category_id) {
      const cat = await Category.findByPk(category_id);
      if (!cat) return res.status(400).json({ error: "Invalid categoryId" });
    }
    const product = await Product.create({ name, price, stock, category_id });
    res.status(201).json({ message: "Product created", data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id, { include: Category });
//     if (!product) return res.status(404).json({ error: "Product not found" });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const { name, price, stock, category_id } = req.body;
    if (name) product.name = name;
    if (price != null) product.price = price;
    if (stock != null) product.stock = stock;
    if (category_id) product.category_id = category_id;
    await product.save();
    res.json({ message: "Product updated", data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ["id", "name"] }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

