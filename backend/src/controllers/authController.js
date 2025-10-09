const bcrypt = require('bcrypt');
const db = require('../config/database');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existingUsers] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?', 
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso!',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      // Usar bcrypt mesmo quando usuário não existe (previne timing attacks)
      await bcrypt.hash('dummy', 12);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];

    const validPassword = await bcrypt.compare(password, user.senha);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Retornar dados do usuário (sem senha)
    res.json({
      id: user.id,
      name: user.nome,
      email: user.email
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};