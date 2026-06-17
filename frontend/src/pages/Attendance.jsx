import { useState } from "react";
import { useClasses, useAttendance } from "../hooks";
import { studentsApi } from "../api";
import { useAuth } from "../context";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  Table,
  Th,
  Td,
  Badge,
  Spinner,
  EmptyState,
} from "../components/ui";
import { Calendar, Check, X, Clock } from "lucide-react";

export default function Attendance() {
  const { schoolId } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const { classes } = useClasses();
  const { markBulkAttendance } = useAttendance();

  const fetchStudentsForClass = async (classId) => {
    if (!classId || !schoolId) return;
    setLoadingStudents(true);
    try {
      const response = await studentsApi.getByClass(schoolId, classId);
      if (response.success) {
        setStudents(response.data || []);
        // Initialize attendance data
        const initial = {};
        (response.data || []).forEach((student) => {
          initial[student.id] = "present";
        });
        setAttendanceData(initial);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (classId) {
      fetchStudentsForClass(classId);
    } else {
      setStudents([]);
      setAttendanceData({});
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return;
    /**
     * { "class_id": 1, "attendance_date": "2023-10-25", "attendanceList": [ { "student_id": 1, "status": "present" }, { "student_id": 2, "status": "absent", "remarks": "Medical" } ] }
     *
     *
     */
    setSaving(true);
    const class_id = parseInt(selectedClass);
    const attendance_date = selectedDate;
    const attendance_list = students.map((st) => ({
      student_id: st.id,
      status: attendanceData[st.id] || "present",
    }));
    // const attendanceRecords = students.map((student) => ({
    //   student_id: student.id,
    //   class_id: parseInt(selectedClass),
    //   attendance_date: selectedDate,
    //   status: attendanceData[student.id] || "present",
    // }));

    const result = await markBulkAttendance({
      class_id,
      attendance_date,
      attendance_list,
    });
    if (result.success) {
      alert("Attendance saved successfully!");
    } else {
      alert(result.message || "Failed to save attendance");
    }
    setSaving(false);
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((student) => {
      updated[student.id] = status;
    });
    setAttendanceData(updated);
  };

  const classOptions = [
    { value: "", label: "Select Class" },
    ...classes.map((c) => ({
      value: c.id,
      label: `${c.class_name} ${c.section || ""}`,
    })),
  ];

  const getStatusBadge = (status) => {
    const variants = {
      present: "success",
      absent: "danger",
      late: "warning",
      half_day: "info",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
        <p className="text-slate-600">Mark daily student attendance</p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              options={classOptions}
              className="w-full sm:w-64"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {students.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => markAll("present")}
                >
                  All Present
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => markAll("absent")}
                >
                  All Absent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        {loadingStudents ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : !selectedClass ? (
          <CardContent>
            <EmptyState
              icon={Calendar}
              title="Select a class"
              description="Choose a class to mark attendance"
            />
          </CardContent>
        ) : students.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Calendar}
              title="No students found"
              description="This class has no students enrolled"
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Roll No</Th>
                  <Th>Student Name</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{student.roll_no || "-"}</Td>
                    <Td>{student.full_name}</Td>
                    <Td>{getStatusBadge(attendanceData[student.id])}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleStatusChange(student.id, "present")
                          }
                          className={`p-1.5 rounded ${attendanceData[student.id] === "present" ? "bg-green-100 text-green-600" : "text-slate-400 hover:text-green-600"}`}
                          title="Present"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(student.id, "absent")
                          }
                          className={`p-1.5 rounded ${attendanceData[student.id] === "absent" ? "bg-red-100 text-red-600" : "text-slate-400 hover:text-red-600"}`}
                          title="Absent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "late")}
                          className={`p-1.5 rounded ${attendanceData[student.id] === "late" ? "bg-yellow-100 text-yellow-600" : "text-slate-400 hover:text-yellow-600"}`}
                          title="Late"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {students.length} students | Present:{" "}
                {
                  Object.values(attendanceData).filter((s) => s === "present")
                    .length
                }{" "}
                | Absent:{" "}
                {
                  Object.values(attendanceData).filter((s) => s === "absent")
                    .length
                }{" "}
                | Late:{" "}
                {
                  Object.values(attendanceData).filter((s) => s === "late")
                    .length
                }
              </div>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
