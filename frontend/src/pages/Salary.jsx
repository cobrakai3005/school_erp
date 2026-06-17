import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { salaryApi } from "../api/salary";
import {
  Card,
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
import { Plus, DollarSign, Check } from "lucide-react";
import { useStaff } from "../hooks/useStaff";

export default function Salary() {
  const { schoolId } = useAuth();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const [selectedSalary, setSelectedSalary] = useState(null);

  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);

  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [staffTypeFilter, setStaffTypeFilter] = useState("");

  const { staff = [], loading: staffLoading, fetchAllStaff } = useStaff();

  useEffect(() => {
    fetchData();
  }, [schoolId, monthFilter, yearFilter]);

  const fetchData = async () => {
    if (!schoolId) return;

    setLoading(true);

    try {
      const [salaryRes] = await Promise.all([
        salaryApi.getAll(schoolId, {
          month: monthFilter,
          year: yearFilter,
        }),

        fetchAllStaff({
          limit: 200,
        }),
      ]);

      if (salaryRes.success) {
        setSalaries(salaryRes.data.salaries || salaryRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedSalary) return;

    try {
      const response = await salaryApi.update(schoolId, selectedSalary.id, {
        status: "paid",
        payment_date: new Date().toISOString().split("T")[0],
      });

      if (response.success) {
        setShowPayModal(false);
        setSelectedSalary(null);

        fetchData();
      }
    } catch (error) {
      console.error("Error marking salary as paid:", error);
    }
  };

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();

  const yearOptions = [
    {
      value: currentYear - 1,
      label: (currentYear - 1).toString(),
    },
    {
      value: currentYear,
      label: currentYear.toString(),
    },
    {
      value: currentYear + 1,
      label: (currentYear + 1).toString(),
    },
  ];

  const filteredSalaries = staffTypeFilter
    ? salaries.filter((s) => {
        // TEACHERS
        if (staffTypeFilter === "teacher") {
          return s.staff_type === "teacher";
        }

        // ACCOUNTANTS
        return s.accountant_type === staffTypeFilter;
      })
    : salaries;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Salary Management
          </h1>

          <p className="text-slate-600">
            Manage teacher and accountant salaries
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Generate Salary
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              options={monthOptions}
              className="w-full sm:w-48"
            />

            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              options={yearOptions}
              className="w-full sm:w-32"
            />

            <Select
              value={staffTypeFilter}
              onChange={(e) => setStaffTypeFilter(e.target.value)}
              options={[
                {
                  value: "",
                  label: "All Staff Types",
                },

                {
                  value: "teacher",
                  label: "Teachers",
                },

                {
                  value: "accountant_fee",
                  label: "Fee Accountant",
                },

                {
                  value: "accountant_salary",
                  label: "Salary Accountant",
                },

                {
                  value: "accountant_both",
                  label: "Both Accountant",
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading || staffLoading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : filteredSalaries.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={DollarSign}
              title="No salary records"
              description="Generate salaries for staff members"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Generate Salary
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Staff</Th>
                <Th>Type</Th>
                <Th>Basic Salary</Th>
                <Th>Allowances</Th>
                <Th>Deductions</Th>
                <Th>Net Salary</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredSalaries.map((salary) => (
                <tr key={salary.id} className="hover:bg-slate-50">
                  <Td>
                    <div>
                      <p className="font-medium">
                        {salary.full_name || `Staff ${salary.staff_id}`}
                      </p>

                      <p className="text-xs text-slate-500">{salary.email}</p>
                    </div>
                  </Td>

                  <Td>
                    <Badge
                      variant={
                        salary.staff_type === "teacher"
                          ? "info"
                          : salary.staff_type?.includes("accountant")
                            ? "success"
                            : "default"
                      }
                    >
                      {salary.staff_type
                        ?.replaceAll("_", " ")
                        ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </Td>

                  <Td>
                    Rs. {parseFloat(salary.basic_salary || 0).toLocaleString()}
                  </Td>

                  <Td>
                    Rs. {parseFloat(salary.allowances || 0).toLocaleString()}
                  </Td>

                  <Td>
                    Rs. {parseFloat(salary.deductions || 0).toLocaleString()}
                  </Td>

                  <Td className="font-medium">
                    Rs. {parseFloat(salary.net_salary || 0).toLocaleString()}
                  </Td>

                  <Td>
                    <Badge
                      variant={
                        salary.status === "paid"
                          ? "success"
                          : salary.status === "cancelled"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {salary.status}
                    </Badge>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-2">
                      {salary.status === "pending" && (
                        <button
                          onClick={() => {
                            setSelectedSalary(salary);

                            setShowPayModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-green-600"
                          title="Mark as Paid"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <SalaryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        staff={staff}
        month={monthFilter}
        year={yearFilter}
        schoolId={schoolId}
        onSave={async (data) => {
          try {
            const result = await salaryApi.create(schoolId, data);

            if (result.success) {
              setShowModal(false);

              fetchData();
            }

            return result;
          } catch (err) {
            return {
              success: false,
              message:
                err.response?.data?.message || "Failed to generate salary",
            };
          }
        }}
      />

      <Modal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);

          setSelectedSalary(null);
        }}
        title="Confirm Payment"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to mark this salary as paid?
          </p>

          {selectedSalary && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-medium">{selectedSalary.full_name}</p>

              <p className="text-sm text-slate-500">
                Net Salary: Rs.{" "}
                {parseFloat(selectedSalary.net_salary || 0).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowPayModal(false);

                setSelectedSalary(null);
              }}
            >
              Cancel
            </Button>

            <Button onClick={handleMarkAsPaid}>Confirm Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SalaryModal({
  isOpen,
  onClose,
  staff,
  month,
  year,
  schoolId,
  onSave,
}) {
  const [formData, setFormData] = useState({
    staff_id: "",
    staff_type: "teacher",
    basic_salary: "",
    allowances: "0",
    deductions: "0",
    bonus: "0",
    bank_name: "",
    account_number: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        staff_id: "",
        staff_type: "teacher",
        basic_salary: "",
        allowances: "0",
        deductions: "0",
        bonus: "0",
        bank_name: "",
        account_number: "",
        remarks: "",
      });

      setError("");
    }
  }, [isOpen]);

  const handleStaffChange = (e) => {
    const selectedId = e.target.value;

    const selectedStaff = staff.find((s) => s.user_id == selectedId);

    setFormData((prev) => ({
      ...prev,
      staff_id: selectedId,
      staff_type: selectedStaff?.staff_type || "teacher",
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const netSalary =
    (parseFloat(formData.basic_salary) || 0) +
    (parseFloat(formData.allowances) || 0) +
    (parseFloat(formData.bonus) || 0) -
    (parseFloat(formData.deductions) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setError("");

    const result = await onSave({
      ...formData,
      month,
      year,
      net_salary: netSalary,
    });

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const staffOptions = [
    {
      value: "",
      label: "Select Staff Member",
    },

    ...staff.map((s) => ({
      value: s.user_id,

      label: `${s.full_name} (${s.staff_type || s.user_type})${
        s.employee_id ? ` - ${s.employee_id}` : ""
      }`,
    })),
  ];

  const staffTypeOptions = [
    {
      value: "teacher",
      label: "Teacher",
    },

    {
      value: "accountant_fee",
      label: "Fee Accountant",
    },

    {
      value: "accountant_salary",
      label: "Salary Accountant",
    },

    {
      value: "accountant_both",
      label: "Both Accountant",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Salary">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {staff.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-medium">No staff members found</p>

            <p className="text-sm mt-1">
              Please add staff first before generating salaries.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Staff Member *"
                name="staff_id"
                value={formData.staff_id}
                onChange={handleStaffChange}
                options={staffOptions}
                required
              />

              <Select
                label="Staff Type *"
                name="staff_type"
                value={formData.staff_type}
                onChange={handleChange}
                options={staffTypeOptions}
                required
              />
            </div>

            <Input
              label="Basic Salary *"
              name="basic_salary"
              type="number"
              value={formData.basic_salary}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Allowances"
                name="allowances"
                type="number"
                value={formData.allowances}
                onChange={handleChange}
              />

              <Input
                label="Deductions"
                name="deductions"
                type="number"
                value={formData.deductions}
                onChange={handleChange}
              />

              <Input
                label="Bonus"
                name="bonus"
                type="number"
                value={formData.bonus}
                onChange={handleChange}
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Net Salary:</span>

                <span className="text-lg font-semibold text-slate-900">
                  Rs. {netSalary.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />

              <Input
                label="Account Number"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {staff.length > 0 && (
            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Salary"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
