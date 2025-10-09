const db = require('../config/database');

exports.createTransaction = async (req, res) => {
  const { userId, type, description, amount, date, category } = req.body;
  const receipt = req.file ? req.file.filename : null;

  try {
    const [result] = await db.query(
      'INSERT INTO transacoes (usuario_id, tipo, descricao, valor, categoria, data, cupom_fiscal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, type, description, amount, category, date, receipt]
    );

    res.status(201).json({
      message: 'Transação adicionada com sucesso!',
      transactionId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    res.status(500).json({ error: 'Erro ao adicionar transação' });
  }
};

exports.getTransactions = async (req, res) => {
  const { userId } = req.params;

  try {
    const [results] = await db.query(
      'SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY data DESC, id DESC',
      [userId]
    );

    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM transacoes WHERE id = ?', 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
};

exports.getStats = async (req, res) => {
  const { userId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
      FROM transacoes 
      WHERE usuario_id = ?`,
      [userId]
    );

    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};