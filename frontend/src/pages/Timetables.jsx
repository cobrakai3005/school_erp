import React, { useEffect, useState, useRef } from "react";
import { useTimetable } from "../hooks/useTimetable";
import { useClasses } from "../hooks/useClasses";
import { useTeachers } from "../hooks/useTeachers";

import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Layers,
  GraduationCap,
  Download,
  Loader2,
} from "lucide-react";
// 1. Change the import at the top
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Timetable() {
  // Hooks
  const { classes } = useClasses();
  const { teachers } = useTeachers();
  const {
    timetables,
    loading,
    error,
    fetchTimetables,
    fetchByClass,
    deleteTimetable,
    createTimetable,
  } = useTimetable();

  // State
  const [selectedClass, setSelectedClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pdfRef = useRef(); // For PDF Export

  const [formData, setFormData] = useState({
    class_id: "",
    day_of_week: "Monday",
    period_number: 1,
    start_time: "08:00",
    end_time: "09:00",
    subject: "",
    teacher_id: "",
    room_no: "",
  });

  // Load Data
  useEffect(() => {
    if (selectedClass) {
      fetchByClass(selectedClass);
    } else {
      fetchTimetables();
    }
  }, [selectedClass, fetchByClass, fetchTimetables]);

  // Helper: Find Entry for Grid
  const getEntry = (day, period) => {
    if (!timetables || !Array.isArray(timetables)) return null;
    return timetables.find(
      (item) =>
        item.day_of_week?.toLowerCase() === day.toLowerCase() &&
        Number(item.period_number) === Number(period),
    );
  };

  // Helper: Get Teacher Name Safely
  const getTeacherName = (teacherId) => {
    if (!teacherId) return "No Teacher";
    const teacher = teachers?.find((t) => Number(t.id) === Number(teacherId));
    return teacher ? teacher.full_name || teacher.name : `ID: ${teacherId}`;
  };

  // Helper: Get Class Label
  const getClassName = (classId) => {
    const cls = classes?.find((c) => Number(c.id) === Number(classId));
    return cls ? `${cls.class_name} ${cls.section}` : `Class ${classId}`;
  };

  // Actions
  const handleOpenModal = (day = "Monday", period = 1) => {
    setFormData({
      ...formData,
      day_of_week: day,
      period_number: period,
      class_id: selectedClass || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTimetable(formData);
      setIsModalOpen(false);
      selectedClass ? fetchByClass(selectedClass) : fetchTimetables();
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this timetable entry?")) {
      await deleteTimetable(id);
      selectedClass ? fetchByClass(selectedClass) : fetchTimetables();
    }
  };

  // ... inside your component
  const downloadPDF = async () => {
    const element = pdfRef.current;

    try {
      // 2. Use toPng from html-to-image
      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: "#ffffff", // Ensures background isn't transparent
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Timetable_${selectedClass ? getClassName(selectedClass) : "General"}.pdf`,
      );
    } catch (err) {
      console.error("Oops, something went wrong!", err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-medium text-slate-900 flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} /> Schedule Manager
          </h1>
          <p className="text-slate-500 font-medium">Academic Year 2025-2026</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Layers
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <select
              className="pl-10 pr-8 py-2.5 border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-600 bg-white w-full md:w-64 outline-none appearance-none font-medium"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} {cls.section}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadPDF}
            className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition shadow-sm"
          >
            <Download size={18} /> Export
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Add Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* --- TIMETABLE GRID --- */}
      <div
        ref={pdfRef}
        className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-2"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-xs font-bold text-slate-400 border-r w-20 text-center uppercase">
                  Per.
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="p-5 text-xs font-black text-slate-700 uppercase tracking-widest min-w-[200px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td className="p-5 border-r bg-slate-50/30 text-center font-black text-slate-400 text-lg">
                    {period}
                  </td>
                  {DAYS.map((day) => {
                    const entry = getEntry(day, period);
                    return (
                      <td
                        key={`${day}-${period}`}
                        className="p-3 relative min-h-[150px]"
                      >
                        {entry ? (
                          <div className="bg-white border-l-4 border-l-zinc-600 border border-slate-200 rounded-r-md p-4 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                              {!selectedClass && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold uppercase">
                                  {getClassName(entry.class_id)}
                                </span>
                              )}
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <h4 className="font-bold text-slate-800 text-base mb-3 leading-tight">
                              {entry.subject}
                            </h4>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[12px] text-slate-600 font-semibold italic">
                                <GraduationCap
                                  size={14}
                                  className="text-blue-500"
                                />
                                <span>{getTeacherName(entry.teacher_id)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <Clock size={14} />
                                <span>
                                  {entry.start_time?.substring(0, 5)} -{" "}
                                  {entry.end_time?.substring(0, 5)}
                                </span>
                              </div>
                              {entry.room_no && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                  <MapPin size={14} />
                                  <span>Room {entry.room_no}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(day, period)}
                            className="w-full h-28 border-2 border-dashed border-transparent hover:border-blue-100 hover:bg-blue-50/20 rounded-2xl flex items-center justify-center transition-all group"
                          >
                            <Plus
                              className="text-slate-200 group-hover:text-blue-400"
                              size={28}
                            />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-blue-600" /> New Schedule Entry
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Class *
                  </label>
                  <select
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.class_id}
                    onChange={(e) =>
                      setFormData({ ...formData, class_id: e.target.value })
                    }
                  >
                    <option value="">Select a Class</option>
                    {classes?.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Teacher
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.teacher_id}
                    onChange={(e) =>
                      setFormData({ ...formData, teacher_id: e.target.value })
                    }
                  >
                    <option value="">Select Teacher (Optional)</option>
                    {teachers?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Day
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({ ...formData, day_of_week: e.target.value })
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Period #
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                    value={formData.period_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        period_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Room No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50"
                    value={formData.room_no}
                    onChange={(e) =>
                      setFormData({ ...formData, room_no: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
