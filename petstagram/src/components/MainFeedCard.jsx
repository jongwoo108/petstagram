import React from 'react';
import '../styles/components/MainFeedCard.css';

const MainFeedCard = React.forwardRef(({ feed, onCardClick }, ref) => {
  const { layout_type, title, author, likes } = feed;
  const layoutClass = `layout-type-${layout_type}`;

  const placeholderColors = {
    1: 'linear-gradient(to bottom, #a8c0ff, #3f2b96)',
    2: 'lightcoral',
    3: 'lightsalmon',
    4: 'lightgreen',
  };

  const backgroundStyle = {
    background: placeholderColors[layout_type] || 'lightgrey',
  };

  return (
    <div
      ref={ref}
      className={`main-feed-card ${layoutClass}`}
      onClick={() => onCardClick(feed)}
    >
      <div className="card-image-placeholder" style={backgroundStyle}></div>
      <div className="card-overlay">
        <h3 className="card-title">{title}</h3>
        
        <div className="card-footer">
          <div className="author-info">
            <img src={author.profilePic} alt={author.nickname} className="author-avatar" />
            <span className="author-name">{author.nickname}</span>
          </div>
          <div className="likes-info">
            <span>❤️ {likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MainFeedCard; 