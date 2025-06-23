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
import { useNavigate } from 'react-router-dom';
import MainFeedCard from '../components/MainFeedCard';
import '../styles/pages/MainPage.css';
import logo from '../assets/main_logo.png';
import { categoryMap } from '../constants/categoryMap';
import defaultProfilePic from '../assets/default.png';

// 모달 컴포넌트
const Modal = ({ feed, onClose }) => {
  if (!feed) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div
          className="modal-image"
          style={{
            background: `linear-gradient(to top, #d299c2, #fef9d7)`,
            height: '300px',
          }}
        ></div>
        <div className="modal-text-content">
          <h2>{feed.title}</h2>
          <p>{feed.content}</p>
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const isLoggedIn = !!sessionStorage.getItem('nickname');

  const generateMockFeeds = (pageNumber) => {
    const newFeeds = [
      { id: `p${pageNumber}-1`, layout_type: 2, title: '새로운 세로 타입', content: '...', author: { nickname: '유저1', profilePic: defaultProfilePic }, likes: 10 },
      { id: `p${pageNumber}-2`, layout_type: 3, title: '새로운 기본 타입', content: '...', author: { nickname: '유저2', profilePic: defaultProfilePic }, likes: 25 },
      { id: `p${pageNumber}-3`, layout_type: 1, title: '새로운 큰 타입', content: '...', author: { nickname: '유저3', profilePic: defaultProfilePic }, likes: 50 },
      { id: `p${pageNumber}-4`, layout_type: 3, title: '새로운 기본 타입', content: '...', author: { nickname: '유저4', profilePic: defaultProfilePic }, likes: 15 },
      { id: `p${pageNumber}-5`, layout_type: 2, title: '새로운 세로 타입', content: '...', author: { nickname: '유저5', profilePic: defaultProfilePic }, likes: 33 },
    ];
    return newFeeds;
  };
  
  const loadFeeds = useCallback(() => {
    console.log("Loading page:", page);
    setLoading(true);
    setTimeout(() => {
      const newFeeds = generateMockFeeds(page);
      setFeeds(prevFeeds => [...prevFeeds, ...newFeeds]);
      setHasMore(page < 5);
      setLoading(false);
    }, 1000);
  }, [page]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  const lastFeedElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleCardClick = (feed) => setSelectedFeed(feed);
  const closeModal = () => setSelectedFeed(null);
  const handleSearch = () => alert(`'${searchQuery}'(으)로 검색을 수행합니다.`);

  return (
    <div className="main-feed-wrapper">
      {/* Header and Buttons */}
      <span onClick={() => { if (isLoggedIn) { sessionStorage.clear(); navigate('/login'); } else { navigate('/login'); }}} className="login-logout-button" >
        {isLoggedIn ? 'Logout' : 'Login'}
      </span>
      <div className="main-header">
        <img src={logo} alt="Petstagram Logo" className="main-logo" />
      </div>
      <div className="top-buttons">
        <button className="my-feed-button" onClick={() => { if (!isLoggedIn) { alert('로그인이 필요합니다.'); navigate('/login'); } else { navigate('/myfeednet'); }}}>
          내 피드 보기
        </button>
      </div>
      <h2>🐾 전체 피드 (레이아웃 테스트)</h2>
      
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="관심 있는 내용을 검색해보세요..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>

      <div className="filter-buttons">
        <button className={selectedCategory === null ? 'active' : ''} onClick={() => setSelectedCategory(null)} >
          전체
        </button>
        {Object.entries(categoryMap).map(([key, value]) => (
          <button key={key} className={selectedCategory === Number(key) ? 'active' : ''} onClick={() => setSelectedCategory(Number(key))} >
            {value.icon} {value.name}
          </button>
        ))}
      </div>

      {/* Feed Grid */}
      <div className="main-feed-grid">
        {feeds.map((feed, index) => {
          // 마지막 요소에 ref를 할당합니다.
          if (feeds.length === index + 1) {
            return <MainFeedCard ref={lastFeedElementRef} key={feed.id} feed={feed} onCardClick={handleCardClick} />;
          } else {
            return <MainFeedCard key={feed.id} feed={feed} onCardClick={handleCardClick} />;
          }
        })}
      </div>
      
      {loading && <div className="loading-indicator">로딩 중...</div>}
      {!hasMore && <div className="loading-indicator">모든 피드를 불러왔습니다.</div>}

      <Modal feed={selectedFeed} onClose={closeModal} />
    </div>
  );
};

export default MainPage;
