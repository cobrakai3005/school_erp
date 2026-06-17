const { pool } = require("../config/database");

class InventoryItemModel {
  static async create(data, connection = pool) {
    const {
      item_code,
      item_name,
      category,
      quantity,
      unit,
      purchase_price,
      selling_price,
      supplier,
      location,
      min_stock_level,
      max_stock_level,
    } = data;

    const [result] = await connection.query(
      `
      INSERT INTO inventory_items (
        item_code,
        item_name,
        category,
        quantity,
        unit,
        purchase_price,
        selling_price,
        supplier,
        location,
        min_stock_level,
        max_stock_level
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        item_code,
        item_name,
        category,
        quantity || 0,
        unit,
        purchase_price,
        selling_price,
        supplier,
        location,
        min_stock_level || 0,
        max_stock_level,
      ],
    );

    return result.insertId;
  }

  static async findBySchool() {
    const [rows] = await pool.query(`
      SELECT * FROM inventory_items ORDER BY id DESC
    `);

    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM inventory_items WHERE id = ?`,
      [id],
    );
    return rows[0];
  }

  static async update(id, data, connection = pool) {
    const allowed = [
      "item_name",
      "category",
      "quantity",
      "unit",
      "purchase_price",
      "selling_price",
      "supplier",
      "location",
      "min_stock_level",
      "max_stock_level",
      "status",
    ];

    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (allowed.includes(key) && data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (!fields.length) return false;

    values.push(id);

    await connection.query(
      `
      UPDATE inventory_items
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values,
    );

    return true;
  }

  static async delete(id, connection = pool) {
    await connection.query(`DELETE FROM inventory_items WHERE id = ?`, [id]);
  }
}

module.exports = InventoryItemModel;
