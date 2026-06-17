import React, { useEffect, useState } from "react";
import { useAccountants } from "../hooks/useAccountants";

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

import { Plus, Search, Briefcase, Edit, Trash2 } from "lucide-react";

export default function Accontants() {
  const {
    accountants,
    createAccountant,
    deleteAccountant,
    fetchAccountants,
    updateAccountant,
    loading,
  } = useAccountants();

  const [showModal, setShowModal] = useState(false);

  const [selectedAccountant, setSelectedAccountant] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchAccountants(filters);
  };

  const filteredAccountants = accountants.filter((item) => {
    const search = filters.search.toLowerCase();

    return (
      item?.full_name?.toLowerCase().includes(search) ||
      item?.email?.toLowerCase().includes(search) ||
      item?.employee_id?.toLowerCase().includes(search)
    );
  });

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this accountant?",
    );

    if (!confirmDelete) return;

    const response = await deleteAccountant(id);

    if (response.success) {
      fetchData();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Accountant Management
          </h1>

          <p className="text-slate-600">Manage fee and salary accountants</p>
        </div>

        <Button
          onClick={() => {
            setSelectedAccountant(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Accountant
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search accountant..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />

            <Select
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value,
                })
              }
              options={[
                {
                  value: "",
                  label: "All Types",
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
        ) : filteredAccountants.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Briefcase}
              title="No accountants found"
              description="Create your first accountant"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Accountant
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Accountant</Th>
                <Th>Employee ID</Th>
                <Th>Type</Th>
                <Th>Phone</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredAccountants.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <Td>
                    <div>
                      <p className="font-medium">{item.full_name}</p>

                      <p className="text-xs text-slate-500">{item.email}</p>
                    </div>
                  </Td>

                  <Td>{item.employee_id || "-"}</Td>

                  <Td>
                    <Badge variant="info">{item.type}</Badge>
                  </Td>

                  <Td>{item.phone || "-"}</Td>

                  <Td>
                    <Badge variant="success">active</Badge>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-slate-400 hover:text-blue-600"
                        onClick={() => {
                          setSelectedAccountant(item);

                          setShowModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        className="p-1 text-slate-400 hover:text-red-600"
                        onClick={() => handleDelete(item.id)}
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

      <AccountantModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAccountant(null);
        }}
        accountant={selectedAccountant}
        onSave={async (data) => {
          let response;

          if (selectedAccountant) {
            response = await updateAccountant(selectedAccountant.id, data);
          } else {
            response = await createAccountant(data);
          }

          if (response.success) {
            setShowModal(false);
            setSelectedAccountant(null);

            fetchData();
          }

          return response;
        }}
      />
    </div>
  );
}

function AccountantModal({ isOpen, onClose, accountant, onSave }) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    employee_id: "",
    designation: "",
    type: "",
  });

  useEffect(() => {
    if (accountant) {
      setFormData({
        full_name: accountant.full_name || "",
        email: accountant.email || "",
        phone: accountant.phone || "",
        password: "",
        employee_id: accountant.employee_id || "",
        designation: accountant.designation || "",
        type: accountant.type || "",
      });
    }
  }, [accountant]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const response = await onSave(formData);

    if (!response.success) {
      setError(response.message);
    }

    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountant ? "Update Accountant" : "Add Accountant"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

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
            type="email"
            name="email"
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

          {!accountant && (
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
          />

          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        <Select
          label="Accountant Type"
          name="type"
          value={formData.type}
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
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : accountant
                ? "Update Accountant"
                : "Add Accountant"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
