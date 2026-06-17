const { pool } = require("../config/database");

class InventoryTransactionModel {
  static async create(data, connection = pool) {
    const {
      item_id,
      transaction_type,
      quantity,
      transaction_date,
      student_id,
      staff_id,
      remarks,
      created_by,
    } = data;

    const [result] = await connection.query(
      `
      INSERT INTO inventory_transactions (
        item_id,
        transaction_type,
        quantity,
        transaction_date,
        student_id,
        staff_id,
        remarks,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        item_id,
        transaction_type,
        quantity,
        transaction_date,
        student_id,
        staff_id,
        remarks,
        created_by,
      ],
    );

    return result.insertId;
  }

  static async findByItem(item_id) {
    const [rows] = await pool.query(
      `
      SELECT * FROM inventory_transactions
      WHERE item_id = ?
      ORDER BY id DESC
      `,
      [item_id],
    );

    return rows;
  }
}

module.exports = InventoryTransactionModel;
