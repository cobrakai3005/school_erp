import { useState, useEffect } from "react";
import { useSchools } from "../hooks";
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
import { Plus, Search, Edit2, Trash2, Building2 } from "lucide-react";

export default function Schools() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  const {
    schools,
    pagination,
    loading,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
  } = useSchools({ page, search });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSchools({ page: 1, search });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this school? This action cannot be undone.",
      )
    ) {
      await deleteSchool(id);
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Schools</h1>
          <p className="text-slate-600">Manage registered schools</p>
        </div>
        <Button
          onClick={() => {
            setEditingSchool(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, code, email..."
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
        ) : schools.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Building2}
              title="No schools found"
              description="Get started by registering your first school"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add School
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>School Code</Th>
                  <Th>School Name</Th>
                  <Th>Contact</Th>
                  <Th>Location</Th>
                  <Th>Plan</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50">
                    <Td className="font-medium">{school.school_code}</Td>
                    <Td>
                      <div>
                        <p className="font-medium">{school.school_name}</p>
                        <p className="text-xs text-slate-500">{school.email}</p>
                      </div>
                    </Td>
                    <Td>{school.phone || "-"}</Td>
                    <Td>
                      {school.city}, {school.state}
                    </Td>
                    <Td>
                      <Badge variant="info">{school.subscription_plan}</Badge>
                    </Td>
                    <Td>
                      <Badge
                        variant={
                          school.status === "active"
                            ? "success"
                            : school.status === "suspended"
                              ? "danger"
                              : "default"
                        }
                      >
                        {school.status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(school)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(school.id)}
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
                  fetchSchools({ page: p });
                }}
              />
            )}
          </>
        )}
      </Card>

      <SchoolModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSchool(null);
        }}
        school={editingSchool}
        onSave={async (data) => {
          const result = editingSchool
            ? await updateSchool(editingSchool.id, data)
            : await createSchool(data);
          if (result.success) {
            setShowModal(false);
            setEditingSchool(null);
          }
          return result;
        }}
      />
    </div>
  );
}

function SchoolModal({ isOpen, onClose, school, onSave }) {
  const [formData, setFormData] = useState({
    school_code: "",
    school_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    subscription_plan: "standard",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (school) {
      setFormData({
        school_code: school.school_code || "",
        school_name: school.school_name || "",
        email: school.email || "",
        phone: school.phone || "",
        address: school.address || "",
        city: school.city || "",
        state: school.state || "",
        pincode: school.pincode || "",
        subscription_plan: school.subscription_plan || "standard",
        status: school.status || "active",
      });
    } else {
      setFormData({
        school_code: "",
        school_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        subscription_plan: "standard",
        status: "active",
      });
    }
  }, [school, isOpen]);

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

  const planOptions = [
    { value: "basic", label: "Basic" },
    { value: "standard", label: "Standard" },
    { value: "premium", label: "Premium" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={school ? "Edit School" : "Add School"}
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
            label="School Code *"
            name="school_code"
            value={formData.school_code}
            onChange={handleChange}
            required
            disabled={!!school}
          />
          <Input
            label="School Name *"
            name="school_name"
            value={formData.school_name}
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
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
          <Input
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Subscription Plan"
            name="subscription_plan"
            value={formData.subscription_plan}
            onChange={handleChange}
            options={planOptions}
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : school ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
