-- =====================================================
-- SCHOOL ERP DATABASE SETUP SCRIPT
-- Run this script in MySQL to create the database and tables
-- =====================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS school_erp;
USE school_erp;

-- =====================================================
-- MASTER DATABASE - Super Admin Level
-- =====================================================

-- Table: schools
CREATE TABLE IF NOT EXISTS schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_code VARCHAR(20) UNIQUE NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    logo VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    subscription_plan ENUM('basic', 'standard', 'premium') DEFAULT 'standard',
    subscription_expiry DATE,
    database_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: super_admin_users
CREATE TABLE IF NOT EXISTS super_admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('super_admin', 'admin', 'support') DEFAULT 'super_admin',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: system_settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json', 'file') DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- SCHOOL DATABASE - Multi-tenant tables with school_id
-- =====================================================

-- Table: users (unified user table for all roles)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    user_type ENUM('admin', 'teacher', 'accountant_fee', 'accountant_salary', 'student', 'parent', 'librarian', 'transport_manager') NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_username_school (username, school_id),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Table: school_admins
CREATE TABLE IF NOT EXISTS school_admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    user_id INT NOT NULL,
    designation VARCHAR(100),
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_school_admin (school_id, user_id),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: classes
CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    class_code VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20),
    class_teacher_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Table: staff_teachers
CREATE TABLE IF NOT EXISTS staff_teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    qualification TEXT,
    experience_years INT,
    specialization VARCHAR(100),
    joining_date DATE,
    class_teacher_of INT,
    subjects TEXT,
    status ENUM('active', 'inactive', 'resigned') DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add foreign key for class_teacher_id after staff_teachers is created
ALTER TABLE classes ADD FOREIGN KEY (class_teacher_id) REFERENCES staff_teachers(id) ON DELETE SET NULL;

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    roll_no VARCHAR(20),
    user_id INT NOT NULL,
    class_id INT,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    blood_group VARCHAR(5),
    religion VARCHAR(50),
    caste VARCHAR(50),
    nationality VARCHAR(50),
    mother_tongue VARCHAR(50),
    aadhar_number VARCHAR(20) UNIQUE NOT NULL,
    admission_date DATE,
    previous_school TEXT,
    medical_info TEXT,
    transport_route_id INT,
    hostel_id INT,
    status ENUM('active', 'inactive', 'passed_out', 'transferred') DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Table: staff_accountants
CREATE TABLE IF NOT EXISTS staff_accountants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    designation VARCHAR(100),
    type ENUM('accountant_fee', 'accountant_salary', 'accountant_both') DEFAULT 'accountant_both',
    joining_date DATE,
    salary DECIMAL(12,2),
    status ENUM('active', 'inactive', 'resigned') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: parents
CREATE TABLE IF NOT EXISTS parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship ENUM('father', 'mother', 'guardian') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table: fee_structures
CREATE TABLE IF NOT EXISTS fee_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    frequency ENUM('monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time') DEFAULT 'monthly',
    due_day INT DEFAULT 10,
    academic_year VARCHAR(9),
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);



-- Table: fee_payments
CREATE TABLE IF NOT EXISTS fee_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode ENUM('cash', 'cheque', 'online', 'bank_transfer', 'card') NOT NULL,
    transaction_id VARCHAR(100),
    cheque_no VARCHAR(50),
    bank_name VARCHAR(100),
    notes TEXT,
    collected_by INT,
    status ENUM('pending', 'confirmed', 'failed', 'refunded') DEFAULT 'confirmed',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: attendance
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half_day', 'holiday') NOT NULL,
    remarks TEXT,
    marked_by INT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, attendance_date)
);

-- Table: staff_attendance
CREATE TABLE IF NOT EXISTS staff_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'absent', 'late', 'half_day', 'leave') NOT NULL,
    leave_type ENUM('sick', 'casual', 'earned', 'unpaid') NULL,
    remarks TEXT,
    marked_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_attendance (user_id, attendance_date)
);

-- Table: timetable
CREATE TABLE IF NOT EXISTS timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100),
    teacher_id INT,
    room_no VARCHAR(20),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES staff_teachers(id) ON DELETE SET NULL
);

-- Table: homework_assignments
CREATE TABLE IF NOT EXISTS homework_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    attachment VARCHAR(255),
    given_date DATE NOT NULL,
    submission_date DATE NOT NULL,
    teacher_id INT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES staff_teachers(id) ON DELETE CASCADE
);

-- Table: homework_submissions
CREATE TABLE IF NOT EXISTS homework_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    homework_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_date DATE NOT NULL,
    attachment VARCHAR(255),
    remarks TEXT,
    marks INT,
    feedback TEXT,
    FOREIGN KEY (homework_id) REFERENCES homework_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table: study_materials
CREATE TABLE IF NOT EXISTS study_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT,
    subject VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    file_type ENUM('pdf', 'video', 'document', 'image', 'other') DEFAULT 'pdf',
    uploaded_by INT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: library_books
CREATE TABLE IF NOT EXISTS library_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_code VARCHAR(50) UNIQUE NOT NULL,
    isbn VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(200),
    publisher VARCHAR(200),
    edition VARCHAR(50),
    year_of_publication YEAR,
    category VARCHAR(100),
    rack_no VARCHAR(20),
    quantity INT DEFAULT 1,
    available_quantity INT DEFAULT 1,
    status ENUM('available', 'issued', 'damaged', 'lost') DEFAULT 'available'
);

ALTER TABLE library_books
ADD COLUMN school_id INT NOT NULL;
ALTER TABLE library_books
ADD CONSTRAINT fk_library_books_school
FOREIGN KEY (school_id)
REFERENCES schools(id)
ON DELETE CASCADE;

-- Table: library_issues
CREATE TABLE IF NOT EXISTS library_issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    status ENUM('issued', 'returned', 'overdue', 'lost') DEFAULT 'issued',
    issued_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: transport_manager

CREATE TABLE transport_managers (
    -- Primary Key
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Employee Details
    employee_id VARCHAR(50) NOT NULL UNIQUE,

    -- Linked User Account
    user_id INT NOT NULL,

    -- Professional Information
    designation VARCHAR(100) DEFAULT 'Transport Manager',
    department VARCHAR(100) DEFAULT 'Transport Department',

    qualification VARCHAR(255),
    experience_years INT DEFAULT 0,

    -- Contact / Responsibility
    emergency_contact VARCHAR(20),

    -- Joining Information
    joining_date DATE,

    -- Status
    status ENUM(
        'active',
        'inactive',
        'on_leave'
    ) DEFAULT 'active',

    -- Soft Delete
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Key
    CONSTRAINT fk_transport_manager_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
-- Table: transport_routes
CREATE TABLE IF NOT EXISTS transport_routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(20) UNIQUE NOT NULL,
    vehicle_no VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    conductor_name VARCHAR(100),
    pickup_points TEXT,
    fare_amount DECIMAL(10,2),
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Table: transport_students
CREATE TABLE IF NOT EXISTS transport_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    route_id INT NOT NULL,
    pickup_point VARCHAR(200),
    drop_point VARCHAR(200),
    pickup_time TIME,
    drop_time TIME,
    status ENUM('active', 'inactive', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
);

-- Table: salary_records
CREATE TABLE IF NOT EXISTS salary_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    staff_type ENUM('teacher', 'accountant', 'other') NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(12,2),
    allowances DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2),
    advance_deduction DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_date DATE,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    remarks TEXT,
    generated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_salary (staff_id, month, year)
);

-- Table: exams
CREATE TABLE IF NOT EXISTS exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_name VARCHAR(100) NOT NULL,
    exam_type ENUM('quarterly', 'half_yearly', 'annual', 'unit_test', 'preliminary') NOT NULL,
    class_id INT NOT NULL,
    academic_year VARCHAR(9),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 35,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Table: exam_results
CREATE TABLE IF NOT EXISTS exam_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    marks_obtained INT NOT NULL,
    total_marks INT,
    percentage DECIMAL(5,2),
    grade VARCHAR(2),
    remarks TEXT,
    entered_by INT,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (exam_id, student_id, subject)
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('announcement', 'event', 'alert', 'reminder', 'fee', 'attendance') DEFAULT 'announcement',
    target_roles JSON,
    target_class_id INT,
    send_to_all BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    FOREIGN KEY (target_class_id) REFERENCES classes(id) ON DELETE SET NULL
);

ALTER TABLE notifications
ADD COLUMN school_id INT NULL;


ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_school
FOREIGN KEY (school_id)
REFERENCES schools(id)
ON DELETE CASCADE;

-- Table: notification_reads
CREATE TABLE IF NOT EXISTS notification_reads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX idx_fee_payments_date ON fee_payments(payment_date);
CREATE INDEX idx_salary_month_year ON salary_records(month, year);
CREATE INDEX idx_exams_class ON exams(class_id);

-- =====================================================
-- INSERT DEFAULT SUPER ADMIN
-- Password: admin123 (hashed with bcrypt)
-- =====================================================

INSERT INTO super_admin_users (username, email, password, full_name, role, status)
VALUES (
    'superadmin',
    'admin@schoolerp.com',
    '$2a$10$rXJQmVJ7VqzCJQ8bG5QGiOKLHKMQhBqmXJGwBRLnGw7.VqMlKbMeS',
    'Super Administrator',
    'super_admin',
    'active'
) ON DUPLICATE KEY UPDATE username = username;

SELECT 'Database setup completed successfully!' AS message;


CREATE TABLE librarians (
    -- Unique internal identifier
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Official school identifier (e.g., LIB-2023-001)
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Foreign key to the users/auth table
    user_id BIGINT NOT NULL,
    
    -- Professional Details
    designation VARCHAR(100) DEFAULT 'Librarian',
    department VARCHAR(100) DEFAULT 'Library Media Center',
    qualification VARCHAR(255),
    experience_years INT DEFAULT 0,
    specialization VARCHAR(255), -- e.g., Digital Archiving, Cataloging
    
    -- Employment info
    joining_date DATE,

    
    -- Record Status
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Audit Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Key Constraint (Assuming a 'users' table exists)
    CONSTRAINT fk_librarian_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
