// Role definitions and permissions
const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  ACCOUNTANT_FEE: "accountant_fee",
  ACCOUNTANT_SALARY: "accountant_salary",
  STUDENT: "student",
  PARENT: "parent",
  LIBRARIAN: "librarian",
  TRANSPORT_MANAGER: "transport_manager",
};

// Permission definitions for each role
const PERMISSIONS = {
  // Super Admin - can do everything
  [ROLES.SUPER_ADMIN]: {
    schools: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    system_settings: ["create", "read", "update", "delete"],
    all: true,
  },

  // School Admin - can manage their school
  [ROLES.ADMIN]: {
    users: ["create", "read", "update", "delete"],
    classes: ["create", "read", "update", "delete"],
    students: ["create", "read", "update", "delete"],
    teachers: ["create", "read", "update", "delete"],
    accountants: ["create", "read", "update", "delete"],
    fee_structures: ["create", "read", "update", "delete"],
    fee_payments: ["read"],
    attendance: ["read"],
    timetable: ["create", "read", "update", "delete"],
    homework: ["read"],
    study_materials: ["read"],
    inventory: ["create", "read", "update", "delete"],
    library: ["create", "read", "update", "delete"],
    transport: ["create", "read", "update", "delete"],
    salary: ["create", "read", "update", "delete"],
    leads: ["create", "read", "update", "delete"],
    notifications: ["create", "read", "update", "delete"],
    exams: ["create", "read", "update", "delete"],
    exam_results: ["create", "read", "update", "delete"],
    reports: ["read"],
  },

  // Teacher permissions
  [ROLES.TEACHER]: {
    classes: ["read"],
    students: ["read"],
    attendance: ["create", "read", "update"],
    timetable: ["read"],
    homework: ["create", "read", "update", "delete"],
    study_materials: ["create", "read", "update", "delete"],
    exams: ["read"],
    exam_results: ["create", "read", "update"],
    notifications: ["read"],
  },

  // Fee Accountant permissions
  [ROLES.ACCOUNTANT_FEE]: {
    students: ["read"],
    fee_structures: ["read"],
    classes: ["read"],
    fee_payments: ["create", "read", "update"],
    notifications: ["read"],
    reports: ["read"],
  },

  // Salary Accountant permissions
  [ROLES.ACCOUNTANT_SALARY]: {
    teachers: ["read"],
    staff_attendance: ["read"],
    
    salary: ["create", "read", "update"],
    notifications: ["read"],
    reports: ["read"],
  },

  // Student permissions
  [ROLES.STUDENT]: {
    attendance: ["read"],
    timetable: ["read"],
    homework: ["read"],
    homework_submissions: ["create", "read"],
    study_materials: ["read"],
    fee_payments: ["read"],
    fee_structures: ["read"],
    library: ["read"],
    exams: ["read"],
    exam_results: ["read"],
    notifications: ["read"],
  },

  // Parent permissions
  [ROLES.PARENT]: {
    students: ["read"],
    attendance: ["read"],
    fee_payments: ["read"],
    homework: ["read"],
    exams: ["read"],
    exam_results: ["read"],
    notifications: ["read"],
    transport: ["read"],
  },

  // Librarian permissions
  [ROLES.LIBRARIAN]: {
    library: ["create", "read", "update", "delete"],
    library_issues: ["create", "read", "update", "delete"],
    students: ["read"],
    notifications: ["read"],
  },

  // Transport Manager permissions
  [ROLES.TRANSPORT_MANAGER]: {
    transport: ["create", "read", "update", "delete"],
    transport_students: ["create", "read", "update", "delete"],
    students: ["read"],
    notifications: ["read"],
  },
};

// Check if a role has permission for a resource and action
const hasPermission = (role, resource, action) => {
  const rolePermissions = PERMISSIONS[role];

  if (!rolePermissions) {
    return false;
  }

  // Super admin has all permissions
  if (rolePermissions.all) {
    return true;
  }

  const resourcePermissions = rolePermissions[resource];

  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(action);
};

module.exports = { ROLES, PERMISSIONS, hasPermission };
