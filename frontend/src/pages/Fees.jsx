import { useState, useEffect } from "react";
import {
  useFeeStructures,
  useFeePayments,
  useClasses,
  useStudents,
} from "../hooks";
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
  Pagination,
} from "../components/ui";
import { Plus, DollarSign, Search } from "lucide-react";
import { useAuth } from "../context";

export default function Fees() {
  const [activeTab, setActiveTab] = useState("payments");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Fee Management
        </h1>
        <p className="text-slate-600">Manage fee structures and payments</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "payments"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Fee Payments
        </button>
        <button
          onClick={() => setActiveTab("structures")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "structures"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Fee Structures
        </button>
      </div>

      {activeTab === "payments" ? <FeePayments /> : <FeeStructures />}
    </div>
  );
}

function FeePayments() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { payments, pagination, loading, fetchPayments, createPayment } =
    useFeePayments();
  const { students } = useStudents();

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments({ page: 1, search });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="flex gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Search by receipt no, student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </form>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : payments.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={DollarSign}
              title="No payments recorded"
              description="Record the first fee payment"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Record Payment
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Receipt No</Th>
                  <Th>Student</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                  <Th>Mode</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{payment.receipt_no}</Td>
                    <Td>{payment.student_name || payment.admission_no}</Td>
                    <Td className="font-medium">Rs. {payment.amount}</Td>
                    <Td>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </Td>
                    <Td className="capitalize">{payment.payment_mode}</Td>
                    <Td>
                      <Badge
                        variant={
                          payment.status === "confirmed"
                            ? "success"
                            : payment.status === "failed"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {payment.status}
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
                onPageChange={(p) => {
                  setPage(p);
                  fetchPayments({ page: p });
                }}
              />
            )}
          </>
        )}
      </Card>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        students={students}
        onSave={async (data) => {
          const result = await createPayment(data);
          if (result.success) {
            setShowModal(false);
          }
          return result;
        }}
      />
    </>
  );
}

function FeeStructures() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { structures, loading, createStructure } = useFeeStructures();

  const { classes } = useClasses();

  return (
    <>
      <Card>
        <CardHeader className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Add Fee Structure
          </Button>
        </CardHeader>

        {loading ? (
          <CardContent className="flex justify-center py-8">
            <Spinner />
          </CardContent>
        ) : structures.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={DollarSign}
              title="No fee structures"
              description="Create fee structures for different classes"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Fee Structure
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Class</Th>
                <Th>Fee Type</Th>
                <Th>Amount</Th>
                <Th>Frequency</Th>
                <Th>Due Day</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!loading &&
                structures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-slate-50">
                    <Td>
                      {structure.class_name || `Class ${structure.class_id}`}
                    </Td>
                    <Td className="font-medium">{structure.fee_type}</Td>
                    <Td className="font-medium">Rs. {structure.amount}</Td>
                    <Td className="capitalize">{structure.frequency}</Td>
                    <Td>{structure.due_day}</Td>
                    <Td>
                      <Badge
                        variant={
                          structure.status === "active" ? "success" : "default"
                        }
                      >
                        {structure.status}
                      </Badge>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </Card>

      <StructureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        classes={classes}
        onSave={async (data) => {
          const result = await createStructure(data);
          if (result.success) {
            setShowModal(false);
          }
          return result;
        }}
      />
    </>
  );
}

function PaymentModal({ isOpen, onClose, students, onSave }) {
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_mode: "cash",
    transaction_id: "",
    notes: "",
  });

  const { school } = useAuth();
  console.log(school);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      school_id: school.id,
      [e.target.name]: e.target.value,
    });
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

  const studentOptions = [
    { value: "", label: "Select Student" },
    ...students.map((s) => ({
      value: s.id,
      label: `${s.admission_no} - ${s.full_name}`,
    })),
  ];

  const modeOptions = [
    { value: "cash", label: "Cash" },
    { value: "online", label: "Online" },
    { value: "cheque", label: "Cheque" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "card", label: "Card" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Fee Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Select
          label="Student *"
          name="student_id"
          value={formData.student_id}
          onChange={handleChange}
          options={studentOptions}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount *"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <Input
            label="Payment Date *"
            name="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payment Mode *"
            name="payment_mode"
            value={formData.payment_mode}
            onChange={handleChange}
            options={modeOptions}
            required
          />
          <Input
            label="Transaction ID"
            name="transaction_id"
            value={formData.transaction_id}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function StructureModal({ isOpen, onClose, classes, onSave }) {
  const [formData, setFormData] = useState({
    class_id: "",
    fee_type: "",
    amount: "",
    frequency: "monthly",
    due_day: "10",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const frequencyOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "half_yearly", label: "Half Yearly" },
    { value: "yearly", label: "Yearly" },
    { value: "one_time", label: "One Time" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Fee Structure">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Select
          label="Class *"
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          options={classOptions}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fee Type *"
            name="fee_type"
            value={formData.fee_type}
            onChange={handleChange}
            placeholder="e.g., Tuition Fee"
            required
          />
          <Input
            label="Amount *"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Frequency *"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            options={frequencyOptions}
            required
          />
          <Input
            label="Due Day"
            name="due_day"
            type="number"
            min="1"
            max="31"
            value={formData.due_day}
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
            {loading ? "Saving..." : "Create Structure"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
