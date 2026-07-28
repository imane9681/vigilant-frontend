import React, { useState, useEffect, useRef } from 'react';
import { Edit2, X, Save, Upload, ChevronLeft, ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react';

import { useCategories } from '../../../contexts/CategoryContext';
// ✅ استيراد الدالة المساعدة من api.js
import { getImageUrl } from '../../../services/api';

const ProductEditModal = ({ 
  darkMode,
  editingProduct,
  editForm,
  currentProductImage,
  currentImagesList,
  newImagePreviews,
  handleInputChange,
  handleNewImageUpload,
  handleRemoveCurrentImage,
  handleRemoveNewImage,
  handleUpdate,
  handleCancelEdit,
  setNewImages,
  setNewImagePreviews,
  setCurrentProductImage,
}) => {
  const { getCategoryOptions } = useCategories();
  const categoriesList = getCategoryOptions();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imagesList, setImagesList] = useState([]);
  const [newImages, setNewImagesLocal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localNewPreviews, setLocalNewPreviews] = useState([]);
  const carouselRef = useRef(null);

  // تهيئة الصور عند فتح المودال
  useEffect(() => {
    const buildImagesList = () => {
      const images = [];
      
      if (currentImagesList && currentImagesList.length > 0) {
        images.push(...currentImagesList);
      } else if (currentProductImage) {
        images.push(currentProductImage);
      }
      
      setImagesList(images);
    };
    
    buildImagesList();
    setActiveImageIndex(0);
  }, [currentImagesList, currentProductImage]);

  useEffect(() => {
    setLocalNewPreviews(newImagePreviews || []);
  }, [newImagePreviews]);

  const hasMultipleImages = imagesList.length > 1;

  // ✅ استخدام getImageUrl المستوردة بدلاً من الدالة المكررة
  const getImageDisplayUrl = (imageField) => {
    if (!imageField) {
      return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop';
    }
    return getImageUrl(imageField);
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const handleRemoveCurrentImageLocal = (index) => {
    if (handleRemoveCurrentImage) {
      handleRemoveCurrentImage(index);
      
      const updatedImages = imagesList.filter((_, i) => i !== index);
      setImagesList(updatedImages);
      
      if (updatedImages.length === 0) {
        if (setCurrentProductImage) {
          setCurrentProductImage(null);
        }
        if (handleInputChange) {
          handleInputChange({ target: { name: 'image', value: null } });
        }
      } else if (index === activeImageIndex) {
        setActiveImageIndex(0);
      }
    }
  };

  const handleRemoveNewImageLocal = (index) => {
    if (handleRemoveNewImage) {
      handleRemoveNewImage(index);
    }
    
    setLocalNewPreviews(prev => prev.filter((_, i) => i !== index));
    
    const newImagesArray = [...newImages];
    newImagesArray.splice(index, 1);
    setNewImagesLocal(newImagesArray);
    
    if (setNewImages) {
      setNewImages(newImagesArray);
    }
    
    if (setNewImagePreviews) {
      setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    if (imagesList.length > 0 && !currentProductImage) {
      const firstImage = imagesList[0];
      if (firstImage && setCurrentProductImage) {
        setCurrentProductImage(firstImage);
      }
    }
  }, [imagesList, currentProductImage, setCurrentProductImage]);

  const handleNewImageUploadLocal = (e) => {
    const files = Array.from(e.target.files);
    
    const totalImages = imagesList.length + localNewPreviews.length;
    if (totalImages + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const newImagesArray = [...newImages];
    const newPreviewsArray = [...localNewPreviews];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return;
      }

      newImagesArray.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewsArray.push(reader.result);
        setLocalNewPreviews([...newPreviewsArray]);
        
        if (setNewImagePreviews) {
          setNewImagePreviews([...newPreviewsArray]);
        }
      };
      reader.readAsDataURL(file);
    });

    setNewImagesLocal(newImagesArray);
    if (setNewImages) {
      setNewImages(newImagesArray);
    }
    
    if (handleNewImageUpload) {
      handleNewImageUpload(e);
    }
  };

  const handleTagsChange = (e) => {
    handleInputChange(e);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      formData.append('name', String(editForm.name || ''));
      formData.append('description', String(editForm.description || ''));
      formData.append('price', String(editForm.price || '0'));
      formData.append('quantity', String(editForm.quantity || '0'));
      formData.append('category', String(editForm.category || ''));
      formData.append('sku', String(editForm.sku || ''));
      formData.append('weight', String(editForm.weight || ''));
      formData.append('dimensions', String(editForm.dimensions || ''));
      formData.append('manufacturer', String(editForm.manufacturer || ''));
      const wm = editForm.warranty_months;
      formData.append('warranty_months', (wm === null || wm === undefined || wm === '') ? '' : String(wm));
      
      const tagsValue = editForm.tags || '';
      if (tagsValue.trim() !== '') {
        const tagsArray = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tagsArray));
      } else {
        formData.append('tags', JSON.stringify([]));
      }
      
      formData.append('featured', editForm.featured ? 'true' : 'false');
      formData.append('in_stock', editForm.in_stock ? 'true' : 'false');
      
      if (imagesList.length > 0) {
        const normalized = imagesList.map((img) => {
          if (!img || typeof img !== 'string') return img;
          const mediaIndex = img.indexOf('/media/');
          if (mediaIndex !== -1) {
            return img.substring(mediaIndex + '/media/'.length);
          }
          if (img.startsWith('/media/')) {
            return img.replace(/^\/media\//, '');
          }
          return img;
        });
        formData.append('images', JSON.stringify(normalized));
      } else {
        formData.append('images', JSON.stringify([]));
      }

      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          formData.append('images', newImages[i]);
        }
      }
      
      await handleUpdate(formData);
      
      window.dispatchEvent(new Event('product-updated'));
      window.dispatchEvent(new Event('inventory-updated'));
      
    } catch (error) {
      console.error('خطأ:', error);
      alert('فشل التحديث: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
        <div className={`sticky top-0 z-20 border-b p-6 ${darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: '#8B7ABA' }}>
                <Edit2 size={20} className="text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>
                Edit Product: {editingProduct?.name || ''}
              </h2>
            </div>
            <button
              onClick={handleCancelEdit}
              className={`p-2 rounded-lg transition-colors hover:scale-110 ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
              aria-label="Close edit modal"
            >
              <X size={24} className={darkMode ? "text-neutral-400" : "text-neutral-500"} />
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info & Images */}
            <div className="space-y-8">
              {/* Basic Information */}
              <div className={`rounded-2xl p-6 ${darkMode 
                ? 'bg-gradient-to-br from-neutral-800 to-neutral-900' 
                : 'bg-gradient-to-br from-neutral-50 to-neutral-100'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                ${darkMode 
                                  ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                  : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={editForm.sku || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Category</label>
                      <select
                        name="category"
                        value={editForm.category || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                      >
                        <option value="">Select Category</option>
                        {categoriesList.map((category) => {
                          const categoryId = category.id;
                          const categoryName = category.name || `Category ${categoryId}`;
                          return (
                            <option key={categoryId} value={categoryId}>
                              {categoryName}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Description</label>
                    <textarea
                      name="description"
                      value={editForm.description || ''}
                      onChange={handleInputChange}
                      rows="4"
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                ${darkMode 
                                  ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                  : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Product Images - Fixed Carousel */}
              <div className={`rounded-2xl p-6 ${darkMode 
                ? 'bg-gradient-to-br from-[#8B7ABA]/10 to-[#F08FAE]/10' 
                : 'bg-gradient-to-br from-[#8B7ABA]/5 to-[#F08FAE]/5'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>Product Images</h3>
                
                <div className="space-y-6">
                  {/* Current Images */}
                  {imagesList.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          Current Images ({imagesList.length})
                        </label>
                      </div>
                      
                      {/* Carousel Container with fixed positioning */}
                      <div className="relative" ref={carouselRef}>
                        {/* Main image display */}
                        <div className="relative bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden">
                          <img 
                            src={getImageDisplayUrl(imagesList[activeImageIndex])} 
                            alt={`Product ${activeImageIndex + 1}`} 
                            className="w-full h-64 object-contain transition-all duration-500"
                          />
                          
                          {/* Navigation buttons - fixed position within image container */}
                          {hasMultipleImages && (
                            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                              <button
                                type="button"
                                onClick={prevImage}
                                className="pointer-events-auto p-3 rounded-full
                                         bg-black/60 backdrop-blur-sm text-white
                                         transition-all duration-300
                                         hover:bg-black/80 hover:scale-110
                                         focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]"
                                aria-label="Previous image"
                              >
                                <ChevronLeft size={24} />
                              </button>
                              
                              <button
                                type="button"
                                onClick={nextImage}
                                className="pointer-events-auto p-3 rounded-full
                                         bg-black/60 backdrop-blur-sm text-white
                                         transition-all duration-300
                                         hover:bg-black/80 hover:scale-110
                                         focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]"
                                aria-label="Next image"
                              >
                                <ChevronRight size={24} />
                              </button>
                            </div>
                          )}
                          
                          {/* Image counter */}
                          {hasMultipleImages && (
                            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg
                                          bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                              {activeImageIndex + 1} / {imagesList.length}
                            </div>
                          )}
                          
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCurrentImageLocal(activeImageIndex)}
                            className="absolute top-3 right-3 p-2 rounded-lg
                                     bg-red-500/80 backdrop-blur-sm text-white
                                     transition-all duration-300
                                     hover:bg-red-600 hover:scale-110
                                     focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete this image"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        {/* Thumbnails - horizontal scrollable */}
                        {hasMultipleImages && (
                          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                            {imagesList.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden
                                          transition-all duration-300 hover:scale-105
                                          focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                                          ${idx === activeImageIndex 
                                            ? 'ring-2 ring-[#8B7ABA] ring-offset-2 dark:ring-offset-neutral-800' 
                                            : 'opacity-60 hover:opacity-100'}`}
                              >
                                <img 
                                  src={getImageDisplayUrl(img)} 
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload New Images */}
                  <div className="space-y-3">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Add New Images
                    </label>
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 hover:scale-[1.02]
                                  ${darkMode 
                                    ? 'border-neutral-700 hover:border-[#8B7ABA] bg-neutral-700/20' 
                                    : 'border-neutral-300 hover:border-[#8B7ABA] bg-neutral-50/50'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewImageUploadLocal}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label htmlFor="edit-image-upload" className="cursor-pointer block">
                        <Upload className={`mx-auto mb-3 transition-transform group-hover:scale-110 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} size={32} />
                        <p className={`font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Click to upload new images</p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>Supports JPG, PNG, GIF up to 5MB each</p>
                        <p className={`text-xs mt-2 ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>Maximum 5 images total</p>
                        <button
                          type="button"
                          className="mt-4 px-6 py-2.5 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                          style={{ background: '#8B7ABA' }}
                          onClick={() => document.getElementById('edit-image-upload').click()}
                        >
                          Choose Files
                        </button>
                      </label>
                    </div>
                  </div>
                  
                  {/* New Image Previews */}
                  {localNewPreviews.length > 0 && (
                    <div className="space-y-3">
                      <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        New Images to Upload ({localNewPreviews.length})
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {localNewPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`New preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImageLocal(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 
                                       hover:bg-red-600 transition-all hover:scale-110 active:scale-95
                                       opacity-0 group-hover:opacity-100 shadow-md"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Pricing, Inventory & Details */}
            <div className="space-y-8">
              {/* Pricing & Inventory */}
              <div className={`rounded-2xl p-6 ${darkMode 
                ? 'bg-gradient-to-br from-emerald-900/10 to-green-900/10' 
                : 'bg-gradient-to-br from-emerald-50 to-green-50'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>Pricing & Inventory</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Price ($) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className={`absolute left-4 top-3 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>$</span>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price || ''}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                    ${darkMode 
                                      ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                      : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                          required
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={editForm.quantity || 0}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="in_stock"
                          checked={editForm.in_stock || false}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${editForm.in_stock 
                          ? 'bg-emerald-500' 
                          : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editForm.in_stock ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
                      <span className={`text-sm font-medium transition-colors group-hover:${editForm.in_stock ? 'text-emerald-600' : 'text-neutral-500'} ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>In Stock</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={editForm.featured || false}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${editForm.featured 
                          ? 'bg-yellow-500' 
                          : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editForm.featured ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
                      <span className={`text-sm font-medium transition-colors group-hover:text-yellow-600 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Featured</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={editForm.weight || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Dimensions</label>
                      <input
                        type="text"
                        name="dimensions"
                        value={editForm.dimensions || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                        placeholder="L×W×H"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className={`rounded-2xl p-6 ${darkMode 
                ? 'bg-gradient-to-br from-purple-900/10 to-pink-900/10' 
                : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>Additional Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Manufacturer</label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={editForm.manufacturer || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Warranty (months)</label>
                      <input
                        type="number"
                        name="warranty_months"
                        value={editForm.warranty_months || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                  ${darkMode 
                                    ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                    : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={editForm.tags || ''}
                      onChange={handleTagsChange}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all
                                ${darkMode 
                                  ? 'bg-neutral-700 border-neutral-600 text-neutral-200 focus:ring-[#8B7ABA]' 
                                  : 'bg-white border-neutral-300 focus:ring-[#8B7ABA]'}`}
                      placeholder="e.g., premium, wireless, new-arrival"
                    />
                    <p className={`text-xs mt-2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Separate tags with commas. Example: premium, wireless, new-arrival
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex gap-4 pt-8 mt-8 border-t" style={{borderColor: darkMode ? '#374151' : '#e5e7eb'}}>
            <button
              type="button"
              onClick={handleCancelEdit}
              className={`flex-1 px-6 py-3.5 font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95
                        ${darkMode 
                          ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' 
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'}`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden flex-1 px-6 py-3.5 
                       text-white font-bold rounded-xl shadow-lg hover:shadow-xl 
                       transition-all duration-300 hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed
                       before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                       before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              style={{ background: '#8B7ABA' }}
            >
              <div className="relative flex items-center justify-center gap-2">
                <Save size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                {loading ? 'Saving...' : 'Save Changes'}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;