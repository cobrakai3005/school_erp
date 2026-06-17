import { useState, useEffect } from 'react';
import { useAuth } from '../context';
import { dashboardApi } from '../api/dashboard';
import { Card, CardContent } from '../components/ui';
import { Users, GraduationCap, BookOpen, DollarSign, Calendar, Building2, Clock, AlertCircle, CheckCircle, TrendingUp, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user, school, isSuperAdmin, userType } = useAuth();

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Welcome back, {user?.full_name || user?.username}</p>
      </div>

      {userType === 'admin' && <AdminDashboard />}
      {userType === 'teacher' && <TeacherDashboard />}
      {userType === 'student' && <StudentDashboard />}
      {(userType === 'accountant_fee' || userType === 'accountant_salary') && <AccountantDashboard />}
      {userType === 'librarian' && <LibrarianDashboard />}
    </div>
  );
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getSuperAdminStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Schools', value: stats?.schools?.total || 0, subtext: `${stats?.schools?.active || 0} active`, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Users', value: stats?.users?.active || 0, subtext: `${stats?.users?.total || 0} total`, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Subscriptions', value: stats?.subscriptions?.length || 0, subtext: 'Active plans', icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Super Admin Dashboard</h1>
        <p className="text-slate-600">Manage all schools and system settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Distribution */}
      {stats?.userDistribution && stats.userDistribution.length > 0 && (
        <Card className="mb-6">
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">User Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.userDistribution.map((item) => (
                <div key={item.user_type} className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-semibold text-slate-900">{item.count}</p>
                  <p className="text-sm text-slate-500 capitalize">{item.user_type.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Schools */}
      {stats?.recentSchools && stats.recentSchools.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Recent Schools</h3>
            <div className="space-y-3">
              {stats.recentSchools.map((school) => (
                <div key={school.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{school.school_name}</p>
                    <p className="text-sm text-slate-500">Code: {school.school_code}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {school.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{school.subscription_plan}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getAdminStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.students || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Teachers', value: stats?.teachers || 0, icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Classes', value: stats?.classes || 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Fee Collection', value: `₹${(stats?.feeCollection || 0).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Overview */}
      {stats?.attendance && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Today&apos;s Attendance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-slate-900">{stats.attendance.percentage}%</p>
                <p className="text-sm text-slate-500">Attendance Rate</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.attendance.present}</p>
                <p className="text-sm text-slate-500">Present</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{stats.attendance.absent}</p>
                <p className="text-sm text-slate-500">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Fee Payments */}
      {stats?.recentFees && stats.recentFees.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Recent Fee Payments</h3>
            <div className="space-y-3">
              {stats.recentFees.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{payment.student_name}</p>
                    <p className="text-sm text-slate-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-green-600">₹{payment.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getTeacherStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'My Classes', value: stats?.myClasses || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Homework', value: stats?.pendingHomework || 0, icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Ungraded Work', value: stats?.ungradedSubmissions || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Classes */}
      {stats?.todayClasses && stats.todayClasses.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Today&apos;s Schedule</h3>
            <div className="space-y-3">
              {stats.todayClasses.map((classItem, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{classItem.period_number}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{classItem.subject}</p>
                      <p className="text-sm text-slate-500">
                        {classItem.class_name} {classItem.section && `- ${classItem.section}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{classItem.start_time} - {classItem.end_time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!stats?.todayClasses || stats.todayClasses.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No classes scheduled for today</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStudentStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h3 className="font-medium text-slate-900 mb-2">Your Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Name:</span>
              <span className="ml-2 text-slate-900">{user?.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500">Email:</span>
              <span className="ml-2 text-slate-900">{user?.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-slate-500">Attendance</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.attendance?.percentage || 0}%</p>
            <p className="text-xs text-slate-400">{stats?.attendance?.present || 0} of {stats?.attendance?.total || 0} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-slate-500">Pending Homework</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.pendingHomework || 0}</p>
            <p className="text-xs text-slate-400">Assignments to submit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-slate-500">Fee Due</p>
            <p className="text-3xl font-bold text-slate-900">₹{(stats?.feeDue || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-400">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Homework */}
      {stats?.upcomingHomework && stats.upcomingHomework.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Upcoming Homework</h3>
            <div className="space-y-3">
              {stats.upcomingHomework.map((hw) => (
                <div key={hw.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{hw.title}</p>
                    <p className="text-sm text-slate-500">{hw.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Due: {new Date(hw.submission_date).toLocaleDateString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${hw.submission_status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {hw.submission_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountantDashboard() {
  const { userType } = useAuth();
  const isFeeAccountant = userType === 'accountant_fee';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = isFeeAccountant 
          ? await dashboardApi.getAccountantFeeStats()
          : await dashboardApi.getAccountantSalaryStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isFeeAccountant]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (isFeeAccountant) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">This Month</p>
                <p className="text-2xl font-semibold text-slate-900">₹{(stats?.collection?.thisMonth || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">This Year</p>
                <p className="text-2xl font-semibold text-slate-900">₹{(stats?.collection?.thisYear || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Students</p>
                <p className="text-2xl font-semibold text-slate-900">{stats?.studentCount || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        {stats?.recentPayments && stats.recentPayments.length > 0 && (
          <Card>
            <CardContent>
              <h3 className="font-medium text-slate-900 mb-4">Recent Payments</h3>
              <div className="space-y-3">
                {stats.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{payment.student_name}</p>
                      <p className="text-sm text-slate-500">Receipt: {payment.receipt_no} | {payment.payment_mode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Salary Accountant
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Salaries Paid</p>
              <p className="text-2xl font-semibold text-slate-900">₹{(stats?.salaries?.paid || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Salaries</p>
              <p className="text-2xl font-semibold text-slate-900">₹{(stats?.salaries?.pending || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Staff Count</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.staffCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Salaries */}
      {stats?.pendingSalaries && stats.pendingSalaries.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Pending Salaries</h3>
            <div className="space-y-3">
              {stats.pendingSalaries.map((salary) => (
                <div key={salary.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{salary.full_name}</p>
                    <p className="text-sm text-slate-500 capitalize">{salary.staff_type?.replace('_', ' ')}</p>
                  </div>
                  <p className="font-semibold text-yellow-600">₹{salary.net_salary.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LibrarianDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getLibrarianStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'Total Books', value: stats?.books?.total || 0, subtext: `${stats?.books?.totalCopies || 0} copies`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Books Issued', value: stats?.issues?.issued || 0, subtext: 'Currently issued', icon: BookOpen, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Overdue Books', value: stats?.issues?.overdue || 0, subtext: 'Need attention', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Issues */}
      {stats?.recentIssues && stats.recentIssues.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="font-medium text-slate-900 mb-4">Recent Book Issues</h3>
            <div className="space-y-3">
              {stats.recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{issue.book_title}</p>
                    <p className="text-sm text-slate-500">{issue.student_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.status === 'overdue' ? 'bg-red-100 text-red-700' : 
                      issue.status === 'returned' ? 'bg-green-100 text-green-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {issue.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Due: {new Date(issue.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
