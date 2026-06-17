-- =====================================================
-- SCHOOL ERP DATABASE MIGRATIONS
-- Additional tables and modifications
-- Run this after setup.sql
-- =====================================================

USE school_erp;

-- =====================================================
-- STATUS ENUM FOR HOMEWORK SUBMISSIONS
-- =====================================================

-- Add status column to homework_submissions if not exists
ALTER TABLE homework_submissions 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'submitted', 'graded', 'late') DEFAULT 'submitted';

-- Add graded_by and graded_at columns to homework_submissions
ALTER TABLE homework_submissions 
ADD COLUMN IF NOT EXISTS graded_by INT NULL,
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP NULL;

-- =====================================================
-- STUDY MATERIALS ENHANCEMENTS
-- =====================================================

-- Add school_id to study_materials if not exists
ALTER TABLE study_materials 
ADD COLUMN IF NOT EXISTS school_id INT NULL AFTER id;

-- =====================================================
-- NOTIFICATIONS ENHANCEMENTS
-- =====================================================

-- Add school_id to notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS school_id INT NULL AFTER id;

-- =====================================================
-- TRANSPORT ENHANCEMENTS
-- =====================================================

-- Add school_id to transport_routes
ALTER TABLE transport_routes 
ADD COLUMN IF NOT EXISTS school_id INT NULL AFTER id;

-- =====================================================
-- LIBRARY ENHANCEMENTS
-- =====================================================

-- Add school_id to library_books
ALTER TABLE library_books 
ADD COLUMN IF NOT EXISTS school_id INT NULL AFTER id;

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_homework_submissions_status ON homework_submissions(status);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student ON homework_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_school ON study_materials(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_school ON notifications(school_id);

SELECT 'Migrations completed successfully!' AS message;
