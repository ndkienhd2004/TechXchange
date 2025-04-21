import "./RatingStar.css";

const StarRating = ({ rating }) => {
  const filledStars = Math.floor(rating);
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < filledStars) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="star">
          ☆
        </span>
      );
    }
  }

  return (
    <div className="star-rating">
      {stars}
      <span className="rating-number">({rating.toFixed(1)})</span>
    </div>
  );
};

export default StarRating;
