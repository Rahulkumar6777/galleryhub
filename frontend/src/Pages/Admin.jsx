import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../api/BaseUrl';

axios.defaults.withCredentials = true;

const GalleryAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [uploadData, setUploadData] = useState({
    filename: '',
    category: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [isDeleting, setIsDeleting] = useState('');
  
  const [activeTab, setActiveTab] = useState('browse');


  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const authResponse = await axios.get(`${API_BASE}/admin/check`);
      
      
      if (authResponse.status === 200) {
        setIsAuthenticated(true);
        try {
          const categoriesResponse = await axios.get(`${API_BASE}/public/category`);
          if (categoriesResponse.status === 200 && categoriesResponse.data.categories) {
            setCategories(categoriesResponse.data.categories);
          }
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          setCategories([]);
        }
      } else {
        setIsAuthenticated(false);
        setCategories([]);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCategories([]);
      console.error('Authentication check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await axios.post(`${API_BASE}/admin/login`, {
        username: loginData.username,
        password: loginData.password
      });

     
      if (response.status === 200) {
        await checkAuth();
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/admin/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCategories([]);
      setPosts([]);
      setSelectedCategory('');
      setUploadData({ filename: '', category: '', file: null });
    }
  };


  const fetchPosts = async (categoryId, page = 1) => {
    if (!categoryId) return;
    
    setIsLoadingPosts(true);
    try {
      const response = await axios.get(`${API_BASE}/public/post`, {
        params: {
          categoryId,
          page,
          limit: pagination.limit
        }
      });

      
      if (response.status === 200 && response.data.posts) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination || {
          page: 1,
          limit: pagination.limit,
          total: response.data.posts.length,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        await checkAuth();
      }
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchPosts(selectedCategory);
    }
  }, [selectedCategory]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.filename || !uploadData.category) {
      alert('Please fill all fields and select a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('filename', uploadData.filename);
    formData.append('categoryId', uploadData.category);

    try {
      const response = await axios.post(`${API_BASE}/admin/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.status === 200) {
        alert('File uploaded successfully!');
        setUploadData({ filename: '', category: '', file: null });
        setUploadProgress(0);
        if (uploadData.category === selectedCategory) {
          fetchPosts(selectedCategory);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Upload failed');
      if (error.response?.status === 401 || error.response?.status === 403) {
        await checkAuth();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    setIsDeleting(postId);
    try {
      const response = await axios.delete(`${API_BASE}/admin/file/${postId}`);
      
      if (response.status === 200) {
        setPosts(posts.filter(post => post._id !== postId));
        alert('Image deleted successfully');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
      if (error.response?.status === 401 || error.response?.status === 403) {
        await checkAuth();
      }
    } finally {
      setIsDeleting('');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPosts(selectedCategory, newPage);
    }
  };

  const SkeletonLoader = ({ count = 6 }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-300 rounded-lg h-48 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">GalleryHub Admin</h1>
            <p className="text-gray-300">Sign in to manage your content</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold">GalleryHub Admin</h1>
              <p className="text-gray-400">Manage your gallery content</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg border border-red-600/30 hover:border-red-600/50 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      
      <main className="container mx-auto px-4 py-8">
      
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              {activeTab === 'browse' ? (
                <>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">Upload New Image</h2>
                  <p className="text-gray-400">Fill the form below to upload a new image</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => {
                  setActiveTab('browse');
                  setUploadData({ filename: '', category: '', file: null });
                }}
                className={`px-6 py-2 rounded-md transition-all duration-200 ${activeTab === 'browse' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Browse
              </button>
              <button
                onClick={() => {
                  setActiveTab('upload');
                  setSelectedCategory('');
                }}
                className={`px-6 py-2 rounded-md transition-all duration-200 ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'browse' ? (
          <div>
            {!selectedCategory ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Category</h3>
                <p className="text-gray-500">Choose a category from the dropdown to view its images</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Images in {categories.find(c => c._id === selectedCategory)?.name || 'Category'}
                    <span className="ml-2 text-sm text-gray-400">({pagination.total} total)</span>
                  </h2>
                  
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 bg-gray-800/50 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 bg-gray-800 rounded-lg">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 bg-gray-800/50 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {isLoadingPosts ? (
                  <SkeletonLoader count={8} />
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Images Found</h3>
                    <p className="text-gray-500">This category doesn't have any images yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {posts.map(post => (
                      <div key={post._id} className="relative bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                        <div className="aspect-square overflow-hidden relative group">
                          <img
                            src={post.imgUrl.thumb}
                            alt={post.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                        
                        <div className="p-3">
                          <p className="text-sm truncate mb-2" title={post.filename}>
                            {post.filename}
                          </p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              {post.imgUrl.xl ? '4 sizes' : '1 size'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            disabled={isDeleting === post._id}
                            className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg border border-red-600/30 hover:border-red-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative z-10"
                          >
                            {isDeleting === post._id ? (
                              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            {isDeleting === post._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={uploadData.filename}
                    onChange={(e) => setUploadData({...uploadData, filename: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Beautiful Landscape"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Image File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-xl hover:border-blue-500/50 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    {uploadData.file ? (
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="mt-2 text-sm text-gray-400">
                          Selected: {uploadData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setUploadData({...uploadData, file: null})}
                          className="mt-2 text-sm text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="flex text-sm text-gray-400">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                              className="sr-only"
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
            
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">Uploading...</span>
                    <span className="text-sm font-medium text-blue-400">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : 'Upload Image'}
              </button>
            </form>
          </div>
        )}
      </main>

      
      <footer className="mt-12 py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>GalleryHub Admin Panel • All rights reserved</p>
          <p className="mt-1">Total Categories: {categories.length} • Total Images: {pagination.total}</p>
        </div>
      </footer>
    </div>
  );
};

export default GalleryAdmin;