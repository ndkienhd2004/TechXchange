import { useState } from "react";
import StarRating from "../../RatingStar/RatingStar";
import "./Review.css";
const Review = ({ rating, reviews }) => {
  const [reviewFilter, setReviewFilter] = useState("All");
  const handleFilterChange = (filter) => {
    setReviewFilter(filter);
  };
  return (
    <div className="ratings-reviews">
      <h2>Rating:</h2>
      <div className="rating-summary">
        <div className="average-rating">
          <StarRating rating={rating} />
          <span className="rating-number">{rating} out of 5</span>
        </div>
        <div className="rating-filters">
          <button
            className={`filter-btn ${reviewFilter === "All" ? "active" : ""}`}
            onClick={() => handleFilterChange("All")}
          >
            All
          </button>
          <button
            className={`filter-btn ${
              reviewFilter === "5 stars" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("5 stars")}
          >
            5 stars (50)
          </button>
          <button
            className={`filter-btn ${
              reviewFilter === "4 stars" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("4 stars")}
          >
            4 stars (10)
          </button>
          <button
            className={`filter-btn ${
              reviewFilter === "3 stars" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("3 stars")}
          >
            3 stars (5)
          </button>
          <button
            className={`filter-btn ${
              reviewFilter === "2 stars" ? "active" : ""
            }`}
            onClick={() => handleFilterChange("2 stars")}
          >
            2 stars (2)
          </button>
        </div>
        <div className="additional-filters">
          <button className="filter-btn">With Photos (7)</button>
          <button className="filter-btn">Comments (15)</button>
          <button className="filter-btn">Most Recent</button>
        </div>
      </div>

      {/* Review List */}
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="review-stars">{"★".repeat(review.rating)}</div>
              <div className="review-date">{review.date}</div>
            </div>
            <div className="review-author">{review.author}</div>
            <div className="review-content">{review.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Review;
