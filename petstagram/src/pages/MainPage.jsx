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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryMap } from "../constants/categoryMap";
import SimpleFeedCard from "../components/SimpleFeedCard";
import "../styles/pages/MyFeedNetPage.css";
import logo from "../assets/main_logo.png";
import api from "../api/api";

const MainPage = ({ feeds }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feedsWithLike, setFeedsWithLike] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const feedsPerPage = 9; // 3x3
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [editFeedMode, setEditFeedMode] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editCategory, setEditCategory] = useState(1);

  // 내 닉네임 가져오기
  const myNickname = sessionStorage.getItem('nickname');

  // 로그인 상태 확인
  const isLoggedIn = !!sessionStorage.getItem('nickname');

  // 로그 추가
  console.log('feeds:', feeds);
  console.log('feedsWithLike:', feedsWithLike);
  console.log('myNickname:', myNickname);
  console.log('otherFeeds:', feedsWithLike.filter(feed => feed.username !== myNickname));

  useEffect(() => {
    const initialized = feeds.map(feed => ({
      ...feed,
      is_liked: false,
      like_count: feed.like_count ?? 0,
    }));
    setFeedsWithLike(initialized);
  }, [feeds]);

  // 내 게시물이 아닌 것만 필터링
  const otherFeeds = feedsWithLike.filter(feed => feed.username !== myNickname);

  // 좋아요 순 정렬
  const sortedFeeds = [...otherFeeds].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));

  const filteredFeeds = selectedCategory === null
    ? sortedFeeds
    : sortedFeeds.filter(feed => feed.category === selectedCategory);

  console.log('filteredFeeds:', filteredFeeds);

  const pageCount = Math.ceil(filteredFeeds.length / feedsPerPage);
  const paginatedFeeds = filteredFeeds.slice((currentPage - 1) * feedsPerPage, currentPage * feedsPerPage);

  console.log('paginatedFeeds:', paginatedFeeds);

  const handleToggleLike = async (feedId, isLiked) => {
    try {
      await api.post(`/feeds/${feedId}/like`);
      // 프론트 상태는 즉시 변경하지 않음
      // fetchFeeds(); // 새로고침/재진입 시에만 반영
    } catch (err) {
      alert("좋아요 처리 실패: " + err.message);
    }
  };

  return (
    <div className="myfeed-page" style={{ position: 'relative' }}>
      {/* 최상단 우측: 로그인/로그아웃 텍스트 */}
      <span
        onClick={() => {
          if (isLoggedIn) {
            sessionStorage.clear();
            navigate('/login');
          } else {
            navigate('/login');
          }
        }}
        style={{
          position: 'absolute',
          top: '18px',
          right: '32px',
          color: '#888',
          fontSize: '0.95rem',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontWeight: 400,
          background: 'none',
          border: 'none',
          padding: 0,
          zIndex: 100
        }}
      >
        {isLoggedIn ? 'Logout' : 'Login'}
      </span>
      {/* 메인 로고 가운데 정렬 */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <img src={logo} alt="Petstagram Logo" style={{ maxWidth: '320px', width: '60%' }} />
      </div>
      <div className="top-buttons" style={{ justifyContent: 'flex-end', width: '100%', marginBottom: '1rem' }}>
        <button
          style={{
            border: '2px solid #4e8cff',
            background: 'transparent',
            color: '#4e8cff',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#4e8cff';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4e8cff';
          }}
          onClick={() => {
            if (!sessionStorage.getItem('nickname')) {
              alert('로그인이 필요합니다.');
              navigate('/login');
            } else {
              navigate('/myfeednet');
            }
          }}
        >
          내 피드 보기
        </button>
      </div>
      <h2>🐾 전체 피드</h2>
      <div className="filter-buttons">
        <button
          className={selectedCategory === null ? "active" : ""}
          onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
        >
          전체
        </button>
        {Object.entries(categoryMap).map(([key, value]) => (
          <button
            key={key}
            className={selectedCategory === Number(key) ? "active" : ""}
            onClick={() => { setSelectedCategory(Number(key)); setCurrentPage(1); }}
          >
            {value.icon} {value.name}
          </button>
        ))}
      </div>
      {/* 3x3 그리드 적용, SimpleFeedCard 사용 */}
      <div className="feed-section" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {paginatedFeeds.length === 0 ? (
          <p className="no-feed-message">해당 카테고리에 게시물이 없습니다.</p>
        ) : (
          paginatedFeeds.map(feed => (
            <SimpleFeedCard
              key={feed.id}
              feed={feed}
              onToggleLike={handleToggleLike}
              onDelete={null}
              onImageClick={feed => {
                setSelectedFeed(feed);
                setEditSubject(feed.subject);
                setEditContent(feed.content);
              }}
            />
          ))
        )}
      </div>
      {pageCount > 1 && (
        <div className="pagination-controls">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>이전</button>
          {[...Array(pageCount)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={currentPage === idx + 1 ? "active" : ""}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>다음</button>
        </div>
      )}
      {/* 상세 모달 */}
      {selectedFeed && (
        <div className="modal-overlay" onClick={() => setSelectedFeed(null)}>
          <div className="modal-detail" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFeed(null)}>✕</button>
            {(() => {
              const image = selectedFeed.images?.[0];
              const imageUrl = image?.startsWith('http') ? image : API_URL + image;
              return (
                <img src={imageUrl} alt="상세 이미지" className="modal-image" />
              );
            })()}
            <div className="modal-content-wrapper">
              {editFeedMode ? (
                <>
                  <div className="modal-field">
                    <label>제목</label>
                    <input value={editSubject} onChange={e => setEditSubject(e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>내용</label>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} />
                  </div>
                  <div className="modal-buttons">
                    <button onClick={() => setEditFeedMode(false)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{selectedFeed.subject || "제목 없음"}</h3>
                  <p>{selectedFeed.content}</p>
                  {/* 수정 버튼은 비활성화(타인 피드이므로) */}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
