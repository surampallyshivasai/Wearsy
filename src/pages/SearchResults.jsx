import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard"; // ✅ Use your reusable card component
import "./SearchResults.css"; // ✅ Use same or shared CSS as your product pages

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q");

  const [results, setResults] = useState([]);

  useEffect(() => {
    const allProducts = JSON.parse(localStorage.getItem("products")) || [];

    const filtered = allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setResults(filtered);
  }, [searchTerm]);

  return (
    <div className="search-results">
      <h2 className="search-heading">
        Search Results for "<span>{searchTerm}</span>"
      </h2>

      {results.length > 0 ? (
        <div className="product-container">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="no-results">No products found.</p>
      )}
    </div>
  );
};

export default SearchResults;
