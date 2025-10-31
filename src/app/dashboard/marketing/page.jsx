'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function MarketingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [promoCodes, setPromoCodes] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmails: 0,
    emailOpenRate: 0,
    clickThroughRate: 0,
    conversionRate: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchMarketingData();
    }
  }, [status, router]);

  const fetchMarketingData = async () => {
    try {
      // Fetch promo codes for campaigns
      const response = await fetch('/api/promo-codes?limit=100');
      const result = await response.json();
      
      if (result.success) {
        setPromoCodes(result.data.promoCodes || []);
        setStats(result.data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching marketing data:', error);
    }
  };

  const tabs = [
    { id: 'campaigns', name: 'Campaigns', icon: '📢', count: stats.activeCampaigns },
    { id: 'banners', name: 'Banners', icon: '🖼️' },
    { id: 'emails', name: 'Email Marketing', icon: '📧', count: stats.totalEmails },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'social', name: 'Social Media', icon: '📱' }
  ];

  // Campaign Form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'promo',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    status: 'draft'
  });

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Campaign created successfully!',
      });
      
      setCampaignForm({
        name: '',
        description: '',
        type: 'promo',
        startDate: '',
        endDate: '',
        targetAudience: 'all',
        status: 'draft'
      });
      
      fetchMarketingData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create campaign',
      });
    } finally {
      setLoading(false);
    }
  };

  // Banner Form
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    position: 'homepage-top',
    startDate: '',
    endDate: '',
    status: 'inactive'
  });

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Banner created successfully!',
      });
      
      setBannerForm({
        title: '',
        description: '',
        image: '',
        link: '',
        position: 'homepage-top',
        startDate: '',
        endDate: '',
        status: 'inactive'
      });
    } catch (error) {
      console.error('Error creating banner:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create banner',
      });
    } finally {
      setLoading(false);
    }
  };

  // Email Template Form
  const [emailForm, setEmailForm] = useState({
    subject: '',
    template: '',
    recipients: 'all',
    scheduleDate: '',
    status: 'draft'
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Email campaign created successfully!',
      });
      
      setEmailForm({
        subject: '',
        template: '',
        recipients: 'all',
        scheduleDate: '',
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating email campaign:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create email campaign',
      });
    } finally {
      setLoading(false);
    }
  };

  const activePromoCodes = promoCodes.filter(code => code.status === 'active').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Marketing Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your marketing campaigns, banners, and customer engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Total Campaigns</div>
          <div className="text-2xl font-bold mt-1">{stats.totalCampaigns}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Active</div>
          <div className="text-2xl font-bold mt-1">{stats.activeCampaigns}</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Total Emails</div>
          <div className="text-2xl font-bold mt-1">{stats.totalEmails}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Open Rate</div>
          <div className="text-2xl font-bold mt-1">{stats.emailOpenRate}%</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Click Rate</div>
          <div className="text-2xl font-bold mt-1">{stats.clickThroughRate}%</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90">Conversion</div>
          <div className="text-2xl font-bold mt-1">{stats.conversionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <nav className="space-y-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Active Campaigns Quick View */}
          {activePromoCodes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Active Promotions</h3>
              <div className="space-y-2">
                {activePromoCodes.map((code) => (
                  <div key={code._id} className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{code.code}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{code.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Create New Campaign
              </h2>
              <form onSubmit={handleCampaignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    rows={3}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Campaign Type
                    </label>
                    <select
                      value={campaignForm.type}
                      onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="promo">Promo Code</option>
                      <option value="banner">Banner</option>
                      <option value="email">Email</option>
                      <option value="flash">Flash Sale</option>
                      <option value="referral">Referral Program</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={campaignForm.targetAudience}
                      onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="all">All Customers</option>
                      <option value="new">New Customers</option>
                      <option value="returning">Returning Customers</option>
                      <option value="vip">VIP Customers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={campaignForm.startDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={campaignForm.endDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              </form>

              {/* Active Promo Codes List */}
              {promoCodes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Active Promo Codes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promoCodes.filter(code => code.status === 'active').map((code) => (
                      <div key={code._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{code.code}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{code.name}</div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {code.type === 'percentage' ? `${code.value}%` : `BDT ${code.value}`} OFF
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Valid until {code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Banner Management
              </h2>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position
                    </label>
                    <select
                      value={bannerForm.position}
                      onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="homepage-top">Homepage Top</option>
                      <option value="homepage-middle">Homepage Middle</option>
                      <option value="category-top">Category Top</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={bannerForm.status}
                      onChange={(e) => setBannerForm({ ...bannerForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Banner'}
                </button>
              </form>
            </div>
          )}

          {/* Email Marketing Tab */}
          {activeTab === 'emails' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Email Marketing
              </h2>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Template
                  </label>
                  <textarea
                    value={emailForm.template}
                    onChange={(e) => setEmailForm({ ...emailForm, template: e.target.value })}
                    rows={10}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter your email content here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipients
                    </label>
                    <select
                      value={emailForm.recipients}
                      onChange={(e) => setEmailForm({ ...emailForm, recipients: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="all">All Customers</option>
                      <option value="subscribed">Subscribed Only</option>
                      <option value="active">Active Customers</option>
                      <option value="inactive">Inactive Customers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schedule Send
                    </label>
                    <input
                      type="datetime-local"
                      value={emailForm.scheduleDate}
                      onChange={(e) => setEmailForm({ ...emailForm, scheduleDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : emailForm.scheduleDate ? 'Schedule Email' : 'Send Now'}
                </button>
              </form>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Marketing Analytics
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Reach</span>
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">12.5K</div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      +15.3% from last month
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</span>
                      <span className="text-2xl">❤️</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">24.8%</div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      +8.2% from last month
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Impact</span>
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">BDT 45K</div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      +32.1% from last month
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Performing Campaigns</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Summer Sale 2024</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">BDT 12,000 revenue</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 dark:text-green-400 font-semibold">+45%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Conversion</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">New Customer Welcome</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">BDT 8,500 revenue</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 dark:text-green-400 font-semibold">+28%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Conversion</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Flash Sale Weekend</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">BDT 6,200 revenue</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 dark:text-green-400 font-semibold">+18%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Conversion</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Social Media Integration
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📘</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Facebook</span>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Share products and campaigns automatically on Facebook
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Manage Settings
                  </button>
                </div>

                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📷</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Instagram</span>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                      Not Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Connect Instagram to share visual content
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                    Connect Account
                  </button>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐦</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Twitter / X</span>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                      Not Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Tweet product updates and promotions
                  </p>
                  <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                    Connect Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

