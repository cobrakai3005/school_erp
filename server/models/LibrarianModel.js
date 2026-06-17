const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
class LibrarianModel {
  // Create
  static async create(data) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      console.log(data);

      // HASH PASSWORD

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // BUILD DYNAMIC USER INSERT

      const userData = {
        school_id: data.school_id,
        user_type: "librarian",
        username: data.username,
        email: data.email,
        password: hashedPassword,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        profile_image: data.profile_image,
        status: data.status || "active",
      };

      // Remove undefined/null/empty values
      Object.keys(userData).forEach((key) => {
        if (
          userData[key] === undefined ||
          userData[key] === null ||
          userData[key] === ""
        ) {
          delete userData[key];
        }
      });

      const userFields = Object.keys(userData);
      const userPlaceholders = userFields.map(() => "?").join(", ");
      const userValues = Object.values(userData);

      // Insert user
      const [userResult] = await connection.query(
        `
      INSERT INTO users (
        ${userFields.join(", ")}
      )
      VALUES (${userPlaceholders})
      `,
        userValues,
      );

      const userId = userResult.insertId;

      // BUILD DYNAMIC LIBRARIAN INSERT

      const librarianData = {
        employee_id: data.employee_id,
        user_id: userId,
        designation: data.designation,
        department: data.department,
        qualification: data.qualification,
        experience_years: data.experience_years,
        specialization: data.specialization,
        joining_date: data.joining_date,
        status: data.status || "active",
      };

      // Remove undefined/null/empty values
      Object.keys(librarianData).forEach((key) => {
        if (
          librarianData[key] === undefined ||
          librarianData[key] === null ||
          librarianData[key] === ""
        ) {
          delete librarianData[key];
        }
      });

      const librarianFields = Object.keys(librarianData);

      const librarianPlaceholders = librarianFields.map(() => "?").join(", ");

      const librarianValues = Object.values(librarianData);

      // Insert librarian
      const [librarianResult] = await connection.query(
        `
      INSERT INTO librarians (
        ${librarianFields.join(", ")}
      )
      VALUES (${librarianPlaceholders})
      `,
        librarianValues,
      );

      await connection.commit();

      return {
        id: librarianResult.insertId,
        user_id: userId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get All With Pagination + Search
  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM librarians l
      JOIN users u ON l.user_id = u.id
      WHERE u.school_id = ?
      AND l.is_deleted = FALSE
    `;

    const params = [schoolId];

    if (filters.status) {
      baseQuery += " AND l.status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      baseQuery += `
        AND (
          u.full_name LIKE ?
          OR u.email LIKE ?
          OR l.employee_id LIKE ?
        )
      `;

      const search = `%${filters.search}%`;

      params.push(search, search, search);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      ${baseQuery}
    `;

    const dataQuery = `
      SELECT
        l.*,
        u.full_name,
        u.email,
        u.phone,
        u.address,
        u.profile_image,
        u.user_type
      ${baseQuery}
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
    `;

    const [countResult] = await pool.query(countQuery, params);

    const [rows] = await pool.query(dataQuery, [...params, limit, offset]);

    const total = countResult[0].total;

    return {
      librarians: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // Find By ID
  static async findById(id) {
    const query = `
      SELECT
        l.*,
        u.full_name,
        u.email,
        u.phone,
        u.address,
        u.profile_image,
        u.status as user_status
      FROM librarians l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
      AND l.is_deleted = FALSE
    `;

    const [rows] = await pool.query(query, [id]);

    return rows[0];
  }

  // Update
  static async update(librarianId, data, currentUser) {
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
        designation,
        department,
        qualification,
        experience_years,
        specialization,
        joining_date,
        status,
        profile_image,
      } = data;

      // Find librarian
      const librarian = await LibrarianModel.findById(librarianId);

      if (!librarian) {
        throw {
          statusCode: 404,
          message: "Librarian not found",
        };
      }

      // Check duplicate email
      if (email) {
        const [existingEmail] = await connection.query(
          `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
        `,
          [email, librarian.user_id],
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
          [username, currentUser.school_id, librarian.user_id],
        );

        if (existingUsername.length > 0) {
          throw {
            statusCode: 400,
            message: "Username already exists",
          };
        }
      }

      // OLD IMAGE HANDLING

      let oldImagePath = null;

      if (profile_image) {
        const [userData] = await connection.query(
          `
        SELECT profile_image
        FROM users
        WHERE id = ?
        `,
          [librarian.user_id],
        );

        if (userData.length > 0 && userData[0].profile_image) {
          const oldFileName = userData[0].profile_image.split("/uploads/")[1];

          oldImagePath = path.join(__dirname, "../uploads", oldFileName);
        }
      }

      // BUILD USER UPDATE

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

      // Profile image update
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
        userValues.push(librarian.user_id);

        await connection.query(
          `
        UPDATE users
        SET ${userFields.join(", ")}
        WHERE id = ?
        `,
          userValues,
        );
      }

      // BUILD LIBRARIAN UPDATE

      const librarianFields = [];
      const librarianValues = [];

      if (designation !== undefined) {
        librarianFields.push("designation = ?");
        librarianValues.push(designation);
      }

      if (department !== undefined) {
        librarianFields.push("department = ?");
        librarianValues.push(department);
      }

      if (qualification !== undefined) {
        librarianFields.push("qualification = ?");
        librarianValues.push(qualification);
      }

      if (experience_years !== undefined) {
        librarianFields.push("experience_years = ?");
        librarianValues.push(experience_years);
      }

      if (specialization !== undefined) {
        librarianFields.push("specialization = ?");
        librarianValues.push(specialization);
      }

      if (joining_date !== undefined) {
        librarianFields.push("joining_date = ?");
        librarianValues.push(joining_date);
      }

      if (status !== undefined) {
        librarianFields.push("status = ?");
        librarianValues.push(status);
      }

      // Update librarians table
      if (librarianFields.length > 0) {
        librarianValues.push(librarianId);

        await connection.query(
          `
        UPDATE librarians
        SET ${librarianFields.join(", ")}
        WHERE id = ?
        `,
          librarianValues,
        );
      }

      await connection.commit();

      // Delete old image AFTER commit
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Old image deleted");
      }

      // Fetch updated librarian
      const [updatedLibrarian] = await connection.query(
        `
      SELECT
        l.*,
        u.username,
        u.email,
        u.full_name,
        u.phone,
        u.address,
        u.profile_image,
        u.status as user_status
      FROM librarians l
      INNER JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
      `,
        [librarianId],
      );

      return updatedLibrarian[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  // Soft Delete
  static async delete(id) {
    await pool.query(
      `
      UPDATE librarians
      SET is_deleted = TRUE
      WHERE id = ?
    `,
      [id],
    );
  }
}

module.exports = LibrarianModel;
