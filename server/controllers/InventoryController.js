const { pool } = require("../config/database");
const InventoryItemModel = require("../models/InventoryItemModel");
const InventoryTransactionModel = require("../models/InventoryTransactionModel");

class InventoryController {
  // CREATE ITEM
  static async createItem(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const data = req.body;

      const id = await InventoryItemModel.create(data, connection);

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Item created successfully",
        data: { id },
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // GET ALL ITEMS
  static async getAllItems(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        status,
        supplier,
        location,
      } = req.query;

      const offset = (page - 1) * limit;

      let query = `
      SELECT * FROM inventory_items
      WHERE 1=1
    `;

      const params = [];

      // 🔍 SEARCH
      if (search) {
        query += `
        AND (
          item_name LIKE ?
          OR item_code LIKE ?
          OR supplier LIKE ?
        )
      `;
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      // 📦 CATEGORY FILTER
      if (category) {
        query += ` AND category = ? `;
        params.push(category);
      }

      // 📊 STATUS FILTER
      if (status) {
        query += ` AND status = ? `;
        params.push(status);
      }

      // 🏭 SUPPLIER FILTER
      if (supplier) {
        query += ` AND supplier LIKE ? `;
        params.push(`%${supplier}%`);
      }

      // 📍 LOCATION FILTER
      if (location) {
        query += ` AND location LIKE ? `;
        params.push(`%${location}%`);
      }

      // 📊 COUNT QUERY
      const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");

      const [countResult] = await pool.query(countQuery, params);

      // 📄 PAGINATION
      query += ` ORDER BY id DESC LIMIT ? OFFSET ? `;
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          items: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / limit),
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // UPDATE ITEM
  static async updateItem(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const data = req.body;

      await InventoryItemModel.update(id, data, connection);

      await connection.commit();

      res.json({
        success: true,
        message: "Item updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // DELETE ITEM
  static async deleteItem(req, res) {
    try {
      const { id } = req.params;

      await InventoryItemModel.delete(id);

      res.json({
        success: true,
        message: "Item deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ADD TRANSACTION + AUTO STOCK UPDATE
  static async addTransaction(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const data = req.body;
      const created_by = req.user.id;

      const item = await InventoryItemModel.findById(data.item_id);

      if (!item) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      // Update stock logic
      let newQty = item.quantity;

      if (data.transaction_type === "purchase") {
        newQty += data.quantity;
      } else if (data.transaction_type === "issue") {
        newQty -= data.quantity;
      } else if (data.transaction_type === "return") {
        newQty += data.quantity;
      } else if (data.transaction_type === "damage") {
        newQty -= data.quantity;
      }

      await InventoryItemModel.update(
        data.item_id,
        { quantity: newQty },
        connection,
      );

      // Update status
      let status = "in_stock";
      if (newQty <= 0) status = "out_of_stock";
      else if (newQty <= item.min_stock_level) status = "low_stock";

      await InventoryItemModel.update(data.item_id, { status }, connection);

      // Create transaction
      await InventoryTransactionModel.create(
        { ...data, created_by },
        connection,
      );

      await connection.commit();

      res.json({
        success: true,
        message: "Transaction added successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // GET ITEM TRANSACTIONS
  static async getTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        item_id,
        transaction_type,
        student_id,
        staff_id,
        from_date,
        to_date,
      } = req.query;

      const offset = (page - 1) * limit;

      let query = `
      SELECT it.*, ii.item_name, ii.item_code
      FROM inventory_transactions it
      JOIN inventory_items ii ON it.item_id = ii.id
      WHERE 1=1
    `;

      const params = [];

      // 📦 FILTER: ITEM
      if (item_id) {
        query += ` AND it.item_id = ? `;
        params.push(item_id);
      }

      // 🔄 FILTER: TYPE
      if (transaction_type) {
        query += ` AND it.transaction_type = ? `;
        params.push(transaction_type);
      }

      // 👨‍🎓 FILTER: STUDENT
      if (student_id) {
        query += ` AND it.student_id = ? `;
        params.push(student_id);
      }

      // 👨‍💼 FILTER: STAFF
      if (staff_id) {
        query += ` AND it.staff_id = ? `;
        params.push(staff_id);
      }

      // 📅 DATE RANGE
      if (from_date && to_date) {
        query += ` AND it.transaction_date BETWEEN ? AND ? `;
        params.push(from_date, to_date);
      }

      // 🔍 SEARCH
      if (search) {
        query += `
        AND (
          ii.item_name LIKE ?
          OR ii.item_code LIKE ?
          OR it.remarks LIKE ?
        )
      `;
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      // 📊 COUNT QUERY
      const countQuery = query.replace(
        "SELECT it.*, ii.item_name, ii.item_code",
        "SELECT COUNT(*) as total",
      );

      const [countResult] = await pool.query(countQuery, params);

      // 📄 PAGINATION
      query += ` ORDER BY it.id DESC LIMIT ? OFFSET ? `;
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          transactions: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / limit),
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = InventoryController;
