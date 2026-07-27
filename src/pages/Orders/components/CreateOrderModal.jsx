// frontend/src/pages/Orders/components/CreateOrderModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, Search, User, Package, DollarSign, CreditCard, AlertCircle, CheckCircle, UserPlus, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { orderService } from '../../../services/api';
import { productService } from '../../../services/api';
import { customerService } from '../../../services/api';

const CreateOrderModal = ({ darkMode, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customerType, setCustomerType] = useState('existing');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  
  // ✅ ✅ ✅ State للتمرير اللانهائي
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const observerRef = useRef(null);
  const productsPerPage = 20;

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ ✅ ✅ جلب المنتجات مع الترحيل
  const fetchProducts = useCallback(async (page = 1, search = '') => {
    try {
      setLoadingProducts(true);
      const params = {
        page: page,
        page_size: productsPerPage,
      };
      if (search) {
        params.search = search;
      }
      
      const response = await productService.getAll(params);
      const data = response.data;
      
      let results = [];
      let total = 0;
      
      if (data.results) {
        results = data.results;
        total = data.count || 0;
      } else if (Array.isArray(data)) {
        results = data;
        total = data.length;
      }
      
      setTotalProducts(total);
      
      if (page === 1) {
        setProducts(results);
        setDisplayedProducts(results);
      } else {
        setProducts(prev => [...prev, ...results]);
        setDisplayedProducts(prev => [...prev, ...results]);
      }
      
      setHasMoreProducts(results.length === productsPerPage && (page * productsPerPage) < total);
      
      return results;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // ✅ ✅ ✅ جلب العملاء
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customerService.getAll({ page_size: 100 });
      const data = response.data.results || response.data;
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  // ✅ ✅ ✅ تحميل المزيد من المنتجات
  const loadMoreProducts = useCallback(() => {
    if (!hasMoreProducts || loadingProducts) return;
    const nextPage = productPage + 1;
    setProductPage(nextPage);
    fetchProducts(nextPage, searchProduct);
  }, [hasMoreProducts, loadingProducts, productPage, fetchProducts, searchProduct]);

  // ✅ ✅ ✅ إعداد Intersection Observer للتمرير اللانهائي
  const lastProductRef = useCallback((node) => {
    if (loadingProducts) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreProducts) {
        loadMoreProducts();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingProducts, hasMoreProducts, loadMoreProducts]);

  // ✅ ✅ ✅ البحث في المنتجات
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchProduct.trim() || searchProduct === '') {
        setProductPage(1);
        fetchProducts(1, searchProduct);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchProduct, fetchProducts]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      setProductPage(1);
      fetchProducts(1, '');
      setStep(1);
      setSelectedCustomer(null);
      setOrderItems([]);
      setError('');
      setSuccess(false);
      setCustomerType('existing');
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: ''
      });
    }
  }, [isOpen, fetchCustomers, fetchProducts]);

  // ✅ دالة لتحويل السعر إلى رقم بشكل آمن
  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const cleaned = price.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // ✅ إنشاء عميل جديد
  const createNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      setError('Name and email are required for new customer');
      return null;
    }

    setCreatingCustomer(true);
    
    try {
      const response = await customerService.create({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone || '',
        address: newCustomer.address || '',
        city: newCustomer.city || '',
        country: newCustomer.country || ''
      });
      
      const createdCustomer = response.data;
      setCustomers(prev => [createdCustomer, ...prev]);
      setSelectedCustomer(createdCustomer);
      
      return createdCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err.response?.data?.detail || 'Failed to create customer');
      return null;
    } finally {
      setCreatingCustomer(false);
    }
  };

  const addProductToOrder = (product) => {
    const price = parsePrice(product.price);
    
    const existingItem = orderItems.find(item => item.product_id === product.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * price }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: price,
        total: price
      }]);
    }
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    const updated = [...orderItems];
    updated[index].quantity = quantity;
    updated[index].total = updated[index].quantity * updated[index].price;
    setOrderItems(updated);
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return total;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (customerType === 'existing' && !selectedCustomer) {
        setError('Please select a customer');
        return;
      }
      if (customerType === 'new') {
        if (!newCustomer.name || !newCustomer.email) {
          setError('Name and email are required for new customer');
          return;
        }
      }
      setError('');
      setStep(step + 1);
    } else {
      setError('');
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      setError('Please add at least one product');
      return;
    }

    setLoading(true);
    setError('');

    const total = calculateTotal();

    // بناء بيانات الطلب حسب نوع العميل
    let orderData;
    
    if (customerType === 'existing' && selectedCustomer) {
      orderData = {
        existing_customer_id: selectedCustomer.id,
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        total_amount: parseFloat(total.toFixed(2)),
        status: 'pending',
        payment_method: paymentMethod === 'credit_card' ? 'Credit Card' : 
                        paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer',
        shipping_address: selectedCustomer.address || 'No address provided',
        notes: notes || '',
        items: orderItems.map(item => ({
          product: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price.toFixed(2))
        }))
      };
    } else {
      orderData = {
        new_customer: {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone || '',
          address: newCustomer.address || '',
          city: newCustomer.city || '',
          country: newCustomer.country || ''
        },
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        total_amount: parseFloat(total.toFixed(2)),
        status: 'pending',
        payment_method: paymentMethod === 'credit_card' ? 'Credit Card' : 
                        paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer',
        shipping_address: newCustomer.address || 'No address provided',
        notes: notes || '',
        items: orderItems.map(item => ({
          product: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price.toFixed(2))
        }))
      };
    }

    try {
      const response = await orderService.create(orderData);
      
      if (response.status === 201) {
        window.dispatchEvent(new Event('inventory-updated'));
        window.dispatchEvent(new Event('notification-updated'));
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Error creating order:', err);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      if (err.response?.data) {
        const errorMsg = typeof err.response.data === 'object' 
          ? JSON.stringify(err.response.data) 
          : err.response.data;
        setError(`Server error: ${errorMsg}`);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  // ✅ ✅ ✅ عرض المنتجات مع التمرير اللانهائي
  const renderProductsList = () => {
    if (loadingProducts && productPage === 1) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <span className="ml-3 text-neutral-500">Loading products...</span>
        </div>
      );
    }

    if (displayedProducts.length === 0 && !loadingProducts) {
      return (
        <div className="text-center py-8 text-neutral-500">
          <Package size={48} className="mx-auto mb-2 opacity-30" />
          <p>No products found</p>
          {searchProduct && (
            <p className="text-sm mt-1">Try a different search term</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
        {displayedProducts.map((product, index) => {
          const isLastElement = index === displayedProducts.length - 1;
          const productPrice = parsePrice(product.price);
          
          return (
            <div
              key={product.id}
              ref={isLastElement ? lastProductRef : null}
              onClick={() => addProductToOrder(product)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] border ${
                darkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-sm font-semibold`} style={{ color: colors.primary }}>
                      ${productPrice.toLocaleString()}
                    </p>
                    <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Stock: {product.quantity || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addProductToOrder(product);
                  }}
                  className="p-1.5 rounded-lg transition-all hover:scale-110"
                  style={{ background: `${colors.primary}15`, color: colors.primary }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
        
        {/* ✅ ✅ ✅ مؤشر تحميل المزيد */}
        {loadingProducts && productPage > 1 && (
          <div className="flex justify-center items-center py-4">
            <Loader2 size={24} className="animate-spin text-primary-500" />
            <span className="ml-2 text-sm text-neutral-500">Loading more...</span>
          </div>
        )}
        
        {/* ✅ ✅ ✅ رسالة نهاية القائمة */}
        {!hasMoreProducts && displayedProducts.length > 0 && (
          <div className="text-center py-3 text-xs text-neutral-400">
            — All {totalProducts} products loaded —
          </div>
        )}
        
        {/* ✅ ✅ ✅ عدد المنتجات المعروضة */}
        {displayedProducts.length > 0 && (
          <div className="text-center py-2 text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700">
            Showing {displayedProducts.length} of {totalProducts} products
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col ${
          darkMode ? 'bg-neutral-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}>
              <Package size={22} style={{ color: colors.primary }} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Create New Order
              </h2>
              <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {step === 1 && 'Select or add a customer'}
                {step === 2 && 'Add products to order'}
                {step === 3 && 'Review and confirm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                step >= s ? 'bg-[#8B7ABA]' : darkMode ? 'bg-neutral-700' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Step 1: Select or Add Customer */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex gap-4 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <button
                  onClick={() => setCustomerType('existing')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                    customerType === 'existing'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm'
                      : 'text-neutral-500'
                  }`}
                >
                  <User size={18} />
                  Select Existing
                </button>
                <button
                  onClick={() => setCustomerType('new')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                    customerType === 'new'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm'
                      : 'text-neutral-500'
                  }`}
                >
                  <UserPlus size={18} />
                  Add New Customer
                </button>
              </div>

              {customerType === 'existing' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search customer by name or email..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                        darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredCustomers.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <User size={40} className="mx-auto mb-2 opacity-30" />
                        <p>No customers found</p>
                        <button
                          onClick={() => setCustomerType('new')}
                          className="mt-2 text-sm text-[#8B7ABA] hover:underline"
                        >
                          Add new customer instead
                        </button>
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                          }}
                          className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            selectedCustomer?.id === customer.id
                              ? 'border-[#8B7ABA] bg-[#8B7ABA]/5'
                              : darkMode ? 'border-neutral-700 hover:bg-neutral-800/50' : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                              <User size={18} className="text-neutral-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-neutral-500">{customer.email}</p>
                            </div>
                            {selectedCustomer?.id === customer.id && (
                              <CheckCircle size={20} className="text-[#34D19C]" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {customerType === 'new' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                          type="text"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                            darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                            darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                          }`}
                          placeholder="customer@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                          type="tel"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                            darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                          }`}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                          type="text"
                          value={newCustomer.address}
                          onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                            darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                          }`}
                          placeholder="123 Main St"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Add Products - مع التمرير اللانهائي */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                    darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                  }`}
                />
                {searchProduct && (
                  <button
                    onClick={() => setSearchProduct('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* ✅ ✅ ✅ قائمة المنتجات مع التمرير اللانهائي */}
              {renderProductsList()}

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <div className={`p-3 font-medium flex items-center justify-between ${darkMode ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                    <span>Order Items ({orderItems.length})</span>
                    <span className={`text-sm font-bold`} style={{ color: colors.primary }}>
                      Total: ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-48 overflow-y-auto custom-scrollbar">
                    {orderItems.map((item, index) => (
                      <div key={index} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product_name}</p>
                          <p className="text-xs text-neutral-500">${item.price.toLocaleString()} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 0)}
                            className={`w-16 px-2 py-1 rounded-lg text-center border ${
                              darkMode ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-neutral-200'
                            }`}
                            min="1"
                          />
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                <p className="text-sm text-neutral-500 mb-1">Customer</p>
                <p className="font-medium">{selectedCustomer?.name || newCustomer.name}</p>
                <p className="text-sm text-neutral-500">{selectedCustomer?.email || newCustomer.email}</p>
                {(selectedCustomer?.phone || newCustomer.phone) && (
                  <p className="text-sm text-neutral-500">{selectedCustomer?.phone || newCustomer.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
                    { value: 'paypal', label: 'PayPal', icon: CreditCard },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === method.value
                          ? 'border-[#8B7ABA] bg-[#8B7ABA]/5'
                          : darkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <method.icon size={20} className={`mx-auto mb-1 ${paymentMethod === method.value ? 'text-[#8B7ABA]' : 'text-neutral-400'}`} />
                      <span className="text-xs">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${
                    darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200'
                  }`}
                  placeholder="Add any notes about this order..."
                />
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}>
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="text-emerald-500">Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span style={{ color: colors.primary }}>${calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">Order created successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-between gap-3 p-6 border-t ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
              style={{ background: darkMode ? '#374151' : '#f3f4f6', color: darkMode ? '#fff' : '#374151' }}
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={customerType === 'new' && creatingCustomer}
              className="px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${colors.primary})` }}
            >
              {customerType === 'new' && creatingCustomer ? 'Creating Customer...' : 'Continue'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.success})` }}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;