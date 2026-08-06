import React, { useState } from 'react';
import { ClipboardList, RefreshCw, Send, Trash2, Star } from 'lucide-react';

export default function ServicesManager({
  API_BASE_URL = 'http://localhost:8000',
  triggerToast = () => {},
  services = [],
  loadingServices = false,
  onRefreshServices = () => {},
  onDeleteService = () => {},
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('In-Suite Dining & Bar');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [isQuickService, setIsQuickService] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast('Service Name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        category: category,
        tag: tag.trim(),
        description: description.trim(),
        is_quick_service: isQuickService,
      };

      const res = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerToast('✨ New service added successfully!', 'success');
        // Reset form fields on successful addition
        setName('');
        setTag('');
        setDescription('');
        setIsQuickService(false);
        // Re-fetch the services list
        if (onRefreshServices) {
          await onRefreshServices();
        }
      } else {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        console.error('Server error message adding service:', errorData);
        const errorMessage = errorData?.detail || errorData?.message || errorData?.error || 'Failed to add service';
        triggerToast(`Failed to add service: ${errorMessage}`, 'error');
      }
    } catch (err) {
      console.error('Error adding service:', err);
      triggerToast('An error occurred while adding service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleQuickService = async (service) => {
    try {
      const newStatus = !service.is_quick_service;
      const res = await fetch(`${API_BASE_URL}/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_quick_service: newStatus }),
      });
      if (res.ok) {
        triggerToast(
          newStatus
            ? `⭐ "${service.name || service.title}" featured on Home Tab!`
            : `Unpinned "${service.name || service.title}" from Home Tab`,
          'success'
        );
        if (onRefreshServices) await onRefreshServices();
      } else {
        triggerToast('Failed to update quick service status', 'error');
      }
    } catch (err) {
      console.error('Error updating quick service status:', err);
      triggerToast('Error updating service status', 'error');
    }
  };

  const categories = [
    'In-Suite Dining & Bar',
    'Housekeeping & Comfort',
    'Concierge & Guest Experience',
  ];

  return (
    <div className="scroll-mt-24 bg-brand-card p-8 sm:p-10 rounded-2xl border border-brand-border space-y-8 shadow-stripe">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-brand-surface border border-brand-border text-brand-primary rounded-xl">
            <ClipboardList className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl text-brand-heading font-semibold tracking-tight">Services Manager</h2>
            <p className="text-xs text-brand-body mt-0.5">Manage and update active resort services offered on the Guest Portal</p>
          </div>
        </div>
      </div>

      {/* Form to Add New Service */}
      <form onSubmit={handleAddService} className="bg-brand-surface p-6 sm:p-8 rounded-xl border border-brand-border space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-heading border-b border-brand-border pb-3">
          Add New Resort Service
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="service-name-input" className="block text-xs font-bold uppercase tracking-wider text-brand-heading">
              Service Name *
            </label>
            <input
              id="service-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iced Cappuccino"
              className="w-full bg-white border border-brand-border text-brand-heading placeholder-slate-400 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary font-semibold transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-category-select" className="block text-xs font-bold uppercase tracking-wider text-brand-heading">
              Category *
            </label>
            <select
              id="service-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-brand-border text-brand-heading text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary font-semibold transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="service-tag-input" className="block text-xs font-bold uppercase tracking-wider text-brand-heading">
              Tag / Subtitle
            </label>
            <input
              id="service-tag-input"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. BEVERAGE, HYDRATION, LUXURY"
              className="w-full bg-white border border-brand-border text-brand-heading placeholder-slate-400 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary font-semibold transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="service-desc-input" className="block text-xs font-bold uppercase tracking-wider text-brand-heading">
            Description
          </label>
          <input
            id="service-desc-input"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Freshly brewed iced espresso with chilled oat milk"
            className="w-full bg-white border border-brand-border text-brand-heading placeholder-slate-400 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary font-semibold transition-all"
          />
        </div>

        {/* Quick Service Toggle Checkbox */}
        <div className="flex items-center space-x-3 pt-1">
          <input
            id="service-quick-toggle"
            type="checkbox"
            checked={isQuickService}
            onChange={(e) => setIsQuickService(e.target.checked)}
            className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary cursor-pointer"
          />
          <label htmlFor="service-quick-toggle" className="text-xs font-bold text-slate-800 cursor-pointer select-none flex items-center space-x-1.5">
            <span>⭐ Feature on Home Tab (Quick Service)</span>
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="add-service-submit-btn"
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-stripe hover:shadow-stripe-hover flex items-center space-x-2 border border-brand-border cursor-pointer active:scale-[0.98]"
          >
            <Send className="w-4 h-4 text-white" />
            <span>{submitting ? 'Adding Service...' : 'Add Service'}</span>
          </button>
        </div>
      </form>

      {/* Visual Grid of Currently Active Services Grouped by Category */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h3 className="text-lg text-brand-heading font-semibold tracking-tight">Active Resort Services Grid</h3>
          <span className="text-xs text-brand-body font-mono">Total Services: {(services || []).length}</span>
        </div>

        {loadingServices ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-primary mx-auto" />
            <p className="text-xs text-brand-body mt-2">Loading dynamic services...</p>
          </div>
        ) : (
          categories.map((categoryName) => {
            const categoryItems = (services || []).filter(
              (s) => s.category === categoryName || (s.category || '').toLowerCase().includes(categoryName.split(' ')[0].toLowerCase())
            );

            return (
              <div key={categoryName} className="space-y-4">
                <div className="flex items-center space-x-3 border-l-4 border-slate-800 pl-3">
                  <h4 className="font-bold text-slate-800 text-sm">{categoryName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-surface text-brand-body border border-brand-border">
                    {categoryItems.length} items
                  </span>
                </div>

                {categoryItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic pl-4">No active services in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryItems.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all relative group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase block">
                                {service.tag || service.badge || 'SERVICE'}
                              </span>
                              {service.is_quick_service && (
                                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span>Quick Service</span>
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-sm text-slate-800">{service.name || service.title}</h5>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                          {service.description || service.desc || 'No description provided.'}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            id={`toggle-quick-btn-${String(service.id)}`}
                            onClick={() => handleToggleQuickService(service)}
                            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer border ${
                              service.is_quick_service
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={service.is_quick_service ? 'Unpin from Home Tab' : 'Pin to Home Tab as Quick Service'}
                          >
                            <Star className={`w-3 h-3 ${service.is_quick_service ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                            <span>{service.is_quick_service ? 'Unpin' : 'Pin Home'}</span>
                          </button>

                          <button
                            id={`delete-service-btn-${String(service.id)}`}
                            onClick={() => onDeleteService(service.id, service.name || service.title)}
                            className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
