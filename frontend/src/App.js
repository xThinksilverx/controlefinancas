import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, FileText, LogOut, User, Mail, Lock, Eye, EyeOff, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// ✅ Gerenciador de CSRF Token
let csrfToken = null;
const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);

const getCsrfToken = async () => {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      headers: { 'X-Session-Id': sessionId }
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Erro ao obter CSRF token:', error);
    return null;
  }
};

// ✅ Wrapper para fetch com CSRF
const apiRequest = async (endpoint, options = {}) => {
  if (!csrfToken) await getCsrfToken();

  const headers = {
    'X-Session-Id': sessionId,
    'X-CSRF-Token': csrfToken,
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Atualizar token após cada requisição
  if (response.headers.get('X-CSRF-Token')) {
    csrfToken = response.headers.get('X-CSRF-Token');
  }

  return response;
};

const HomePage = ({ setPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <DollarSign className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Controle de finanças</h1>
        <p className="text-gray-600">Controle suas finanças de forma simples</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => setPage('login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Entrar
        </button>
        
        <button
          onClick={() => setPage('register')}
          className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
        >
          Criar Conta
        </button>
      </div>
    </div>
  </div>
);

const LoginPage = ({ setPage, loginForm, setLoginForm, handleLogin, loading, showPassword, setShowPassword }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
      
      <button
        onClick={() => setPage('home')}
        className="w-full mt-4 text-gray-600 hover:text-gray-800"
      >
        Voltar
      </button>
    </div>
  </div>
);

const RegisterPage = ({ setPage, registerForm, setRegisterForm, handleRegister, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Criar Conta</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Nome</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Seu nome completo"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Confirmar Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </div>
      
      <button
        onClick={() => setPage('home')}
        className="w-full mt-4 text-gray-600 hover:text-gray-800"
      >
        Voltar
      </button>
    </div>
  </div>
);

const DashboardPage = ({ 
  user, 
  stats, 
  transactions, 
  transactionForm, 
  setTransactionForm, 
  handleAddTransaction, 
  handleDeleteTransaction,
  handleLogout,
  loading,
  categories 
}) => (
  <div className="min-h-screen bg-gray-100">
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Controle de finanças</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Olá, {user.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </nav>

    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Saldo Total</span>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${(Number(stats.saldo) || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {(Number(stats.saldo) || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Receitas</span>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">R$ {(Number(stats.total_receitas) || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Despesas</span>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">R$ {(Number(stats.total_despesas) || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Nova Transação
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Tipo</label>
              <select
                value={transactionForm.type}
                onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value, category: ''})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Descrição</label>
              <input
                type="text"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Salário mensal"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Categoria</label>
              <select
                value={transactionForm.category}
                onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories[transactionForm.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Data</label>
              <input
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Cupom Fiscal (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setTransactionForm({...transactionForm, receipt: e.target.files[0]})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleAddTransaction}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Adicionando...' : 'Adicionar Transação'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Histórico de Transações
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma transação registrada</p>
            ) : (
              transactions.map(t => (
                <div
                  key={t.id}
                  className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{t.descricao}</p>
                      <p className="text-sm text-gray-600">{t.categoria}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(t.data).toLocaleDateString('pt-BR')}</span>
                    {t.cupom_fiscal && (
                      <a
                        href={`http://localhost:3001/uploads/${t.cupom_fiscal}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Cupom
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FinanceSystem = () => {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_receitas: 0, total_despesas: 0, saldo: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [transactionForm, setTransactionForm] = useState({
    type: 'receita',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    receipt: null
  });

  const categories = {
    receita: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
    despesa: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']
  };

  // ✅ Obter token CSRF ao carregar
  useEffect(() => {
    getCsrfToken();
  }, []);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadStats();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      const response = await apiRequest(`/transactions/${user.id}`, { method: 'GET' });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiRequest(`/stats/${user.id}`, { method: 'GET' });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      alert('Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        setPage('dashboard');
        setLoginForm({ email: '', password: '' });
      } else {
        alert(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      alert('Preencha todos os campos!');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        setPage('login');
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        alert(data.error || 'Erro ao cadastrar');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
    setLoading(false);
  };

  const handleAddTransaction = async () => {
    if (!transactionForm.description || !transactionForm.amount || !transactionForm.category) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('type', transactionForm.type);
      formData.append('description', transactionForm.description);
      formData.append('amount', transactionForm.amount);
      formData.append('date', transactionForm.date);
      formData.append('category', transactionForm.category);
      
      if (transactionForm.receipt) {
        formData.append('receipt', transactionForm.receipt);
      }

      const response = await apiRequest('/transactions', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Transação adicionada com sucesso!');
        setTransactionForm({
          type: 'receita',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          receipt: null
        });
        loadTransactions();
        loadStats();
      } else {
        alert('Erro ao adicionar transação');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
    setLoading(false);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta transação?')) return;

    try {
      const response = await apiRequest(`/transactions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Transação excluída com sucesso!');
        loadTransactions();
        loadStats();
      } else {
        alert('Erro ao excluir transação');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTransactions([]);
    setStats({ total_receitas: 0, total_despesas: 0, saldo: 0 });
    setPage('home');
  };

  return (
    <>
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'login' && (
        <LoginPage 
          setPage={setPage}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          loading={loading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      )}
      {page === 'register' && (
        <RegisterPage 
          setPage={setPage}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          handleRegister={handleRegister}
          loading={loading}
        />
      )}
      {page === 'dashboard' && (
        <DashboardPage 
          user={user}
          stats={stats}
          transactions={transactions}
          transactionForm={transactionForm}
          setTransactionForm={setTransactionForm}
          handleAddTransaction={handleAddTransaction}
          handleDeleteTransaction={handleDeleteTransaction}
          handleLogout={handleLogout}
          loading={loading}
          categories={categories}
        />
      )}
    </>
  );
};

export default FinanceSystem;