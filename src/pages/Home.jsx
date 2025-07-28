import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Ensure this path is correct

const Home = () => {
  const categories = [
    {
      name: "Men",
      image: "https://wrogn.com/cdn/shop/files/ViratCar.jpg?v=1729757058&width=360",
      path: "/men",
    },
    {
      name: "Women",
      image: "https://assets.vogue.in/photos/64a3c675ca73940d3913c665/2:3/w_1920,c_limit/Snapinsta.app_279347363_316803617252115_7522312242330445209_n_1080.jpg",
      path: "/women",
    },
    {
      name: "Kids",
      image: "https://cdn.media.amplience.net/i/gapprod/SP257969_TB_DESK",
      path: "/kids",
    },
  ];

  return (
    <div className="home-container">
      <div className="category-grid">
        {categories.map((cat) => (
          <Link to={cat.path} key={cat.name} className="category-card">
            <div className="image-wrapper">
              <img src={cat.image} alt={cat.name} className="category-image" />
            </div>
            <div className="category-label">{cat.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
