// Dynamic DOM-based validation with live error handling

// Helper to create and attach a <small> error element under a field container
function ensureErrorElement(container, idSuffix) {
  let el = container.querySelector('small.error-message');
  if (el) return el;
  el = document.createElement('small'); // document.createElement()
  el.classList.add('error-message', 'hidden'); // classList.add()
  el.id = `error_${idSuffix}`;
  container.appendChild(el); // appendChild()
  return el;
}

function setError(container, input, message) {
  const errorEl = ensureErrorElement(container, input.id || input.name);
  errorEl.textContent = message; // textContent
  errorEl.classList.remove('hidden'); // classList.remove()
  input.classList.add('input-error'); // classList.add()
}

function clearError(container, input) {
  const errorEl = ensureErrorElement(container, input.id || input.name);
  errorEl.textContent = ''; // textContent
  errorEl.classList.add('hidden'); // classList.add()
  input.classList.remove('input-error'); // classList.remove()
}

// Field references
const form = document.getElementById('registrationForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const genderRadios = Array.from(document.querySelectorAll('input[name="gender"]'));
const country = document.getElementById('country');
const terms = document.getElementById('terms');
const submitBtn = document.getElementById('submitBtn');

// Containers (for appending error <small> elements)
const firstNameField = document.getElementById('firstNameField');
const lastNameField = document.getElementById('lastNameField');
const emailField = document.getElementById('emailField');
const passwordField = document.getElementById('passwordField');
const confirmPasswordField = document.getElementById('confirmPasswordField');
const genderField = document.getElementById('genderField');
const countryField = document.getElementById('countryField');
const termsField = document.getElementById('termsField');

// Create error elements up-front (ensures a node exists per field)
[
  [firstNameField, firstName, 'firstName'],
  [lastNameField, lastName, 'lastName'],
  [emailField, email, 'email'],
  [passwordField, password, 'password'],
  [confirmPasswordField, confirmPassword, 'confirmPassword'],
  [genderField, genderRadios[genderRadios.length - 1] || genderField, 'gender'],
  [countryField, country, 'country'],
  [termsField, terms, 'terms']
].forEach(([container, input, id]) => ensureErrorElement(container, id));

// Validation functions return boolean
function validateFirstName() {
  // No minimum length requirement; keep the field clear of errors
  clearError(firstNameField, firstName);
  return true;
}

function validateEmail() {
  const value = email.value.trim();
  if (!value.includes('@')) {
    setError(emailField, email, 'Email must contain "@".');
    return false;
  }
  clearError(emailField, email);
  return true;
}

function validatePassword() {
  const value = password.value;
  const hasMin = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);

  if (!hasMin || !hasUpper) {
    let msg = '';
    if (!hasMin && !hasUpper) msg = 'Password must be at least 8 characters and include an uppercase letter.';
    else if (!hasMin) msg = 'Password must be at least 8 characters.';
    else msg = 'Password must include at least one uppercase letter.';
    setError(passwordField, password, msg);
    return false;
  }
  clearError(passwordField, password);
  return true;
}

function validateConfirmPassword() {
  const pass = password.value;
  const confirm = confirmPassword.value;
  if (confirm !== pass || confirm.length === 0) {
    setError(confirmPasswordField, confirmPassword, 'Passwords must match.');
    return false;
  }
  clearError(confirmPasswordField, confirmPassword);
  return true;
}

function validateGender() {
  const selected = genderRadios.some(r => r.checked);
  const fauxInput = genderRadios[genderRadios.length - 1] || genderField;
  if (!selected) {
    setError(genderField, fauxInput, 'Please select your gender.');
    return false;
  }
  clearError(genderField, fauxInput);
  return true;
}

function validateCountry() {
  if (!country.value) {
    setError(countryField, country, 'Please select your country.');
    return false;
  }
  clearError(countryField, country);
  return true;
}

function validateTerms() {
  if (!terms.checked) {
    setError(termsField, terms, 'You must agree to the Terms & Conditions.');
    return false;
  }
  clearError(termsField, terms);
  return true;
}

function validateFormAll() {
  const a = validateFirstName();
  const b = true; // last name currently has no rule, but keep clear
  clearError(lastNameField, lastName);
  const c = validateEmail();
  const d = validatePassword();
  const e = validateConfirmPassword();
  const f = validateGender();
  const g = validateCountry();
  const h = validateTerms();
  return a && b && c && d && e && f && g && h;
}

function syncSubmitState() {
  const ok = validateFormAll();
  submitBtn.disabled = !ok;
}

// Simple listener helpers to reduce repetition
function onInput(el, fn) { el.addEventListener('input', () => { fn(); syncSubmitState(); }); }
function onChange(el, fn) { el.addEventListener('change', () => { fn(); syncSubmitState(); }); }

// Live validation listeners
onInput(firstName, validateFirstName);
onInput(lastName, () => { clearError(lastNameField, lastName); });
onInput(email, validateEmail);
onInput(password, () => { validatePassword(); validateConfirmPassword(); });
onInput(confirmPassword, validateConfirmPassword);
genderRadios.forEach(r => onChange(r, validateGender));
onChange(country, validateCountry);
onChange(terms, validateTerms);

// Initial state
syncSubmitState();

// On submit, prevent page reload and run a final validation pass
form.addEventListener('submit', (e) => {
  e.preventDefault();
  validateFormAll();
  syncSubmitState();
});
