// // MainPage.jsx
// import React from "react";
// import FeedCard from "../components/FeedCard";
// import "../styles/pages/MainPage.css";

// const MainPage = ({ feeds, setFeeds }) => {
//   console.log("✅ MainPage에 전달된 feeds:", feeds);

//   // 좋아요 수로 정렬 (내림차순)
//   const sortedFeeds = [...feeds].sort((a, b) => b.like_count - a.like_count);

//   // 가장 좋아요가 많은 게시물 1~2개를 large로 처리
//   const topFeeds = sortedFeeds.slice(0, 2);
//   const restFeeds = sortedFeeds.slice(2);

//   const handleToggleLike = (feedId, isLiked) => {
//     setFeeds(prev =>
//       prev.map(feed =>
//         feed.id === feedId
//           ? {
//               ...feed,
//               is_liked: !isLiked,
//               like_count: feed.like_count + (isLiked ? -1 : 1)
//             }
//           : feed
//       )
//     );
//   };

//   return (
//     <div className="main-feed-wrapper">
//       <h2>📸 모든 반려동물 소식</h2>
//       <div className="main-feed-grid">
//         {topFeeds.map(feed => (
//           <FeedCard
//             key={feed.id}
//             feed={feed}
//             layout="large"
//             onToggleLike={handleToggleLike}
//           />
//         ))}
//         {restFeeds.map((feed, idx) => (
//           <FeedCard
//             key={feed.id}
//             feed={feed}
//             layout={idx % 3 === 0 ? "tall" : "small"}
//             onToggleLike={handleToggleLike}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MainPage;
// src/pages/MainPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainFeedCard from '../components/MainFeedCard';
import '../styles/pages/MainPage.css';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { categoryMap } from '../constants/categoryMap';
import defaultProfilePic from '../assets/default.png';

const Modal = ({ feed, onClose }) => {
  if (!feed) return null;
  const categoryName = categoryMap[feed.category] || '기타';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{feed.subject}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <img src={feed.images[0]} alt={feed.subject} className="modal-image" />
          <div className="modal-info">
            <div className="author-info">
              <img src={feed.author?.profilePic || defaultProfilePic} alt={feed.username} className="author-profile-pic" />
              <span>{feed.username}</span>
            </div>
            <p className="category">{categoryName}</p>
            <p className="content">{feed.content}</p>
            <div className="tags">
              {feed.tags.map((tag, index) => <span key={index} className="tag">#{tag}</span>)}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <p>Likes: {feed.likes}</p>
          <p>Created at: {new Date(feed.created_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const observer = useRef();

  const fetchFeeds = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/feeds', {
        params: { page: pageNum, page_size: 10 }
      });
      const newFeeds = response.data;
      
      setFeeds(prevFeeds => {
        const existingIds = new Set(prevFeeds.map(f => f.id));
        const uniqueNewFeeds = newFeeds.filter(f => !existingIds.has(f.id));
        return [...prevFeeds, ...uniqueNewFeeds];
      });
      setHasMore(newFeeds.length > 0);
    } catch (error) {
      console.error("Error fetching feeds:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds(1);
  }, [fetchFeeds]);

  const lastFeedElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchFeeds(nextPage);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchFeeds]);

  const handleCardClick = (feed) => {
    setSelectedFeed(feed);
  };

  const handleCloseModal = () => {
    setSelectedFeed(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    console.log('Searching for:', searchTerm);
    // Implement search logic here
  };

  const isLoggedIn = !!sessionStorage.getItem('nickname');

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="main-page-container">
      <header className="main-page-header">
        <h1>Petstagram</h1>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate('/my-feednet')}>내 피드 보기</button>
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>로그인</button>
          )}
        </div>
      </header>
      <div className="main-page-content">
        <div className="main-page-controls">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
          <button className="filter-button">
            <FaFilter /> 필터
          </button>
        </div>
        <div className="main-page-body">
          <div className="feed-grid">
            {feeds.map((feed, index) => {
              const isLastElement = index === feeds.length - 1;
              const cardType = ['2x2', '1x2', '1x1', '1x2', '2x2', '1x1', '1x1', '2x1'][index % 8];
              return (
                <MainFeedCard
                  ref={isLastElement ? lastFeedElementRef : null}
                  key={`${feed.id}-${index}`}
                  feed={feed}
                  cardType={cardType}
                  onClick={() => handleCardClick(feed)}
                />
              );
            })}
          </div>
          {loading && <div className="loading-indicator">Loading...</div>}
        </div>
      </div>
      <Modal feed={selectedFeed} onClose={handleCloseModal} />
    </div>
  );
};

export default MainPage;
