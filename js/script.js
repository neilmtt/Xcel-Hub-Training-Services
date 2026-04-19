const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const authMessage = document.getElementById('authMessage');
const toast = document.getElementById('toast');

const storageKeys = {
  account: 'xcelhub_account',
  sessionUser: 'xcelhub_session_user',
  rememberedUser: 'xcelhub_remembered_user',
  prefillEmail: 'xcelhub_prefill_email'
};

const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

let toastTimer = null;

function getAccount() {
  const raw = localStorage.getItem(storageKeys.account);
  return raw ? JSON.parse(raw) : null;
}

function setAccount(account) {
  localStorage.setItem(storageKeys.account, JSON.stringify(account));
}

function getLoggedInEmail() {
  return localStorage.getItem(storageKeys.rememberedUser) || sessionStorage.getItem(storageKeys.sessionUser);
}

function isAuthenticated() {
  const account = getAccount();
  const loggedInEmail = getLoggedInEmail();
  return Boolean(account && loggedInEmail && account.email === loggedInEmail);
}

function applyRouteGuards() {
  const onHome = currentPage === 'index.html' || currentPage === '';
  const onLogin = currentPage === 'login.html';
  const onSignup = currentPage === 'signup.html';

  if (onHome && !isAuthenticated()) {
    window.location.replace('login.html');
    return;
  }

  if ((onLogin || onSignup) && isAuthenticated()) {
    window.location.replace('index.html');
  }
}

function showToast(message) {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function setMessage(message, isError = false) {
  if (!authMessage) {
    return;
  }
  authMessage.textContent = message;
  authMessage.style.color = isError ? '#b23b2d' : '#0f6c53';
}

function togglePassword(input, button) {
  const revealing = input.type === 'password';
  input.type = revealing ? 'text' : 'password';
  button.setAttribute('aria-label', revealing ? 'Hide password' : 'Show password');
}

function loginStoredUser(account, rememberMe) {
  if (rememberMe) {
    localStorage.setItem(storageKeys.rememberedUser, account.email);
    sessionStorage.removeItem(storageKeys.sessionUser);
  } else {
    sessionStorage.setItem(storageKeys.sessionUser, account.email);
    localStorage.removeItem(storageKeys.rememberedUser);
  }
}

function logoutAndRedirect() {
  localStorage.removeItem(storageKeys.rememberedUser);
  sessionStorage.removeItem(storageKeys.sessionUser);
  window.location.replace('login.html');
}

function handleSignup(event) {
  event.preventDefault();
  if (!signupForm) {
    return;
  }

  const formData = new FormData(signupForm);
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!firstName || !lastName || !email || !password) {
    setMessage('Please fill in all required fields.', true);
    return;
  }

  if (password.length < 6) {
    setMessage('Password must be at least 6 characters.', true);
    return;
  }

  setAccount({ firstName, lastName, email, password });
  sessionStorage.setItem(storageKeys.prefillEmail, email);
  showToast('Account created. Please log in.');
  window.location.replace('login.html');
}

function handleLogin(event) {
  event.preventDefault();
  if (!loginForm) {
    return;
  }

  const formData = new FormData(loginForm);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const rememberMe = Boolean(formData.get('rememberMe'));
  const account = getAccount();

  if (!account) {
    setMessage('No account found. Please create one first.', true);
    return;
  }

  if (account.email !== email || account.password !== password) {
    setMessage('Email or password is incorrect.', true);
    return;
  }

  loginStoredUser(account, rememberMe);
  showToast('Login successful.');
  window.location.replace('index.html');
}

function handleForgotPassword(event) {
  event.preventDefault();
  showToast('Forgot password is not available in this frontend demo.');
}

document.addEventListener('click', (event) => {
  const toggleButton = event.target.closest('[data-password-toggle]');
  const forgotButton = event.target.closest('[data-forgot-password]');
  const logoutButton = event.target.closest('[data-logout]');

  if (toggleButton) {
    const input = document.getElementById(toggleButton.dataset.passwordToggle);
    if (input) {
      togglePassword(input, toggleButton);
    }
  }

  if (forgotButton) {
    handleForgotPassword(event);
  }

  if (logoutButton) {
    event.preventDefault();
    logoutAndRedirect();
  }
});

if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
  const prefillEmail = sessionStorage.getItem(storageKeys.prefillEmail);
  if (prefillEmail) {
    const emailField = loginForm.querySelector('input[name="email"]');
    if (emailField) {
      emailField.value = prefillEmail;
    }
    sessionStorage.removeItem(storageKeys.prefillEmail);
  }
}

applyRouteGuards();
