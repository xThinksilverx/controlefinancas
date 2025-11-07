const API_URL = 'http://localhost:3001/api';

// Armazenar token CSRF
let csrfToken = null;
let sessionId = generateSessionId();

// Gerar ID de sessão único
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Obter token CSRF do servidor
export async function getCsrfToken() {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      headers: {
        'X-Session-Id': sessionId
      }
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Erro ao obter CSRF token:', error);
    return null;
  }
}

// Wrapper para fetch com CSRF token
export async function apiRequest(endpoint, options = {}) {
  // Garantir que temos um token
  if (!csrfToken) {
    await getCsrfToken();
  }

  // Preparar headers
  const headers = {
    'X-Session-Id': sessionId,
    'X-CSRF-Token': csrfToken,
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Atualizar token CSRF a partir dos headers da resposta
    const newToken = response.headers.get('X-CSRF-Token');
    if (newToken) {
      csrfToken = newToken;
    }

    return response;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Utilitários específicos
export const api = {
  // GET
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  
  // POST com JSON
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // POST com FormData
  postFormData: (endpoint, formData) => apiRequest(endpoint, {
    method: 'POST',
    body: formData
  }),
  
  // DELETE
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

// Inicializar token ao carregar
getCsrfToken();