import { useState, useEffect } from "react";
import { useStudents, useClasses } from "../hooks";
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
import { Plus, Search, Edit2, Trash2, Users, Eye } from "lucide-react";

export default function Students() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const {
    students,
    pagination,
    loading,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents({ page, search, class_id: classFilter || undefined });
  const { classes } = useClasses();

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents({ page: 1, search, class_id: classFilter || undefined });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await deleteStudent(id);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleView = (student) => {
    setViewingStudent(student);
  };

  const classOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({
      value: c.id,
      label: `${c.class_name} ${c.section || ""}`,
    })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
          <p className="text-slate-600">Manage student records</p>
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <Input
                placeholder="Search by name, admission no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              options={classOptions}
              className="w-full sm:w-48"
            />
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
        ) : students.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Users}
              title="No students found"
              description="Get started by adding your first student"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Admission No</Th>
                  <Th>Name</Th>
                  <Th>Class</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{student.admission_no}</Td>
                    <Td>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </Td>
                    <Td>
                      {student.class_name} {student.section}
                    </Td>
                    <Td>{student.phone || student.parent_phone || "-"}</Td>
                    <Td>
                      <Badge
                        variant={
                          student.status === "active" ? "success" : "default"
                        }
                      >
                        {student.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(student)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
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
                  fetchStudents({ page: p });
                }}
              />
            )}
          </>
        )}
      </Card>

      <StudentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        classes={classes}
        onSave={async (data) => {
          const { password, aadhar_number, admission_date, ...rest } = data;
          const result = editingStudent
            ? await updateStudent(editingStudent.id, rest)
            : await createStudent(data);
          if (result.success) {
            setShowModal(false);
            setEditingStudent(null);
          }
          return result;
        }}
      />

      <StudentDetailModal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />
    </div>
  );
}

function StudentModal({ isOpen, onClose, student, classes, onSave }) {
  const [formData, setFormData] = useState({
    admission_no: "",
    roll_no: "",
    full_name: "",
    email: "",
    password: "",
    phone: "",
    class_id: "",
    father_name: "",
    mother_name: "",
    parent_phone: "",
    parent_email: "",
    date_of_birth: "",
    gender: "",
    address: "",
    aadhar_number: "",
    admission_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) {
      setFormData({
        admission_no: student.admission_no || "",
        roll_no: student.roll_no || "",
        full_name: student.full_name || "",
        email: student.email || "",
        password: "",
        phone: student.phone || "",
        class_id: student.class_id || "",
        father_name: student.father_name || "",
        mother_name: student.mother_name || "",
        parent_phone: student.parent_phone || "",
        parent_email: student.parent_email || "",
        date_of_birth: student.date_of_birth?.split("T")[0] || "",
        gender: student.gender || "",
        address: student.address || "",
        aadhar_number: student.aadhar_number || "",
        admission_date: student.admission_date?.split("T")[0] || "",
      });
    } else {
      setFormData({
        admission_no: "",
        roll_no: "",
        full_name: "",
        email: "",
        password: "",
        phone: "",
        class_id: "",
        father_name: "",
        mother_name: "",
        parent_phone: "",
        parent_email: "",
        date_of_birth: "",
        gender: "",
        address: "",
        aadhar_number: "",
        admission_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [student, isOpen]);

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

  const classOptions = [
    { value: "", label: "Select Class" },
    ...classes.map((c) => ({
      value: c.id,
      label: `${c.class_name} ${c.section || ""}`,
    })),
  ];

  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? "Edit Student" : "Add Student"}
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
            label="Admission No *"
            name="admission_no"
            value={formData.admission_no}
            onChange={handleChange}
            required
            disabled={!!student}
          />
          <Input
            label="Roll No"
            name="roll_no"
            value={formData.roll_no}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Full Name *"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {!student && (
            <Input
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!student}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Class *"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            options={classOptions}
            required
          />
          <Select
            label="Gender *"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={genderOptions}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Father Name"
            name="father_name"
            value={formData.father_name}
            onChange={handleChange}
          />
          <Input
            label="Mother Name"
            name="mother_name"
            value={formData.mother_name}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Parent Phone"
            name="parent_phone"
            value={formData.parent_phone}
            onChange={handleChange}
          />
          <Input
            label="Aadhar Number *"
            name="aadhar_number"
            value={formData.aadhar_number}
            onChange={handleChange}
            required
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
            {loading ? "Saving..." : student ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function StudentDetailModal({ isOpen, onClose, student }) {
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Admission No</p>
            <p className="font-medium">{student.admission_no}</p>
          </div>
          <div>
            <p className="text-slate-500">Roll No</p>
            <p className="font-medium">{student.roll_no || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Full Name</p>
            <p className="font-medium">{student.full_name}</p>
          </div>
          <div>
            <p className="text-slate-500">Email</p>
            <p className="font-medium">{student.email}</p>
          </div>
          <div>
            <p className="text-slate-500">Class</p>
            <p className="font-medium">
              {student.class_name} {student.section}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Gender</p>
            <p className="font-medium capitalize">{student.gender || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Father Name</p>
            <p className="font-medium">{student.father_name || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Mother Name</p>
            <p className="font-medium">{student.mother_name || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Parent Phone</p>
            <p className="font-medium">{student.parent_phone || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <Badge
              variant={student.status === "active" ? "success" : "default"}
            >
              {student.status}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
