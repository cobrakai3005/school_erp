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
import { Search, Users, Eye, Building2 } from 'lucide-react';

export default function SuperAdminStudents() {
  const [students, setStudents] = useState([]);
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
    fetchStudents();
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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(schoolFilter && { school_id: schoolFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      };
      const response = await superAdminApi.getAllStudents(params);
      if (response.success) {
        setStudents(response.data.students || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
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
          <h1 className="text-2xl font-semibold text-slate-900">All Students</h1>
          <p className="text-slate-600">View students across all schools</p>
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
                placeholder="Search by name, admission no, email..."
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
        ) : students.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Users}
              title="No students found"
              description="Try adjusting your search or filter criteria"
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Admission No</Th>
                  <Th>Name</Th>
                  <Th>School</Th>
                  <Th>Class</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{student.admission_no}</Td>
                    <Td>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm">{student.school_name || '-'}</span>
                    </Td>
                    <Td>
                      {student.class_name ? (
                        <span>
                          {student.class_name} {student.section}
                        </span>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>{student.phone || student.parent_phone || '-'}</Td>
                    <Td>
                      <Badge variant={student.status === 'active' ? 'success' : 'default'}>
                        {student.status}
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
