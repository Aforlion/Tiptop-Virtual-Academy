'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X,
  FileText,
  Mail,
  Phone,
  Calendar,
  Globe,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
  BookOpen
} from 'lucide-react';
import { AdmissionApplication } from '@/types';

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/admissions');
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Failed to fetch admissions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update status handler
  const handleUpdateStatus = async (appId: string, newStatus: AdmissionApplication['status']) => {
    try {
      setStatusUpdating(true);
      const res = await fetch('/api/admin/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Save admin notes handler
  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      setSavingNotes(true);
      const res = await fetch('/api/admin/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedApp.id, admin_notes: editingNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === selectedApp.id ? { ...app, admin_notes: editingNotes } : app))
        );
        setSelectedApp((prev) => (prev ? { ...prev, admin_notes: editingNotes } : null));
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Open detail modal
  const handleOpenDetail = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setEditingNotes(app.admin_notes || '');
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const student = `${app.student_first_name} ${app.student_last_name}`.toLowerCase();
        const parent = (app.parent_name || '').toLowerCase();
        const email = (app.parent_email || '').toLowerCase();
        const ref = (app.paystack_reference || '').toLowerCase();
        if (!student.includes(q) && !parent.includes(q) && !email.includes(q) && !ref.includes(q)) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;

      // Payment
      if (paymentFilter !== 'all' && app.payment_status !== paymentFilter) return false;

      // Key stage
      if (stageFilter !== 'all' && app.key_stage_code !== stageFilter) return false;

      // Delivery
      if (deliveryFilter !== 'all' && app.delivery_format !== deliveryFilter) return false;

      return true;
    });
  }, [applications, searchQuery, statusFilter, paymentFilter, stageFilter, deliveryFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = applications.length;
    const depositsPaid = applications.filter((a) => a.payment_status === 'deposit_paid');
    const enrolled = applications.filter((a) => a.status === 'enrolled').length;
    const admitted = applications.filter((a) => a.status === 'admitted').length;
    const underReview = applications.filter((a) => a.status === 'under_review').length;
    const inquiries = applications.filter((a) => a.status === 'inquiry').length;

    let revenueNGN = 0;
    let revenueGBP = 0;
    depositsPaid.forEach((item) => {
      const amt = Number(item.deposit_amount) || 0;
      if (item.currency === 'GBP') revenueGBP += amt;
      else revenueNGN += amt;
    });

    return {
      total,
      depositsPaidCount: depositsPaid.length,
      revenueNGN,
      revenueGBP,
      enrolled,
      admitted,
      underReview,
      inquiries,
    };
  }, [applications]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Application ID',
      'Created At',
      'Student Name',
      'DOB',
      'Key Stage',
      'Delivery Format',
      'Parent Name',
      'Parent Email',
      'Parent Phone',
      'Country',
      'Deposit Amount',
      'Currency',
      'Paystack Reference',
      'Payment Status',
      'Admission Status',
      'Notes'
    ];

    const rows = filteredApplications.map((a) => [
      a.id,
      new Date(a.created_at).toLocaleDateString(),
      `"${a.student_first_name} ${a.student_last_name}"`,
      a.student_date_of_birth,
      a.key_stage_code,
      a.delivery_format,
      `"${a.parent_name}"`,
      a.parent_email,
      a.parent_phone || '',
      a.parent_country || 'Nigeria',
      a.deposit_amount,
      a.currency,
      a.paystack_reference || '',
      a.payment_status,
      a.status,
      `"${(a.admin_notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tiptop_admissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStageBadge = (code: string) => {
    switch (code) {
      case 'eyfs':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">EYFS (Ages 3–5)</span>;
      case 'primary':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Primary (Years 1–6)</span>;
      case 'lower-sec':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Lower Sec (KS3)</span>;
      case 'upper-sec':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Upper Sec (IGCSE)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{code}</span>;
    }
  };

  const getStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'enrolled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Enrolled</span>;
      case 'admitted':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30"><GraduationCap className="w-3 h-3" /> Admitted</span>;
      case 'under_review':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30"><Clock className="w-3 h-3" /> Under Review</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30"><X className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700"><Clock className="w-3 h-3" /> Inquiry</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase block">
            Academic Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admissions & Student Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time pipeline of student registrations, Paystack deposit verifications, and cohort placements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applicants */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.total}</span>
            <span className="text-[11px] font-bold text-emerald-400">All-time</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across EYFS, Primary & IGCSE</p>
        </div>

        {/* Verified Deposits */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Paystack Verified</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.depositsPaidCount}</span>
            <span className="text-xs text-slate-400">Deposits Paid</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            ₦{stats.revenueNGN.toLocaleString()} {stats.revenueGBP > 0 && `• £${stats.revenueGBP}`}
          </p>
        </div>

        {/* Admitted & Enrolled */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Enrolled & Cohorted</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.enrolled + stats.admitted}</span>
            <span className="text-[11px] font-semibold text-amber-400">
              ({stats.enrolled} Enrolled)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active class seats allocated</p>
        </div>

        {/* Action Queue */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Review Queue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.underReview + stats.inquiries}</span>
            <span className="text-[11px] font-semibold text-purple-400">Pending Actions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires interview or follow-up</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, parent email, phone, or Paystack ref..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Admission Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="admitted">Admitted</option>
              <option value="under_review">Under Review</option>
              <option value="inquiry">Inquiry</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Key Stage */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="all">All Key Stages</option>
              <option value="eyfs">EYFS (3–5)</option>
              <option value="primary">Primary (1–6)</option>
              <option value="lower-sec">Lower Sec (KS3)</option>
              <option value="upper-sec">Upper Sec (IGCSE)</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="all">All Payments</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="pending">Payment Pending</option>
            </select>

            {/* Delivery Filter */}
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="all">All Formats</option>
              <option value="live">Live Small Cohorts</option>
              <option value="on-demand">On-Demand Masterclass</option>
              <option value="bundle">Full Academic Bundle</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span>
            Showing <strong className="text-white">{filteredApplications.length}</strong> of{' '}
            <strong className="text-white">{applications.length}</strong> registrations
          </span>

          {(statusFilter !== 'all' || paymentFilter !== 'all' || stageFilter !== 'all' || deliveryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
                setStageFilter('all');
                setDeliveryFilter('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-400 mb-3" />
            <p className="text-sm font-semibold text-slate-300">Loading student registry records...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-bold text-white">No registrations found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No applications match your selected filters. Try resetting the search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#090D16] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Learner</th>
                  <th className="py-3.5 px-4 font-bold">Stage & Format</th>
                  <th className="py-3.5 px-4 font-bold">Parent Contact</th>
                  <th className="py-3.5 px-4 font-bold">Paystack Deposit</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => handleOpenDetail(app)}
                  >
                    {/* Student Column */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                        {app.student_first_name} {app.student_last_name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>DOB: {app.student_date_of_birth}</span>
                      </div>
                    </td>

                    {/* Stage & Format */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div>{getStageBadge(app.key_stage_code)}</div>
                        <span className="text-[10px] text-slate-400 block font-medium capitalize">
                          {app.delivery_format === 'live' ? '• Small Cohort (Live)' : '• On-Demand Video'}
                        </span>
                      </div>
                    </td>

                    {/* Parent Contact */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200">
                        {app.parent_name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[180px]">{app.parent_email}</span>
                      </div>
                      {app.parent_phone && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{app.parent_phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Paystack Deposit */}
                    <td className="py-4 px-4">
                      {app.payment_status === 'deposit_paid' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            {app.currency === 'GBP' ? '£' : '₦'}
                            {Number(app.deposit_amount).toLocaleString()}
                          </span>
                          {app.paystack_reference && (
                            <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[140px]">
                              {app.paystack_reference}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Admission Status */}
                    <td className="py-4 px-4">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(app);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Application Inspector Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#090D16] px-6 sm:px-8 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">
                  Application Dossier
                </span>
                <h3 className="text-xl font-black text-white">
                  {selectedApp.student_first_name} {selectedApp.student_last_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* Quick Status Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Current Status:</span>
                  {getStatusBadge(selectedApp.status)}
                </div>

                {/* Change Status Fast Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Change to:</span>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'under_review')}
                    disabled={statusUpdating || selectedApp.status === 'under_review'}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-40 transition-colors"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'admitted')}
                    disabled={statusUpdating || selectedApp.status === 'admitted'}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 transition-colors"
                  >
                    Admit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'enrolled')}
                    disabled={statusUpdating || selectedApp.status === 'enrolled'}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40 transition-colors"
                  >
                    Enroll
                  </button>
                </div>
              </div>

              {/* Two Column Learner & Parent Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Learner Info */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    Student Information
                  </h4>
                  <div className="text-xs space-y-1 pt-1">
                    <p><span className="text-slate-500">Full Name:</span> <strong className="text-white">{selectedApp.student_first_name} {selectedApp.student_last_name}</strong></p>
                    <p><span className="text-slate-500">Date of Birth:</span> <span className="text-slate-300">{selectedApp.student_date_of_birth}</span></p>
                    <p><span className="text-slate-500">Key Stage:</span> <span className="text-slate-300 font-semibold uppercase">{selectedApp.key_stage_code}</span></p>
                    <p><span className="text-slate-500">Delivery Model:</span> <span className="text-slate-300 capitalize">{selectedApp.delivery_format}</span></p>
                  </div>
                </div>

                {/* Parent Info */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Parent / Guardian Contact
                  </h4>
                  <div className="text-xs space-y-1 pt-1">
                    <p><span className="text-slate-500">Parent Name:</span> <strong className="text-white">{selectedApp.parent_name}</strong></p>
                    <p><span className="text-slate-500">Email:</span> <a href={`mailto:${selectedApp.parent_email}`} className="text-amber-400 hover:underline">{selectedApp.parent_email}</a></p>
                    <p><span className="text-slate-500">Phone:</span> <span className="text-slate-300">{selectedApp.parent_phone || 'None provided'}</span></p>
                    <p><span className="text-slate-500">Country:</span> <span className="text-slate-300">{selectedApp.parent_country || 'Nigeria'}</span></p>
                  </div>
                </div>
              </div>

              {/* Selected Curriculum Subjects */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Selected Curriculum Subjects
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedApp.selected_subjects && selectedApp.selected_subjects.length > 0 ? (
                    selectedApp.selected_subjects.map((subj, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          subj.startsWith('NIG')
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {subj} {subj.startsWith('NIG') && '🇳🇬'}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Full Standard British Curriculum Bundle</span>
                  )}
                </div>
              </div>

              {/* Paystack Financial Ledger */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  Commercial & Paystack Reconciliation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Deposit Required:</span>
                    <span className="font-extrabold text-white text-sm">
                      {selectedApp.currency === 'GBP' ? '£' : '₦'}
                      {Number(selectedApp.deposit_amount).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Payment Status:</span>
                    <span className={`font-bold capitalize ${selectedApp.payment_status === 'deposit_paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedApp.payment_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Paystack Transaction Ref:</span>
                    <span className="font-mono text-slate-300 text-[11px] block truncate">
                      {selectedApp.paystack_reference || 'Awaiting Payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Admin Registry Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Internal Registry Notes & Observations</span>
                  {selectedApp.admin_notes && <span className="text-[10px] text-emerald-400">Saved</span>}
                </label>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record interview observations, cohort allocation preferences, or verification details..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="bg-[#090D16] px-6 sm:px-8 py-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Application ID: <span className="font-mono">{selectedApp.id}</span>
              </span>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
