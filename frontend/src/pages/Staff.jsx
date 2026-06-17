import React, { useEffect, useState } from "react";
import { useStaff } from "../hooks/useStaff";
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

import { Plus, Users, Search } from "lucide-react";

export default function Staff() {
  const { fetchAllStaff, loading, staff } = useStaff();

  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    staff_type: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchAllStaff(filters);
  };

  const filteredStaff = staff.filter((item) => {
    const search = filters.search.toLowerCase();

    return (
      item.full_name?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.employee_id?.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Staff Management
          </h1>

          <p className="text-slate-600">
            Manage teachers, accountants and other staff
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, email or employee ID"
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />

            <Select
              value={filters.staff_type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  staff_type: e.target.value,
                })
              }
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
                  value: "accountant",
                  label: "Accountants",
                },
                {
                  value: "other",
                  label: "Other Staff",
                },
              ]}
            />

            <Button onClick={fetchData}>
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <CardContent className="flex justify-center py-10">
            <Spinner />
          </CardContent>
        ) : filteredStaff.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Users}
              title="No staff found"
              description="Add teachers or accountants"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Staff
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Staff</Th>
                <Th>Employee ID</Th>
                <Th>Type</Th>
                <Th>Department</Th>
                <Th>Designation</Th>
                <Th>Status</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredStaff.map((item) => (
                <tr key={item.user_id} className="hover:bg-slate-50">
                  <Td>
                    <div>
                      <p className="font-medium">{item.full_name}</p>

                      <p className="text-xs text-slate-500">{item.email}</p>
                    </div>
                  </Td>

                  <Td>{item.employee_id || "-"}</Td>

                  <Td>
                    <Badge
                      variant={
                        item.staff_type === "teacher"
                          ? "info"
                          : item.staff_type === "accountant"
                            ? "warning"
                            : "default"
                      }
                    >
                      {item.staff_type}
                    </Badge>
                  </Td>

                  <Td>{item.department || "-"}</Td>

                  <Td>{item.designation || "-"}</Td>

                  <Td>
                    <Badge
                      variant={
                        item.staff_status === "active" ? "success" : "danger"
                      }
                    >
                      {item.staff_status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <StaffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (data) => {
          console.log(data);

          // CALL API HERE
          // const response = await staffApi.create(data)

          // if(response.success){
          //   setShowModal(false)
          //   fetchData()
          // }

          setShowModal(false);
        }}
      />
    </div>
  );
}

function StaffModal({ isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",

    staff_type: "teacher",
    designation: "",

    department: "",
    subjects: "",

    accountant_type: "",

    employee_id: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    await onSave(formData);

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Staff">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Staff Type"
            name="staff_type"
            value={formData.staff_type}
            onChange={handleChange}
            options={[
              {
                value: "teacher",
                label: "Teacher",
              },
              {
                value: "accountant",
                label: "Accountant",
              },
              {
                value: "other",
                label: "Other Staff",
              },
            ]}
          />

          <Input
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
        />

        {/* Teacher Fields */}
        {formData.staff_type === "teacher" && (
          <>
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />

            <Input
              label="Subjects (comma separated)"
              name="subjects"
              value={formData.subjects}
              onChange={handleChange}
              placeholder="Math, Science"
            />
          </>
        )}

        {/* Accountant Fields */}
        {formData.staff_type === "accountant" && (
          <Select
            label="Accountant Type"
            name="accountant_type"
            value={formData.accountant_type}
            onChange={handleChange}
            options={[
              {
                value: "",
                label: "Select Accountant Type",
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
                label: "Both",
              },
            ]}
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Staff"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
