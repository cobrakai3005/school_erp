import { useState, useEffect } from 'react';
import { superAdminApi } from '../../api/superAdmin';
import {
  Card,
  CardHeader,
  CardContent,
  Input,
  Select,
  Table,
  Th,
  Td,
  Badge,
  Pagination,
  Spinner,
  EmptyState,
} from '../../components/ui';
import { Search, Shield, Building2 } from 'lucide-react';

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [page, schoolFilter, statusFilter]);

  const fetchSchools = async () => {
    try {
      const response = await superAdminApi.getSchools({ limit: 100 });
      if (response.success) {
        setSchools(response.data.schools || []);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(schoolFilter && { school_id: schoolFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      };
      const response = await superAdminApi.getAllAdmins(params);
      if (response.success) {
        setAdmins(response.data.admins || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAdmins();
  };

  const schoolOptions = [
    { value: '', label: 'All Schools' },
    ...schools.map((s) => ({ value: s.id, label: s.school_name })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Admins</h1>
          <p className="text-slate-600">View school administrators across all schools</p>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Building2 className="w-5 h-5" />
          <span>{schools.length} Schools</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, school..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={schoolFilter}
              onChange={(e) => {
                setSchoolFilter(e.target.value);
                setPage(1);
              }}
              options={schoolOptions}
              className="w-full md:w-48"
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={statusOptions}
              className="w-full md:w-36"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : admins.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Shield}
              title="No admins found"
              description="Try adjusting your search or filter criteria"
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Name</Th>
                  <Th>School</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Last Login</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50">
                    <Td>
                      <div>
                        <p className="font-medium">{admin.full_name}</p>
                        {admin.designation && (
                          <p className="text-xs text-slate-500">{admin.designation}</p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm">{admin.school_name || '-'}</span>
                    </Td>
                    <Td className="text-sm">{admin.email}</Td>
                    <Td>{admin.phone || '-'}</Td>
                    <Td className="text-sm text-slate-500">
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleDateString()
                        : 'Never'}
                    </Td>
                    <Td>
                      <Badge variant={admin.status === 'active' ? 'success' : 'default'}>
                        {admin.status}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
