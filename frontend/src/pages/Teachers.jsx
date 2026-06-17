import { useState, useEffect } from "react";
import { useTeachers } from "../hooks";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Select,
  Table,
  Th,
  Td,
  Badge,
  Modal,
  Pagination,
  Spinner,
  EmptyState,
} from "../components/ui";
import { Plus, Search, Edit2, Trash2, GraduationCap } from "lucide-react";

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const {
    teachers,
    pagination,
    loading,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  } = useTeachers({ page, search });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers({ page: 1, search });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      await deleteTeacher(id);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Teachers</h1>
          <p className="text-slate-600">Manage teaching staff</p>
        </div>
        <Button
          onClick={() => {
            setEditingTeacher(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </form>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : teachers.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={GraduationCap}
              title="No teachers found"
              description="Get started by adding your first teacher"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Teacher
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Employee ID</Th>
                  <Th>Name</Th>
                  <Th>Department</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{teacher.employee_id}</Td>
                    <Td>
                      <div>
                        <p className="font-medium">{teacher.full_name}</p>
                        <p className="text-xs text-slate-500">
                          {teacher.email}
                        </p>
                      </div>
                    </Td>
                    <Td>{teacher.department || "-"}</Td>
                    <Td>{teacher.phone || "-"}</Td>
                    <Td>
                      <Badge
                        variant={
                          teacher.status === "active" ? "success" : "default"
                        }
                      >
                        {teacher.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  fetchTeachers({ page: p });
                }}
              />
            )}
          </>
        )}
      </Card>

      <TeacherModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTeacher(null);
        }}
        teacher={editingTeacher}
        onSave={async (data) => {
          const result = editingTeacher
            ? await updateTeacher(editingTeacher.id, data)
            : await createTeacher(data);
          if (result.success) {
            setShowModal(false);
            setEditingTeacher(null);
          }
          return result;
        }}
      />
    </div>
  );
}

function TeacherModal({ isOpen, onClose, teacher, onSave }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    designation: "",
    qualification: "",
    experience_years: "",
    specialization: "",
    subjects: "",
    joining_date: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (teacher) {
      setFormData({
        employee_id: teacher.employee_id || "",
        full_name: teacher.full_name || "",
        email: teacher.email || "",
        password: "",
        phone: teacher.phone || "",
        department: teacher.department || "",
        designation: teacher.designation || "",
        qualification: teacher.qualification || "",
        experience_years: teacher.experience_years || "",
        specialization: teacher.specialization || "",
        subjects: teacher.subjects || "",
        joining_date: teacher.joining_date?.split("T")[0] || "",
        address: teacher.address || "",
      });
    } else {
      setFormData({
        employee_id: "",
        full_name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        designation: "",
        qualification: "",
        experience_years: "",
        specialization: "",
        subjects: "",
        joining_date: new Date().toISOString().split("T")[0],
        address: "",
      });
    }
  }, [teacher, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await onSave(formData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacher ? "Edit Teacher" : "Add Teacher"}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-96 overflow-y-auto"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Employee ID *"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            required
            disabled={!!teacher}
          />
          <Input
            label="Full Name *"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {!teacher && (
            <Input
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!teacher}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
          <Input
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Experience (Years)"
            name="experience_years"
            type="number"
            value={formData.experience_years}
            onChange={handleChange}
          />
          <Input
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Subjects (comma separated)"
          name="subjects"
          value={formData.subjects}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Joining Date"
            name="joining_date"
            type="date"
            value={formData.joining_date}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : teacher ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
