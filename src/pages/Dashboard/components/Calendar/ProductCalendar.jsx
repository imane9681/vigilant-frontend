// src/pages/Dashboard/components/Calendar/ProductCalendar.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Calendar, Eye, Download, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import IconWrapper from '../../../../components/ui/IconWrapper';

// استيراد المكونات الفرعية
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventList from './EventList';
import EventModal from './EventModal';
import AddEventModal from './AddEventModal';

// استيراد الـ helpers
import { 
  isSameDay, 
  isToday,
  formatDate,
  addMonths, 
  subMonths 
} from './utils/dateHelpers';
import { 
  getEventColor,
  getEventsForDate
} from './utils/eventHelpers';

// استيراد الخدمات
import { orderService, productService, customerService } from '../../../../services/api';

const ProductCalendar = ({ darkMode, products: initialProducts }) => {
  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [viewMode, setViewMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // بيانات حقيقية من API
  const [events, setEvents] = useState([]);
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'restock',
    quantity: '',
    priority: 'medium',
    date: new Date(),
    description: '',
    supplier: '',
    cost: ''
  });

  // جلب الأحداث من API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordersResponse = await orderService.getAll({ limit: 50 });
      const orders = ordersResponse.data.results || ordersResponse.data;
      
      const productsResponse = await productService.getAll({ limit: 50 });
      const products = productsResponse.data.results || productsResponse.data;
      
      const customersResponse = await customerService.getAll({ limit: 50 });
      const customers = customersResponse.data.results || customersResponse.data;
      
      // تحويل الطلبات إلى أحداث
      const orderEvents = orders.map(order => ({
        id: `order-${order.id}`,
        name: `Order #${order.order_number || order.id}`,
        date: new Date(order.created_at),
        type: 'order',
        priority: order.status === 'pending' ? 'high' : 'medium',
        quantity: order.items?.length || 0,
        description: `Order by ${order.customer_name || order.customer?.name || 'Unknown'}`,
        supplier: order.customer_name || order.customer?.name || 'Unknown',
        cost: parseFloat(order.total_amount) || 0,
        link: `/orders/${order.id}`,
        isRead: false
      }));
      
      // تحويل المنتجات إلى أحداث
      const productEvents = products.slice(0, 20).map(product => ({
        id: `product-${product.id}`,
        name: `New Product: ${product.name}`,
        date: new Date(product.created_at),
        type: 'restock',
        priority: product.quantity <= 10 ? 'high' : 'low',
        quantity: product.quantity || 0,
        description: `${product.name} added to inventory`,
        supplier: product.manufacturer || 'Unknown',
        cost: parseFloat(product.price) || 0,
        link: `/products/${product.id}`,
        isRead: false
      }));
      
      // تحويل العملاء إلى أحداث
      const customerEvents = customers.slice(0, 20).map(customer => ({
        id: `customer-${customer.id}`,
        name: `New Customer: ${customer.name}`,
        date: new Date(customer.created_at),
        type: 'customer',
        priority: 'medium',
        quantity: 0,
        description: `${customer.name} registered`,
        supplier: customer.name,
        cost: 0,
        link: `/customers/${customer.id}`,
        isRead: false
      }));
      
      // دمج جميع الأحداث
      const allEvents = [...orderEvents, ...productEvents, ...customerEvents];
      
      // ترتيب حسب التاريخ (الأحدث أولاً)
      allEvents.sort((a, b) => b.date - a.date);
      
      setEvents(allEvents);
      
    } catch (err) {
      console.error('❌ Error fetching calendar events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ✅ جميع أحداث اليوم
  const allDayEvents = useMemo(() => {
    return getEventsForDate(events, selectedDate, isSameDay);
  }, [events, selectedDate]);

  // ✅ عرض حدث واحد فقط
  const selectedDateEvents = useMemo(() => {
    return allDayEvents.slice(0, 1);
  }, [allDayEvents]);

  // ✅ عدد الأحداث المتبقية
  const remainingEventsCount = allDayEvents.length - 1;

  const selectedDateTitle = useMemo(() => {
    if (isToday(selectedDate)) {
      return "Today's Events";
    }
    return `${formatDate(selectedDate, 'MMM d')} Events`;
  }, [selectedDate]);

  const selectedDateEmptyMessage = useMemo(() => {
    if (isToday(selectedDate)) {
      return "No events scheduled for today";
    }
    return `No events scheduled for ${formatDate(selectedDate, 'MMMM d')}`;
  }, [selectedDate]);

  // Event handlers
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const handleDateClick = useCallback((date) => {
    if (!date) return;
    
    setSelectedDate(date);
    const dateEvents = getEventsForDate(events, date, isSameDay);
    
    if (dateEvents.length === 0) {
      return;
    } else if (dateEvents.length === 1) {
      setSelectedEvent(dateEvents[0]);
      setViewMode(null);
      setShowEventModal(true);
      setIsClosing(false);
    } else {
      setSelectedEvent(null);
      setViewMode('day');
      setShowEventModal(true);
      setIsClosing(false);
    }
  }, [events]);

  const handleCloseModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowEventModal(false);
      setShowAddModal(false);
      setSelectedEvent(null);
      setEditingEvent(null);
      setViewMode(null);
      setIsClosing(false);
    }, 200);
  }, []);

  const handleViewDayEvents = useCallback(() => {
    setSelectedEvent(null);
    setViewMode('day');
    setShowEventModal(true);
    setIsClosing(false);
  }, []);

  const handleViewAllEvents = useCallback(() => {
    setSelectedEvent(null);
    setViewMode('all');
    setShowEventModal(true);
    setIsClosing(false);
  }, []);

  const handleViewDetails = useCallback((event) => {
    setSelectedEvent(event);
    setViewMode(null);
    setShowEventModal(true);
    setIsClosing(false);
  }, []);

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event);
    setNewEvent({
      name: event.name,
      type: event.type,
      quantity: event.quantity || '',
      priority: event.priority,
      date: event.date,
      description: event.description || '',
      supplier: event.supplier || '',
      cost: event.cost || ''
    });
    setShowEventModal(false);
    setTimeout(() => setShowAddModal(true), 100);
  }, []);

  const handleDeleteEvent = useCallback((eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      if (selectedEvent?.id === eventId) {
        handleCloseModal();
      }
    }
  }, [selectedEvent, handleCloseModal]);

  const handleSaveEvent = useCallback(() => {
    if (!newEvent.name.trim()) {
      alert('Please enter event name');
      return;
    }

    const eventData = {
      ...newEvent,
      quantity: newEvent.quantity ? parseInt(newEvent.quantity) : 0,
      cost: newEvent.cost ? parseFloat(newEvent.cost) : 0,
      id: editingEvent ? editingEvent.id : Date.now()
    };

    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? eventData : event
      ));
    } else {
      setEvents(prev => [...prev, eventData]);
    }

    setNewEvent({
      name: '',
      type: 'restock',
      quantity: '',
      priority: 'medium',
      date: new Date(),
      description: '',
      supplier: '',
      cost: ''
    });
    setEditingEvent(null);
    handleCloseModal();
  }, [newEvent, editingEvent, handleCloseModal]);

  const handleNewEventChange = useCallback((updatedEvent) => {
    setNewEvent(updatedEvent);
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && (showEventModal || showAddModal)) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEventModal, showAddModal, handleCloseModal]);

  // Function to get events for a specific date
  const getEventsForDateCallback = useCallback((date) => 
    getEventsForDate(events, date, isSameDay), 
    [events]
  );

  // حالة التحميل
  if (loading) {
    return (
      <div className={`rounded-2xl p-6 transition-all duration-200 min-h-[400px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-card-dark border border-neutral-800' 
          : 'bg-gradient-card border border-neutral-200 shadow-lg'
      }`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className={`rounded-2xl p-6 transition-all duration-200 min-h-[400px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-card-dark border border-neutral-800' 
          : 'bg-gradient-card border border-neutral-200 shadow-lg'
      }`}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {error}
          </p>
          <button
            onClick={fetchEvents}
            className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Calendar Container */}
      <div className={`rounded-2xl py-5 px-8 transition-all duration-200 shadow-soft ${
        darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}>
        
        {/* Header */}
        <CalendarHeader
          darkMode={darkMode}
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          darkMode={darkMode}
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={events}
          onDateClick={handleDateClick}
          getEventsForDate={getEventsForDateCallback}
          isSameDay={isSameDay}
        />

        {/* Add Event Button */}
        <div className="pt-5 border-t border-dashed border-neutral-700/30 dark:border-neutral-300/30">
          <button 
            onClick={() => {
              setNewEvent({
                name: '',
                type: 'restock',
                quantity: '',
                priority: 'medium',
                date: selectedDate,
                description: '',
                supplier: '',
                cost: ''
              });
              setEditingEvent(null);
              setShowAddModal(true);
            }}
            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
              animate-pop-in
              ${darkMode 
                ? 'bg-gradient-primary text-white border border-primary-700 hover:bg-gradient-to-r hover:from-primary-800 hover:to-primary-900 hover:shadow-glow-sm hover:scale-[1.02]' 
                : 'bg-primary-800/80 text-white border border-primary-800/40 hover:bg-primary-800/70 hover:shadow-glow-sm hover:scale-[1.02]'}`}
          >
            <Plus size={16} />
            Add New Event
          </button>
        </div>
      </div>

      {/* Selected Date Events Card */}
      <div className={`px-5 pt-5 pb-2.5 rounded-2xl overflow-hidden transition-all duration-300 shadow-elevation ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-700/50' 
          : 'bg-gradient-to-br from-white via-white to-neutral-50/90 border border-neutral-200/80'
      }`}>
        
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconWrapper darkMode={darkMode} variant="primary" size={20}>
                <Calendar />
              </IconWrapper>
              
              <div>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                  {isToday(selectedDate) ? (
                    <span>Today's Events</span>
                  ) : (
                    formatDate(selectedDate, 'MMMM d, yyyy')
                  )}
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {allDayEvents.length} {allDayEvents.length === 1 ? 'event' : 'events'} scheduled
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const eventsText = allDayEvents
                  .map(e => `${e.name} - ${e.type}`)
                  .join('\n');
                
                navigator.clipboard.writeText(eventsText);
                
                const blob = new Blob([eventsText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `events-${formatDate(selectedDate, 'yyyy-MM-dd')}.txt`;
                a.click();
              }}
              className={`group relative py-2 px-2.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
                darkMode 
                  ? 'bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700' 
                  : 'bg-white hover:bg-neutral-50 border border-neutral-300 shadow-sm'
              }`}
            >
              <Download size={16} className={darkMode ? 'text-neutral-400 hover:text-primary-400' : 'text-neutral-600 hover:text-primary-600'} />
              <span className="absolute top-8 -left-1 transform -translate-x-1/2 px-2 py-1 text-xs rounded bg-primary-800/80 text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Export events
              </span>
            </button>
          </div>
        </div>

        {/* عرض حدث واحد فقط */}
        <div className="pt-4 pl-1.5 animate-fade-in">
          <EventList
            darkMode={darkMode}
            title=""
            events={selectedDateEvents}
            onViewAll={handleViewDayEvents}
            onEventClick={handleViewDetails}
            maxItems={1}
            showViewAllButton={false}
            emptyMessage={selectedDateEmptyMessage}
          />
        </div>

        {/* ✅ زر دائم يعرض جميع الأحداث */}
        <div className={`mt-4 pt-2 text-center border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/80'}`}>
          <button
            onClick={handleViewDayEvents}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
        ${darkMode 
          ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20' 
          : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
        }`}
    >
            <Eye size={16} />
            View All Events ({allDayEvents.length})
          </button>
        </div>

        
      </div>

      {/* Event Details Modal */}
      {showEventModal && (
        <EventModal
          darkMode={darkMode}
          selectedEvent={selectedEvent}
          allEvents={events}
          selectedDateEvents={allDayEvents}
          selectedDate={selectedDate}
          viewMode={viewMode}
          isClosing={isClosing}
          onClose={handleCloseModal}
          onViewAllEvents={handleViewAllEvents}
          onViewDetails={handleViewDetails}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          getEventColor={getEventColor}
        />
      )}

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <AddEventModal
          darkMode={darkMode}
          newEvent={newEvent}
          editingEvent={editingEvent}
          isClosing={isClosing}
          onClose={handleCloseModal}
          onSaveEvent={handleSaveEvent}
          onNewEventChange={handleNewEventChange}
        />
      )}
    </>
  );
};

export default ProductCalendar;