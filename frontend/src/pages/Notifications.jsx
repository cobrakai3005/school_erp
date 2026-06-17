import { useEffect, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
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

import { Plus, Bell, Edit, Trash2 } from "lucide-react";

export default function Notifications() {
  const {
    notifications,
    loading,
    fetchAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
  } = useNotifications();

  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    notification_type: "",
    search: "",
  });

  useEffect(() => {
    fetchAllNotifications(filters);
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmDelete) return;

    const response = await deleteNotification(id);

    if (response.success) {
      fetchAllNotifications(filters);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Notification Management
          </h1>
          <p className="text-slate-600">
            Create and manage school notifications
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedNotification(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />

            <Select
              value={filters.notification_type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  notification_type: e.target.value,
                })
              }
              options={[
                { value: "", label: "All Types" },
                { value: "announcement", label: "Announcement" },
                { value: "event", label: "Event" },
                { value: "alert", label: "Alert" },
                { value: "reminder", label: "Reminder" },
                { value: "fee", label: "Fee" },
                { value: "attendance", label: "Attendance" },
              ]}
            />

            <Select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
              options={[
                { value: "", label: "All Status" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>

          <div className="mt-4">
            <Button onClick={() => fetchAllNotifications(filters)}>
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
        ) : notifications.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Bell}
              title="No notifications found"
              description="Create your first notification"
              action={
                <Button
                  onClick={() => {
                    setSelectedNotification(null);
                    setShowModal(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create Notification
                </Button>
              }
            />
          </CardContent>
        ) : (
          <Table>
            <thead className="bg-slate-50">
              <tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Send To</Th>
                <Th>Expiry</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {notifications.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <Td>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.message}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    <Badge variant="info">{item.notification_type}</Badge>
                  </Td>

                  <Td>
                    <Badge
                      variant={
                        item.status === "published"
                          ? "success"
                          : item.status === "draft"
                            ? "warning"
                            : "default"
                      }
                    >
                      {item.status}
                    </Badge>
                  </Td>

                  <Td>
                    {item.send_to_all
                      ? "All Users"
                      : item.target_roles?.join(", ")}
                  </Td>

                  <Td>{item.expiry_date || "-"}</Td>

                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-slate-400 hover:text-blue-600"
                        onClick={() => {
                          setSelectedNotification(item);
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

      <NotificationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onSave={async (data) => {
          let response;

          if (selectedNotification) {
            response = await updateNotification(selectedNotification.id, data);
          } else {
            response = await createNotification(data);
          }

          if (response.success) {
            setShowModal(false);
            setSelectedNotification(null);
            fetchAllNotifications(filters);
          }

          return response;
        }}
      />
    </div>
  );
}

function NotificationModal({ isOpen, onClose, notification, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notification_type: "announcement",
    target_roles: [],
    target_class_id: "",
    send_to_all: false,
    expiry_date: "",
    status: "published",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title || "",
        message: notification.message || "",
        notification_type: notification.notification_type || "announcement",
        target_roles: notification.target_roles || [],
        target_class_id: notification.target_class_id || "",
        send_to_all: notification.send_to_all || false,
        expiry_date: notification.expiry_date || "",
        status: notification.status || "published",
      });
    }
  }, [notification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRoleChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );

    setFormData({
      ...formData,
      target_roles: values,
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
      title={notification ? "Update Notification" : "Create Notification"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <Select
          label="Notification Type"
          name="notification_type"
          value={formData.notification_type}
          onChange={handleChange}
          options={[
            {
              value: "announcement",
              label: "Announcement",
            },
            { value: "event", label: "Event" },
            { value: "alert", label: "Alert" },
            { value: "reminder", label: "Reminder" },
            { value: "fee", label: "Fee" },
            { value: "attendance", label: "Attendance" },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Target Roles
          </label>

          <select
            multiple
            className="w-full border rounded-lg p-2"
            value={formData.target_roles}
            onChange={handleRoleChange}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <Input
          label="Target Class ID"
          name="target_class_id"
          type="number"
          value={formData.target_class_id}
          onChange={handleChange}
        />

        <Input
          label="Expiry Date"
          name="expiry_date"
          type="date"
          value={formData.expiry_date}
          onChange={handleChange}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ]}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="send_to_all"
            checked={formData.send_to_all}
            onChange={handleChange}
          />

          <label className="text-sm text-slate-700">Send To All Users</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : notification
                ? "Update Notification"
                : "Create Notification"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
