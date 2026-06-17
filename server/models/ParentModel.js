const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
class ParentModel {
  // Create User first, then Parent (Transaction)
  static async create(userData, parentData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const hash = await bcrypt.hash(userData.password, 10);
      // 1. Insert into Users table
      const [userResult] = await connection.execute(
        `INSERT INTO users (school_id, user_type, username, email, password, full_name, phone, address, profile_image) 
                 VALUES (?, 'parent', ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.school_id,
          userData.username,
          userData.email,
          hash,
          userData.full_name,
          userData.phone,
          userData.address,
          userData.profile_image || null,
        ],
      );

      const userId = userResult.insertId;

      // 2. Insert into Parents table
      console.table([
        userId,
        parentData.student_id,
        parentData.relationship,
        parentData.is_primary || false,
      ]);

      const [parentResult] = await connection.execute(
        `INSERT INTO parents (user_id, student_id, relationship, is_primary) 
                 VALUES (?, ?, ?, ?)`,
        [
          userId,
          parentData.student_id,
          parentData.relationship,
          parentData.is_primary || false,
        ],
      );

      await connection.commit();
      return { userId, parentId: parentResult.insertId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll(schoolId) {
    const query = `
            SELECT p.*, u.full_name, u.email, u.phone, u.status, s.full_name as student_name 
            FROM parents p
            JOIN users u ON p.user_id = u.id
            JOIN users s ON p.student_id = s.id
            WHERE u.school_id = ? AND p.is_deleted = FALSE`;
    const [rows] = await pool.execute(query, [schoolId]);
    return rows;
  }

  static async findById(id) {
    const query = `
            SELECT p.*, u.full_name, u.email, u.phone, u.address, u.status 
            FROM parents p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ? AND p.is_deleted = FALSE`;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }


  static async update(parentId, data, currentUser) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        username,
        email,
        password,
        full_name,
        phone,
        address,
        relationship,
        occupation,
        annual_income,
        education,
        status,
        profile_image,
      } = data;

      // Fetch parent first
      const [parentRows] = await connection.query(
        `
      SELECT *
      FROM parents
      WHERE id = ?
      `,
        [parentId],
      );

      if (parentRows.length === 0) {
        throw {
          statusCode: 404,
          message: "Parent not found",
        };
      }

      const parent = parentRows[0];

      // Check duplicate email
      if (email) {
        const [existingEmail] = await connection.query(
          `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
        `,
          [email, parent.user_id],
        );

        if (existingEmail.length > 0) {
          throw {
            statusCode: 400,
            message: "Email already exists",
          };
        }
      }

      // Check duplicate username
      if (username) {
        const [existingUsername] = await connection.query(
          `
        SELECT id
        FROM users
        WHERE username = ?
        AND school_id = ?
        AND id != ?
        `,
          [username, currentUser.school_id, parent.user_id],
        );

        if (existingUsername.length > 0) {
          throw {
            statusCode: 400,
            message: "Username already exists",
          };
        }
      }

      // Build dynamic user update
      const userFields = [];
      const userValues = [];

      if (username !== undefined) {
        userFields.push("username = ?");
        userValues.push(username);
      }

      if (email !== undefined) {
        userFields.push("email = ?");
        userValues.push(email);
      }

      if (full_name !== undefined) {
        userFields.push("full_name = ?");
        userValues.push(full_name);
      }

      if (phone !== undefined) {
        userFields.push("phone = ?");
        userValues.push(phone);
      }

      if (address !== undefined) {
        userFields.push("address = ?");
        userValues.push(address);
      }

      if (status !== undefined) {
        userFields.push("status = ?");
        userValues.push(status);
      }
      if (profile_image !== undefined) {
        userFields.push("profile_image = ?");
        userValues.push(profile_image);
      }

      // Password update
      // if (password) {
      //   const hashedPassword = await bcrypt.hash(password, 10);
      //   userFields.push("password = ?");
      //   userValues.push(hashedPassword);
      // }

      // Update users table
      if (userFields.length > 0) {
        userValues.push(parent.user_id);

        await connection.query(
          `
        UPDATE users
        SET ${userFields.join(", ")}
        WHERE id = ?
        `,
          userValues,
        );
      }

      // Build dynamic parent update
      const parentFields = [];
      const parentValues = [];

      if (relationship !== undefined) {
        parentFields.push("relationship = ?");
        parentValues.push(relationship);
      }

      if (occupation !== undefined) {
        parentFields.push("occupation = ?");
        parentValues.push(occupation);
      }

      if (annual_income !== undefined) {
        parentFields.push("annual_income = ?");
        parentValues.push(annual_income);
      }

      if (education !== undefined) {
        parentFields.push("education = ?");
        parentValues.push(education);
      }

      if (status !== undefined) {
        parentFields.push("status = ?");
        parentValues.push(status);
      }

      // Update parents table
      if (parentFields.length > 0) {
        parentValues.push(parentId);

        await connection.query(
          `
        UPDATE parents
        SET ${parentFields.join(", ")}
        WHERE id = ?
        `,
          parentValues,
        );
      }

      await connection.commit();

      // Fetch updated parent
      const [updatedParent] = await connection.query(
        `
      SELECT
        p.*,
        u.username,
        u.email,
        u.full_name,
        u.phone,
        u.address,
        u.profile_image,
        u.status as user_status
      FROM parents p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      `,
        [parentId],
      );

      return updatedParent[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const query = `UPDATE parents SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?`;
    return await pool.execute(query, [id]);
  }
}

module.exports = ParentModel;
