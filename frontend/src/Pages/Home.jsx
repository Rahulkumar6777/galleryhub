import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Download, Grid3x3, Loader2, ZoomIn, Heart } from 'lucide-react';
import { API_BASE } from '../api/BaseUrl';

export default function GallerHub() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [modalImageLoaded, setModalImageLoaded] = useState(false);
  const [imageQuality, setImageQuality] = useState('xl');
  const [likedImages, setLikedImages] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const imageRefs = useRef({});
  const modalRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    const savedLikes = localStorage.getItem('gallerhub-likes');
    if (savedLikes) {
      setLikedImages(JSON.parse(savedLikes));
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchPosts();
    }
  }, [selectedCategory, page]);

  
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(`${API_BASE}/public/category`);
      const data = await res.json();
      setCategories(data.categories || []);
      if (data.categories && data.categories.length > 0) {
        setSelectedCategory(data.categories[0]._id);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/public/post?categoryId=${selectedCategory}&page=${page}&limit=12`
      );
      const data = await res.json();
      setPosts(data.posts || []);
      setPagination(data.pagination || null);
      setImageLoading({});
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const sendImpressionRequest = async (postId) => {
    try {
      fetch(`${API_BASE}/public/post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.log('Impression request failed silently:', error);
      });
    } catch (error) {
      console.log(error)
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageClick = (post) => { 
    sendImpressionRequest(post._id);
    setSelectedImage(post);
  };

  const handleDownload = async (post) => {
    try {
      const imageUrl = post.imgUrl.xl;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = post.filename || `wallpaper-${post._id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleImageLoad = (id) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id, url) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
    const imgElement = imageRefs.current[id];
    if (imgElement && imgElement.src !== url.medium) {
      imgElement.src = url.medium;
    }
  };

  const toggleLike = (id) => {
    const newLikedImages = { ...likedImages };
    if (newLikedImages[id]) {
      delete newLikedImages[id];
    } else {
      newLikedImages[id] = true;
    }
    setLikedImages(newLikedImages);
    localStorage.setItem('gallerhub-likes', JSON.stringify(newLikedImages));
  };

  const getResponsiveImage = (imgUrl, width = window.innerWidth) => {
    if (width < 640) return imgUrl.thumb;
    if (width < 1024) return imgUrl.medium;
    if (width < 1536) return imgUrl.large;
    return imgUrl.xl;
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  
  useEffect(() => {
    if (selectedImage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setModalImageLoaded(false);
    }
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1d29] to-[#1a1d29]">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      
      <header className="relative bg-gradient-to-r from-[#1a1d29]/80 to-[#1a1d29]/60 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative animate-pulse-slow">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 blur-lg opacity-50 animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                GalleryHub
              </h1>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-800/40 hover:from-gray-700/80 hover:to-gray-700/40 transition-all duration-300 border border-gray-700/50 shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95">
                <Grid3x3 className="w-5 h-5 text-gray-300" />
              </button>
              <div className="relative group flex-1 sm:flex-none">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm backdrop-blur-sm hover:border-gray-600/50"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      
      <div className="relative bg-[#1a1d29]/40 backdrop-blur-sm border-b border-gray-800/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto py-4 custom-scrollbar">
            {loadingCategories ? (
              [...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-32 h-11 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl animate-pulse border border-gray-700/30"
                />
              ))
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    selectedCategory === category._id
                      ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg shadow-cyan-500/20 border border-cyan-500/30'
                      : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  {selectedCategory === category._id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-md animate-pulse"></div>
                  )}
                  <span className="relative flex items-center gap-2">
                    {category.name}
                    {selectedCategory === category._id && (
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                    )}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-gray-500 text-sm py-2 px-4">
                No categories found
              </div>
            )}
          </div>
        </div>
      </div>

      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse"></div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Wallpapers
            </h2>
            <p className="text-gray-500 text-sm mt-1">High quality wallpapers for every screen</p>
          </div>
        </div>
      </div>

      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-2xl animate-pulse border border-gray-700/30"
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => handleImageClick(post)}
                  onMouseEnter={() => setHoveredImage(post._id)}
                  onMouseLeave={() => setHoveredImage(null)}
                  className="group relative aspect-[16/10] bg-gray-900/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/20 border border-gray-800/50 hover:border-cyan-500/30"
                >
                  
                  {imageLoading[post._id] !== false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                  )}
                  
                  
                  <img
                    ref={el => imageRefs.current[post._id] = el}
                    src={getResponsiveImage(post.imgUrl)}
                    alt={post.filename}
                    className={`w-full h-full object-cover transition-all duration-700 ${hoveredImage === post._id ? 'scale-110' : 'scale-100'}`}
                    onLoad={() => handleImageLoad(post._id)}
                    onError={() => handleImageError(post._id, post.imgUrl)}
                    loading="lazy"
                  />
                  
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(post._id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 z-20"
                  >
                    <Heart 
                      className={`w-4 h-4 ${likedImages[post._id] ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                    />
                  </button>
                  
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-white font-medium text-sm truncate">
                        {post.filename}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(post);
                        }}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-all"
                      >
                        <ZoomIn className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(post);
                        }}
                        className="p-2 bg-cyan-500/80 backdrop-blur-sm rounded-lg hover:bg-cyan-600 transition-all"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                    <span className="text-xs text-gray-300">HD</span>
                  </div>
                  
                  
                  {hoveredImage === post._id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
                  )}
                </div>
              ))}
            </div>

           
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-800/40 text-gray-300 hover:from-gray-700/80 hover:to-gray-700/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 border border-gray-700/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30 scale-110'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70 hover:text-gray-300 border border-gray-700/30'
                        }`}
                      >
                        {page === pageNum && (
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl blur animate-pulse"></div>
                        )}
                        <span className="relative">{pageNum}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-800/40 text-gray-300 hover:from-gray-700/80 hover:to-gray-700/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 border border-gray-700/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <Grid3x3 className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400 text-lg font-medium">No wallpapers found</p>
              <p className="text-gray-500 text-sm mt-2">Try selecting a different category</p>
            </div>
          </div>
        )}
      </main>

     
      {selectedImage && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={(e) => {
            if (e.target === modalRef.current) {
              setSelectedImage(null);
            }
          }}
        >
          
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl"></div>
          
         
          <button
            onClick={() => setSelectedImage(null)}
            className="fixed top-6 right-6 p-3 rounded-xl bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700/80 transition-all duration-300 border border-gray-700/50 hover:shadow-lg hover:shadow-cyan-500/20 z-50 hover:scale-105 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          
          
          <div className="relative w-full max-w-6xl my-8 z-40">
            
            {!modalImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              </div>
            )}
            
            
            <div 
              className={`relative rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 border border-gray-700/30 transition-all duration-500 ${modalImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={selectedImage.imgUrl.xl}
                alt={selectedImage.filename}
                className="w-full h-auto max-h-[70vh] object-contain"
                onLoad={() => setModalImageLoaded(true)}
                onError={() => {
                  setModalImageLoaded(true);
                  const img = document.querySelector('.modal-image');
                  if (img && img.src !== selectedImage.imgUrl.large) {
                    img.src = selectedImage.imgUrl.large;
                  }
                }}
              />
            </div>
            
           
            <div className={`mt-6 space-y-4 transition-all duration-500 ${modalImageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              <h3 className="text-2xl font-bold text-white text-center">
                {selectedImage.filename}
              </h3>
              
              
              <p className="text-gray-400 text-sm text-center">
                {new Date(selectedImage.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              
              
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 text-sm">Quality:</span>
                <select 
                  value={imageQuality}
                  onChange={(e) => setImageQuality(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="xl">Ultra HD (4K)</option>
                  <option value="large">Full HD</option>
                  <option value="medium">HD</option>
                  <option value="thumb">Preview</option>
                </select>
              </div>
              
             
              <div className="flex items-center justify-center gap-3 pt-4">
                <button 
                  onClick={() => handleDownload(selectedImage)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download ({imageQuality.toUpperCase()})
                </button>
                <button 
                  onClick={() => toggleLike(selectedImage._id)}
                  className="p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:scale-105 active:scale-95"
                >
                  <Heart 
                    className={`w-5 h-5 ${likedImages[selectedImage._id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                  />
                </button>
              </div>
              
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                  <p className="text-gray-400 text-sm">File Name</p>
                  <p className="text-white font-medium truncate">{selectedImage.filename}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                  <p className="text-gray-400 text-sm">Upload Date</p>
                  <p className="text-white font-medium">
                    {new Date(selectedImage.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white font-medium">
                    {categories.find(cat => cat._id === selectedImage.category)?.name || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                  <p className="text-gray-400 text-sm">Format</p>
                  <p className="text-white font-medium">PNG/JPEG</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #0891b2, #7c3aed);
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
       
        @media (max-width: 640px) {
          .grid-cols-1 {
            grid-template-columns: 1fr;
          }
          .gap-5 {
            gap: 1rem;
          }
          .text-4xl {
            font-size: 2rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1025px) and (max-width: 1280px) {
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (min-width: 1281px) {
          .grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}