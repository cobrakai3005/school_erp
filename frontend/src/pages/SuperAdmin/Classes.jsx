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
import { Search, BookOpen, Building2 } from 'lucide-react';

export default function SuperAdminClasses() {
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [page, schoolFilter]);

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

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(schoolFilter && { school_id: schoolFilter }),
        ...(search && { search }),
      };
      const response = await superAdminApi.getAllClasses(params);
      if (response.success) {
        setClasses(response.data.classes || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClasses();
  };

  const schoolOptions = [
    { value: '', label: 'All Schools' },
    ...schools.map((s) => ({ value: s.id, label: s.school_name })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Classes</h1>
          <p className="text-slate-600">View classes across all schools</p>
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
                placeholder="Search by class name, code..."
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
        ) : classes.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No classes found"
              description="Try adjusting your search or filter criteria"
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Class Code</Th>
                  <Th>Class Name</Th>
                  <Th>Section</Th>
                  <Th>School</Th>
                  <Th>Class Teacher</Th>
                  <Th>Students</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{cls.class_code || '-'}</Td>
                    <Td>{cls.class_name}</Td>
                    <Td>{cls.section || '-'}</Td>
                    <Td>
                      <span className="text-sm">{cls.school_name || '-'}</span>
                    </Td>
                    <Td>{cls.class_teacher_name || '-'}</Td>
                    <Td>
                      <span className="font-medium">{cls.student_count || 0}</span>
                    </Td>
                    <Td>
                      <Badge variant={cls.status === 'active' ? 'success' : 'default'}>
                        {cls.status}
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
