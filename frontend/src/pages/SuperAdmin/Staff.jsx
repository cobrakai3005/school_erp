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
import { Search, Users, Building2 } from 'lucide-react';

export default function SuperAdminStaff() {
  const [staff, setStaff] = useState([]);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [page, schoolFilter, typeFilter, statusFilter]);

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

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(schoolFilter && { school_id: schoolFilter }),
        ...(typeFilter && { user_type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      };
      const response = await superAdminApi.getAllStaff(params);
      if (response.success) {
        setStaff(response.data.staff || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const schoolOptions = [
    { value: '', label: 'All Schools' },
    ...schools.map((s) => ({ value: s.id, label: s.school_name })),
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'accountant_fee', label: 'Fee Accountant' },
    { value: 'accountant_salary', label: 'Salary Accountant' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'transport_manager', label: 'Transport Manager' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const getUserTypeLabel = (type) => {
    const labels = {
      accountant_fee: 'Fee Accountant',
      accountant_salary: 'Salary Accountant',
      librarian: 'Librarian',
      transport_manager: 'Transport Manager',
    };
    return labels[type] || type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Staff</h1>
          <p className="text-slate-600">View staff members across all schools</p>
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
                placeholder="Search by name, email..."
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
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={typeOptions}
              className="w-full md:w-44"
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
        ) : staff.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Users}
              title="No staff found"
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
                  <Th>Type</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <Td>
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        {member.employee_id && (
                          <p className="text-xs text-slate-500">ID: {member.employee_id}</p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm">{member.school_name || '-'}</span>
                    </Td>
                    <Td>
                      <Badge variant="default">{getUserTypeLabel(member.user_type)}</Badge>
                    </Td>
                    <Td className="text-sm">{member.email}</Td>
                    <Td>{member.phone || '-'}</Td>
                    <Td>
                      <Badge variant={member.status === 'active' ? 'success' : 'default'}>
                        {member.status}
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
