import { useState, useEffect } from "react";
import { useClasses, useTeachers } from "../hooks";
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
  Spinner,
  EmptyState,
} from "../components/ui";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { useAuth } from "../context";

export default function Classes() {
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const { user } = useAuth();
  const { classes, loading, createClass, updateClass, deleteClass } =
    useClasses();
  const { teachers } = useTeachers();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      await deleteClass(id);
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Classes</h1>
          <p className="text-slate-600">Manage class sections</p>
        </div>
        {user.user_type === "admin" && (
          <Button
            onClick={() => {
              setEditingClass(null);
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Class
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : classes.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No classes found"
              description="Get started by adding your first class"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Class
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Class Code</Th>
                <Th>Class Name</Th>
                <Th>Section</Th>
                <Th>Academic Year</Th>
                <Th>Class Teacher</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50">
                  <Td className="font-medium">{cls.class_code}</Td>
                  <Td>{cls.class_name}</Td>
                  <Td>{cls.section || "-"}</Td>
                  <Td>{cls.academic_year || "-"}</Td>
                  <Td>{cls.class_teacher_name || "-"}</Td>
                  <Td>
                    <Badge
                      variant={cls.status === "active" ? "success" : "default"}
                    >
                      {cls.status}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
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
        )}
      </Card>

      <ClassModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClass(null);
        }}
        cls={editingClass}
        teachers={teachers}
        onSave={async (data) => {
          const result = editingClass
            ? await updateClass(editingClass.id, data)
            : await createClass(data);
          if (result.success) {
            setShowModal(false);
            setEditingClass(null);
          }
          return result;
        }}
      />
    </div>
  );
}

function ClassModal({ isOpen, onClose, cls, teachers, onSave }) {
  const [formData, setFormData] = useState({
    class_name: "",
    section: "",
    class_code: "",
    academic_year: "",
    class_teacher_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cls) {
      setFormData({
        class_name: cls.class_name || "",
        section: cls.section || "",
        class_code: cls.class_code || "",
        academic_year: cls.academic_year || "",
        class_teacher_id: cls.class_teacher_id || "",
      });
    } else {
      const currentYear = new Date().getFullYear();
      setFormData({
        class_name: "",
        section: "",
        class_code: "",
        academic_year: `${currentYear}-${currentYear + 1}`,
        class_teacher_id: "",
      });
    }
  }, [cls, isOpen]);

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

  const teacherOptions = [
    { value: "", label: "Select Class Teacher (Optional)" },
    ...teachers.map((t) => ({ value: t.id, label: t.full_name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cls ? "Edit Class" : "Add Class"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Class Name *"
            name="class_name"
            value={formData.class_name}
            onChange={handleChange}
            placeholder="e.g., Class 10"
            required
          />
          <Input
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            placeholder="e.g., A"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Class Code *"
            name="class_code"
            value={formData.class_code}
            onChange={handleChange}
            placeholder="e.g., 10A"
            required
          />
          <Input
            label="Academic Year"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            placeholder="e.g., 2024-2025"
          />
        </div>

        <Select
          label="Class Teacher"
          name="class_teacher_id"
          value={formData.class_teacher_id}
          onChange={handleChange}
          options={teacherOptions}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : cls ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
