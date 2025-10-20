'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Event, Report, AuditLog } from '@/types/common'
import { Calendar, Users, AlertTriangle, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react'

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [pendingEvents, setPendingEvents] = useState<Event[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingEvents: 0,
    totalUsers: 0,
    totalClubs: 0,
    pendingReports: 0
  })

  useEffect(() => {
    if (profile?.role === 'campus_admin' || profile?.role === 'super_admin') {
      fetchDashboardData()
    }
  }, [profile])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch pending events
      const { data: events } = await supabase
        .from('events')
        .select(`
          *,
          club:clubs(*),
          creator:profiles(*)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      setPendingEvents(events || [])

      // Fetch pending reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setReports(reportsData || [])

      // Fetch recent audit logs
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select(`
          *,
          actor:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      setAuditLogs(auditData || [])

      // Fetch stats
      const [
        { count: totalEvents },
        { count: pendingEventsCount },
        { count: totalUsers },
        { count: totalClubs },
        { count: pendingReportsCount }
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('clubs').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        totalEvents: totalEvents || 0,
        pendingEvents: pendingEventsCount || 0,
        totalUsers: totalUsers || 0,
        totalClubs: totalClubs || 0,
        pendingReports: pendingReportsCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventApproval = async (eventId: string, approved: boolean) => {
    try {
  const { error } = await (supabase as any)
        .from('events')
        .update({
          status: approved ? 'approved' : 'cancelled',
          approved_at: approved ? new Date().toISOString() : null,
          approved_by: user?.id
        } as any)
        .eq('id', eventId)

      if (error) throw error

      // Log the action
      await (supabase as any)
        .from('audit_logs')
        .insert([{
          actor_id: user?.id,
          action: approved ? 'event_approved' : 'event_rejected',
          entity_type: 'events',
          entity_id: eventId,
          details: { approved },
          ip_address: '127.0.0.1' // placeholder: replace with real client IP on server-side retrieval (e.g., via headers)
        }] as any)

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const handleReportAction = async (reportId: string, action: string) => {
    try {
  const { error } = await (supabase as any)
        .from('reports')
        .update({
          status: action,
          moderator_id: user?.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', reportId)

      if (error) throw error

      // Log the action
      await (supabase as any)
        .from('audit_logs')
        .insert([{
          actor_id: user?.id,
          action: `report_${action}`,
          entity_type: 'reports',
          entity_id: reportId,
          details: { action },
          ip_address: '127.0.0.1'
        }] as any)

      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating report:', error)
    }
  }

  if (!profile || (profile.role !== 'campus_admin' && profile.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don&#39;t have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-husky-purple mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage events, users, and platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-husky-purple" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-husky-gold" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-husky-lavender" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Pending Events ({pendingEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending events</p>
                ) : (
                  pendingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            by {event.creator?.display_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(event.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEventApproval(event.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleEventApproval(event.id, false)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Pending Reports ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending reports</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {report.entity_type} Report
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            by {report.reporter?.display_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {report.reason}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleReportAction(report.id, 'action_taken')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Action
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'dismissed')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center space-x-4 py-2 border-b last:border-b-0">
                    <div className="w-2 h-2 bg-husky-purple rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {log.actor?.display_name || 'System'}
                        </span>{' '}
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
