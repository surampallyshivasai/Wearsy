import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminProducts.css";

const categoryMap = {
  Men: ["Shirts", "Pants", "T-Shirts", "Tracks", "Shoes", "Jeans"],
  Women: ["Tops", "Dresses", "Pants", "T-Shirts", "Tracks", "Shoes", "Jeans"],
  Kids: ["Shirts", "Frocks", "Shorts", "Shoes", "Dresses", "T-Shirts"]
};
const defaultGenders = ["Men", "Women", "Kids"];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    gender: "Men",
    category: categoryMap["Men"][0]
  });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(stored);
  }, []);

  const saveToStorage = (items) => {
    localStorage.setItem("products", JSON.stringify(items));
    setProducts(items);
  };

  const handleImageUpload = (file, isNewProduct = true) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      if (isNewProduct) {
        setNewProduct({ ...newProduct, image: base64String });
      } else {
        // For editing existing product
        const updated = { ...products.find(p => p.id === editingId), image: base64String };
        handleSave(editingId, updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = () => {
    const updated = [...products, { ...newProduct, id: Date.now() }];
    saveToStorage(updated);
    setShowModal(false);
    setNewProduct({
      name: "",
      price: "",
      image: "",
      gender: "Men",
      category: categoryMap["Men"][0]
    });
  };

  const handleDelete = (id) => {
    const updated = products.filter((p) => p.id !== id);
    saveToStorage(updated);
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (id, updatedProduct) => {
    const updated = products.map((p) => (p.id === id ? updatedProduct : p));
    saveToStorage(updated);
    setEditingId(null);
  };

  return (
    <div className="admin-products">
      <h2>Admin - Products</h2>
      <button className="admin-back-btn" onClick={() => navigate(-1)}>Go Back</button>
      <button className="add-btn" onClick={() => setShowModal(true)}>
        + Add Product
      </button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Image</th>
            <th>Category</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              {editingId === prod.id ? (
                <>
                  <td>
                    <input
                      value={prod.name}
                      onChange={(e) => {
                        const updated = { ...prod, name: e.target.value };
                        handleSave(prod.id, updated);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={prod.price}
                      onChange={(e) => {
                        const updated = {
                          ...prod,
                          price: parseInt(e.target.value)
                        };
                        handleSave(prod.id, updated);
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input
                        placeholder="Image URL"
                      value={prod.image}
                      onChange={(e) => {
                        const updated = { ...prod, image: e.target.value };
                        handleSave(prod.id, updated);
                      }}
                    />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(e.target.files[0], false);
                          }
                        }}
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                  </td>
                  <td>
                    <select
                      value={prod.category}
                      onChange={(e) => {
                        const updated = { ...prod, category: e.target.value };
                        handleSave(prod.id, updated);
                      }}
                    >
                      {(categoryMap[prod.gender] || []).map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={prod.gender}
                      onChange={(e) => {
                        const newGender = e.target.value;
                        const updated = {
                          ...prod,
                          gender: newGender,
                          category: categoryMap[newGender][0]
                        };
                        handleSave(prod.id, updated);
                      }}
                    >
                      {defaultGenders.map((gen) => (
                        <option key={gen}>{gen}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => setEditingId(null)}>Done</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{prod.name}</td>
                  <td>₹{prod.price}</td>
                  <td>
                    <img src={prod.image} alt={prod.name} height="50" />
                  </td>
                  <td>{prod.category}</td>
                  <td>{prod.gender}</td>
                  <td>
                    <button onClick={() => handleEdit(prod.id)}>Edit</button>
                    <button onClick={() => handleDelete(prod.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Product</h3>
            <input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: parseInt(e.target.value)
                })
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
                placeholder="Image URL (or upload file below)"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>OR</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0], true);
                    }
                  }}
                  style={{ fontSize: '12px' }}
                />
              </div>
              {newProduct.image && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <img 
                    src={newProduct.image} 
                    alt="Preview" 
                    style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }} 
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Image Preview
                  </p>
                </div>
              )}
            </div>
            <select
              value={newProduct.gender}
              onChange={(e) => {
                const gender = e.target.value;
                const firstCategory = categoryMap[gender][0];
                setNewProduct({
                  ...newProduct,
                  gender,
                  category: firstCategory
                });
              }}
            >
              {defaultGenders.map((gen) => (
                <option key={gen}>{gen}</option>
              ))}
            </select>
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            >
              {categoryMap[newProduct.gender].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleAddProduct}>Add</button>
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
