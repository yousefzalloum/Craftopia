import { Link } from 'react-router-dom';
import '../styles/CraftCard.css';

const CraftCard = ({ craft }) => {
  return (
    <div className="craft-card">
      <div className="craft-card-image-container">
        <img 
          src={craft.imageUrl} 
          alt={craft.name} 
          className="craft-card-image"
          loading="lazy"
        />
        {!craft.availability && (
          <div className="craft-unavailable-badge">Unavailable</div>
        )}
        <div className="craft-category-badge">{craft.category}</div>
      </div>

      <div className="craft-card-content">
        <h3 className="craft-card-title">{craft.name}</h3>
        
        <p className="craft-card-artisan">
          <span className="artisan-icon">👨‍🎨</span>
          {craft.artisan}
        </p>

        <p className="craft-card-description">
          {craft.description.substring(0, 100)}
          {craft.description.length > 100 ? '...' : ''}
        </p>

        <div className="craft-card-rating">
          <span className="rating-stars">
            {'⭐'.repeat(Math.round(craft.rating))}
          </span>
          <span className="rating-value">{craft.rating}</span>
          <span className="rating-reviews">({craft.reviews} reviews)</span>
        </div>

        <div className="craft-card-footer">
          <div className="craft-card-price">
            <span className="price-label">Price:</span>
            <span className="price-value">${craft.price}</span>
          </div>
          
          <Link 
            to={`/crafts/${craft.id}`} 
            className="craft-card-button"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CraftCard;
