import React, { useState } from "react";
import { useParents, useParentActions } from "../hooks/useParents";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Table,
  Th,
  Td,
  Modal,
  Pagination,
  Spinner,
  EmptyState,
} from "../components/ui";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";

export default function Parents() {
  const schoolId = "your-school-id"; // Get this from your Auth context
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  const { parents, pagination, loading, refresh } = useParents({
    schoolId,
    page,
    search,
  });

  const { addParent, editParent, removeParent, isSubmitting } =
    useParentActions();

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refresh({ page: 1, search });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      try {
        await removeParent(id);
        refresh();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingParent) {
        await editParent(editingParent.id, formData);
      } else {
        await addParent({ ...formData, schoolId });
      }
      setShowModal(false);
      setEditingParent(null);
      refresh();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Parents</h1>
          <p className="text-slate-600">
            Manage parent accounts and contact info
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingParent(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Parent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or phone..."
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
        ) : parents.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Users}
              title="No parents found"
              description="Get started by adding your first parent record"
              action={
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Parent
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Profession</Th>
                  <Th>Address</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-50">
                    <Td>
                      <div>
                        <p className="font-medium text-slate-900">
                          {parent.full_name}
                        </p>
                        <p className="text-xs text-slate-500">{parent.email}</p>
                      </div>
                    </Td>
                    <Td>{parent.phone || "-"}</Td>
                    <Td>{parent.profession || "-"}</Td>
                    <Td className="max-w-xs truncate">
                      {parent.address || "-"}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(parent)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(parent.id)}
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
                onPageChange={(p) => setPage(p)}
              />
            )}
          </>
        )}
      </Card>

      <ParentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingParent(null);
        }}
        parent={editingParent}
        onSave={handleSave}
      />
    </div>
  );
}

function ParentModal({ isOpen, onClose, parent, onSave }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    profession: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (parent) {
      setFormData({
        full_name: parent.full_name || "",
        email: parent.email || "",
        password: "", // Don't populate password on edit
        phone: parent.phone || "",
        profession: parent.profession || "",
        address: parent.address || "",
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        profession: "",
        address: "",
      });
    }
  }, [parent, isOpen]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={parent ? "Edit Parent" : "Add Parent"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Full Name *"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          {!parent && (
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <Input
            label="Profession"
            value={formData.profession}
            onChange={(e) =>
              setFormData({ ...formData, profession: e.target.value })
            }
          />
        </div>

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : parent ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
