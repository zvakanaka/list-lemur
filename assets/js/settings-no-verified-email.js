const base = document.head.querySelector('base') ? document.head.querySelector('base').href : '';

const sendCodeButton = document.querySelector('.send-code__button');
const phoneOrEmailInput = document.querySelector('.phone-or-email__input');
let codeSentMessageEl = null;

enterKey(phoneOrEmailInput, sendCodeButton, sendCode);
async function sendCode () {
  sendCodeButton.disabled = true;
  const carrierSelect = document.querySelector('.select-carrier__select');
  const email = phoneOrEmailInput.value + carrierSelect.value;
  let error = false;
  const response = await fetchPost('./send-code', { email })
    .catch(e => {
      addMessage(`Failed to send code to ${email}`);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      error = true;
    });
  if (!error) {
    codeSentMessageEl = addMessage(`Code sent to ${email}`);
  }
  // null if email is already set
  const mustSetEmailMessageEl = document.querySelector('.messages__must-set-email');
  if (mustSetEmailMessageEl) mustSetEmailMessageEl.remove();

  const verificationCodeContainer = document.querySelector('.verification-code__container');
  verificationCodeContainer.classList.remove('invisible');
}

const verifyCodeInput = document.querySelector('.verification-code__input');
const verifyCodeButton = document.querySelector('.verify-code__button');
enterKey(verifyCodeInput, verifyCodeButton, verifyCode);
async function verifyCode () {
  verifyCodeButton.disabled = true;
  const code = verifyCodeInput.value;
  let error = false;

  const response = await fetchPost('./verify-code', { code })
    .catch(e => {
      addMessage(`Failed to verify code: ${code}`);
      error = true;
    });
  if (!error) {
    addMessage('Code verified');
    const verificationCodeContainer = document.querySelector('.verification-code__container');
    verificationCodeContainer.classList.add('invisible');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
  if (codeSentMessageEl) codeSentMessageEl.remove();
}
