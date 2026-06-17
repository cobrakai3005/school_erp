import { useState, useEffect } from "react";
import { useHomework, useClasses } from "../hooks";
import { useAuth } from "../context";
import { homeworkApi } from "../api";
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
import {
  Plus,
  Edit2,
  Trash2,
  ClipboardList,
  Upload,
  Eye,
  CheckCircle,
  FileText,
} from "lucide-react";

export default function Homework() {
  const { userType, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const { homework, loading, createHomework, updateHomework, deleteHomework } =
    useHomework();
  const { classes } = useClasses();

  const canCreate = ["admin", "teacher"].includes(userType);
  const isStudent = userType === "student";
  const isTeacher = userType === "teacher";

  // Fetch student's submissions on mount if student
  useEffect(() => {
    if (isStudent || isTeacher) {
      fetchMySubmissions();
    }
  }, [isStudent]);

  const fetchMySubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      let response;
      if (isStudent) {
        response = await homeworkApi.getMySubmissions();
      } else if (isTeacher) {
        response = await homeworkApi.getAllSubmissions();
      }

      if (response.success) {
        setMySubmissions(response?.data?.submissions || []);
      } else {
        setMySubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      await deleteHomework(id);
    }
  };

  const handleEdit = (hw) => {
    setEditingHomework(hw);
    setShowModal(true);
  };

  const handleSubmit = (hw) => {
    setSelectedHomework(hw);
    setShowSubmitModal(true);
  };

  const handleViewSubmissions = (hw) => {
    setSelectedHomework(hw);
    setShowSubmissionsModal(true);
  };

  const getSubmissionStatus = (homeworkId) => {
    const submission = mySubmissions.find((s) => s.homework_id === homeworkId);
    if (submission) {
      if (submission.marks !== null) {
        return { status: "graded", marks: submission.marks };
      }
      return { status: "submitted" };
    }
    return { status: "pending" };
  };

  const isOverdue = (submissionDate) => {
    return new Date(submissionDate) < new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Homework</h1>
          <p className="text-slate-600">
            {isStudent
              ? "View and submit homework assignments"
              : "Manage homework assignments"}
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setEditingHomework(null);
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Homework
          </Button>
        )}
      </div>

      {/* Homework Assignments Table */}
      <Card className="mb-6 border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Homework Assignments
              </h2>
              <p className="text-sm text-slate-500">
                {isStudent
                  ? "View assigned homework"
                  : "Manage homework assignments"}
              </p>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-10">
            <Spinner />
          </CardContent>
        ) : homework.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={ClipboardList}
              title="No homework found"
              description={
                canCreate
                  ? "Create homework assignments for students"
                  : "No homework assigned yet"
              }
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Title</Th>
                  <Th>Subject</Th>
                  <Th>Class</Th>
                  <Th>Given Date</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  {isStudent && <Th>Submission</Th>}
                  <Th>Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {homework.map((hw) => {
                  const submissionInfo = isStudent
                    ? getSubmissionStatus(hw.id)
                    : null;

                  const overdue = isOverdue(hw.submission_date);

                  return (
                    <tr
                      key={hw.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <Td className="font-medium text-slate-900">{hw.title}</Td>

                      <Td>{hw.subject}</Td>

                      <Td>{hw.class_name || `Class ${hw.class_id}`}</Td>

                      <Td>{new Date(hw.given_date).toLocaleDateString()}</Td>

                      <Td>
                        <span
                          className={overdue ? "text-red-600 font-medium" : ""}
                        >
                          {new Date(hw.submission_date).toLocaleDateString()}
                        </span>
                      </Td>

                      <Td>
                        <Badge
                          variant={
                            hw.status === "completed"
                              ? "success"
                              : hw.status === "cancelled"
                                ? "danger"
                                : overdue
                                  ? "warning"
                                  : "info"
                          }
                        >
                          {overdue && hw.status === "active"
                            ? "overdue"
                            : hw.status}
                        </Badge>
                      </Td>

                      {isStudent && (
                        <Td>
                          {submissionInfo.status === "graded" ? (
                            <Badge variant="success">
                              Graded: {submissionInfo.marks}/100
                            </Badge>
                          ) : submissionInfo.status === "submitted" ? (
                            <Badge variant="info">Submitted</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </Td>
                      )}

                      <Td>
                        <div className="flex items-center gap-2">
                          {isStudent &&
                            submissionInfo.status === "pending" &&
                            !overdue && (
                              <>
                                <a
                                  href={hw.attachment || ""}
                                  target="_blank"
                                  onClick={() => handleEdit(hw)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                  title="Edit"
                                >
                                  {hw.attachment ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    ""
                                  )}
                                </a>
                                <button
                                  onClick={() => handleSubmit(hw)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition"
                                  title="Submit Homework"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                              </>
                            )}

                          {(isTeacher || canCreate) && (
                            <button
                              onClick={() => handleViewSubmissions(hw)}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="View Submissions"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {canCreate && (
                            <>
                              <button
                                onClick={() => handleEdit(hw)}
                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDelete(hw.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Homework Submissions Table */}

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                My Homework Submissions
              </h2>

              <p className="text-sm text-slate-500">
                Track submitted homework and grades
              </p>
            </div>
          </div>
        </CardHeader>

        {loadingSubmissions ? (
          <CardContent className="flex justify-center py-10">
            <Spinner />
          </CardContent>
        ) : mySubmissions.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No submissions found"
              description="You have not submitted any homework yet"
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Title</Th>
                  <Th>Subject</Th>
                  <Th>Submitted On</Th>
                  <Th>Status</Th>
                  <Th>Marks</Th>
                  <Th>Attachment</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loadingSubmissions && "Loading..."}
                {!loadingSubmissions &&
                  mySubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <Td className="font-medium text-slate-900">
                        {submission.homework_title}
                      </Td>

                      <Td>{submission.subject}</Td>

                      <Td>
                        {new Date(
                          submission.submission_date,
                        ).toLocaleDateString()}
                      </Td>

                      <Td>
                        <Badge
                          variant={
                            submission.status === "graded"
                              ? "success"
                              : submission.status === "submitted"
                                ? "info"
                                : "warning"
                          }
                        >
                          {submission.status}
                        </Badge>
                      </Td>

                      <Td>
                        {submission.marks ? (
                          <Badge variant="success">
                            {submission.marks}/100
                          </Badge>
                        ) : (
                          <Badge variant="warning">Not Graded</Badge>
                        )}
                      </Td>

                      <Td>
                        {submission.attachment ? (
                          <a
                            href={submission.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No File
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Homework Modal */}
      <HomeworkModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHomework(null);
        }}
        homework={editingHomework}
        classes={classes}
        onSave={async (data, file) => {
          const result = editingHomework
            ? await updateHomework(editingHomework.id, data)
            : await createHomework(data, file);
          if (result.success) {
            setShowModal(false);
            setEditingHomework(null);
          }
          return result;
        }}
      />

      {/* Submit Homework Modal (Student) */}
      <SubmitHomeworkModal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedHomework(null);
        }}
        homework={selectedHomework}
        onSubmit={async (data, file) => {
          try {
            const result = await homeworkApi.submitHomework(data, file);
            if (result.success) {
              setShowSubmitModal(false);
              setSelectedHomework(null);
              fetchMySubmissions();
            }
            return result;
          } catch (err) {
            return {
              success: false,
              message:
                err.response?.data?.message || "Failed to submit homework",
            };
          }
        }}
      />

      {/* View Submissions Modal (Teacher/Admin) */}
      <ViewSubmissionsModal
        isOpen={showSubmissionsModal}
        onClose={() => {
          setShowSubmissionsModal(false);
          setSelectedHomework(null);
        }}
        homework={selectedHomework}
      />
    </div>
  );
}

function HomeworkModal({ isOpen, onClose, homework, classes, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    class_id: "",

    given_date: new Date().toISOString().split("T")[0],
    submission_date: "",
  });
  const [attachment, setAttachment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (homework) {
      setFormData({
        title: homework.title || "",
        subject: homework.subject || "",
        description: homework.description || "",
        class_id: homework.class_id || "",
        given_date:
          homework.given_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        submission_date: homework.submission_date?.split("T")[0] || "",
      });
    } else {
      setFormData({
        title: "",
        subject: "",
        description: "",
        class_id: "",
        given_date: new Date().toISOString().split("T")[0],
        submission_date: "",
      });
    }
    setError("");
  }, [homework, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await onSave(formData, attachment);

      if (!result.success) {
        setError(result.message || "Failed to save homework");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
      setAttachment(null);
    }
  };

  const classOptions = [
    { value: "", label: "Select Class" },
    ...classes.map((c) => ({
      value: c.id,
      label: `${c.class_name} ${c.section || ""}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={homework ? "Edit Homework" : "Add Homework"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Subject *"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
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
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(e) => setAttachment(e.target.files[0])}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {attachment && (
          <p className="text-sm text-green-600 mt-1">
            Selected: {attachment.name}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Given Date *"
            name="given_date"
            type="date"
            value={formData.given_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Submission Date *"
            name="submission_date"
            type="date"
            value={formData.submission_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : homework ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SubmitHomeworkModal({ isOpen, onClose, homework, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    remarks: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({ remarks: "" });
      setFile(null);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      homework_id: homework?.id,
      student_id: user?.studentId || user?.id,
      submission_date: new Date().toISOString().split("T")[0],
      remarks: formData.remarks,
    };

    const result = await onSubmit(data, file);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  if (!homework) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Homework">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-slate-900">{homework.title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            Subject: {homework.subject}
          </p>
          <p className="text-sm text-slate-500">
            Due: {new Date(homework.submission_date).toLocaleDateString()}
          </p>
          {homework.description && (
            <p className="text-sm text-slate-600 mt-2">
              {homework.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Upload Attachment (PDF, DOC, Image)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {file && (
            <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            rows={3}
            placeholder="Add any notes or comments about your submission..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Homework"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ViewSubmissionsModal({ isOpen, onClose, homework }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: "", feedback: "" });
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  useEffect(() => {
    if (isOpen && homework) {
      fetchSubmissions();
    }
  }, [isOpen, homework]);

  const fetchSubmissions = async () => {
    if (!homework) return;
    setLoading(true);
    try {
      const response = await homeworkApi.getSubmissions(homework.id);
      if (response.success) {
        setSubmissions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      marks: submission.marks || "",
      feedback: submission.feedback || "",
    });
    setGradeError("");
  };

  const submitGrade = async () => {
    if (!gradingSubmission) return;
    setGradeLoading(true);
    setGradeError("");

    try {
      const result = await homeworkApi.gradeSubmission(gradingSubmission.id, {
        marks: parseInt(gradeData.marks),
        feedback: gradeData.feedback,
      });

      if (result.success) {
        setGradingSubmission(null);
        fetchSubmissions();
      } else {
        setGradeError(result.message || "Failed to grade submission");
      }
    } catch (err) {
      setGradeError(
        err.response?.data?.message || "Failed to grade submission",
      );
    } finally {
      setGradeLoading(false);
    }
  };

  if (!homework) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submissions: ${homework.title}`}
    >
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg text-sm">
          <p>
            <span className="font-medium">Subject:</span> {homework.subject}
          </p>
          <p>
            <span className="font-medium">Due:</span>{" "}
            {new Date(homework.submission_date).toLocaleDateString()}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No submissions yet"
            description="Students have not submitted this homework yet"
          />
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {submission.student_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Roll No: {submission.roll_no}
                    </p>
                    <p className="text-sm text-slate-500">
                      Submitted:{" "}
                      {new Date(
                        submission.submission_date,
                      ).toLocaleDateString()}
                    </p>
                    {submission.remarks && (
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="font-medium">Remarks:</span>{" "}
                        {submission.remarks}
                      </p>
                    )}
                    {submission.attachment && (
                      <a
                        href={submission.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    {submission.marks !== null ? (
                      <div>
                        <Badge variant="success">{submission.marks}/100</Badge>
                        {submission.feedback && (
                          <p className="text-xs text-slate-500 mt-1 max-w-32 truncate">
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGrade(submission)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Grade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Grading Form */}
                {gradingSubmission?.id === submission.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    {gradeError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {gradeError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Marks (0-100) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeData.marks}
                          onChange={(e) =>
                            setGradeData({
                              ...gradeData,
                              marks: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Feedback
                        </label>
                        <input
                          type="text"
                          value={gradeData.feedback}
                          onChange={(e) =>
                            setGradeData({
                              ...gradeData,
                              feedback: e.target.value,
                            })
                          }
                          placeholder="Good work!"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setGradingSubmission(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={submitGrade}
                        disabled={gradeLoading || !gradeData.marks}
                      >
                        {gradeLoading ? "Saving..." : "Save Grade"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
