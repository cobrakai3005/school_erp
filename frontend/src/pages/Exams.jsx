import { useState, useEffect } from "react";
import { useExams, useClasses } from "../hooks";
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
import { Plus, Edit2, Trash2, FileText } from "lucide-react";

export default function Exams() {
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const { exams, loading, createExam, updateExam, deleteExam } = useExams();
  const { classes } = useClasses();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      await deleteExam(id);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Exams</h1>
          <p className="text-slate-600">Manage examinations</p>
        </div>
        <Button
          onClick={() => {
            setEditingExam(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Create Exam
        </Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : exams.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No exams found"
              description="Create your first examination"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Create Exam
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Exam Name</Th>
                <Th>Type</Th>
                <Th>Class</Th>
                <Th>Date Range</Th>
                <Th>Max Marks</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50">
                  <Td className="font-medium">{exam.exam_name}</Td>
                  <Td className="capitalize">
                    {exam.exam_type?.replace("_", " ")}
                  </Td>
                  <Td>{exam.class_name || `Class ${exam.class_id}`}</Td>
                  <Td>
                    {new Date(exam.start_date).toLocaleDateString()} -{" "}
                    {new Date(exam.end_date).toLocaleDateString()}
                  </Td>
                  <Td>{exam.max_marks}</Td>
                  <Td>
                    <Badge
                      variant={
                        exam.status === "completed"
                          ? "success"
                          : exam.status === "ongoing"
                            ? "warning"
                            : exam.status === "cancelled"
                              ? "danger"
                              : "info"
                      }
                    >
                      {exam.status}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
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

      <ExamModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingExam(null);
        }}
        exam={editingExam}
        classes={classes}
        onSave={async (data) => {
          const result = editingExam
            ? await updateExam(editingExam.id, data)
            : await createExam(data);
          if (result.success) {
            setShowModal(false);
            setEditingExam(null);
          }
          return result;
        }}
      />
    </div>
  );
}

function ExamModal({ isOpen, onClose, exam, classes, onSave }) {
  const [formData, setFormData] = useState({
    exam_name: "",
    exam_type: "unit_test",
    class_id: "",
    start_date: "",
    end_date: "",
    max_marks: "100",
    passing_marks: "35",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (exam) {
      setFormData({
        exam_name: exam.exam_name || "",
        exam_type: exam.exam_type || "unit_test",
        class_id: exam.class_id || "",
        start_date: exam.start_date?.split("T")[0] || "",
        end_date: exam.end_date?.split("T")[0] || "",
        max_marks: exam.max_marks?.toString() || "100",
        passing_marks: exam.passing_marks?.toString() || "35",
        academic_year:
          exam.academic_year ||
          `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      });
    } else {
      setFormData({
        exam_name: "",
        exam_type: "unit_test",
        class_id: "",
        start_date: "",
        end_date: "",
        max_marks: "100",
        passing_marks: "35",
        academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      });
    }
  }, [exam, isOpen]);

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

  const typeOptions = [
    { value: "unit_test", label: "Unit Test" },
    { value: "quarterly", label: "Quarterly" },
    { value: "half_yearly", label: "Half Yearly" },
    { value: "annual", label: "Annual" },
    { value: "preliminary", label: "Preliminary" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exam ? "Edit Exam" : "Create Exam"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Exam Name *"
          name="exam_name"
          value={formData.exam_name}
          onChange={handleChange}
          placeholder="e.g., First Unit Test"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Exam Type *"
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
            options={typeOptions}
            required
          />
          <Select
            label="Class *"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            options={classOptions}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
          <Input
            label="End Date *"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Max Marks"
            name="max_marks"
            type="number"
            value={formData.max_marks}
            onChange={handleChange}
          />
          <Input
            label="Passing Marks"
            name="passing_marks"
            type="number"
            value={formData.passing_marks}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Academic Year"
          name="academic_year"
          value={formData.academic_year}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : exam ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
