const bcrypt = require('bcrypt');
const db = require('../config/database');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    //Verificar se email já existe
    const [existingUsers] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?', 
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'Email já cadastrado',
        field: 'email'
      });
    }

    //Hash forte com salt de 12 rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    //Inserir usuário
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    //Log de auditoria (opcional)
    console.log(` Novo usuário cadastrado: ${email} (ID: ${result.insertId})`);

    //Retornar CSRF token atualizado
    res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso!',
      userId: result.insertId,
      csrfToken: res.locals.csrfToken
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ 
      error: 'Erro no servidor',
      message: 'Não foi possível completar o cadastro. Tente novamente.'
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //Buscar usuário
    const [users] = await db.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = ?', 
      [email]
    );

    //Timing attack protection - sempre executar bcrypt
    if (users.length === 0) {
      //Hash dummy para manter tempo de resposta constante
      await bcrypt.hash('dummy_password_for_timing', 12);
      return res.status(401).json({ 
        error: 'Email ou senha incorretos',
        message: 'Verifique suas credenciais e tente novamente.'
      });
    }

    const user = users[0];

    //Verificar senha
    const validPassword = await bcrypt.compare(password, user.senha);

    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos',
        message: 'Verifique suas credenciais e tente novamente.'
      });
    }

    // Log de auditoria (opcional)
    console.log(`✅ Login bem-sucedido: ${email} (ID: ${user.id})`);

    // Retornar dados do usuário SEM senha + CSRF token
    res.json({
      id: user.id,
      name: user.nome,
      email: user.email,
      csrfToken: res.locals.csrfToken,
      message: 'Login realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro no servidor',
      message: 'Não foi possível realizar o login. Tente novamente.'
    });
  }
};