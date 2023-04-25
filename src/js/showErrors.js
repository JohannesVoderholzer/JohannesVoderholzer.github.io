let errorTimeout;
console.log("loaded showErrors.js");

export function showError(message) {
    console.log("Error found: " + message);
    const errorElement = document.getElementById('error');
    errorElement.style.backgroundColor = "#85332d";
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorElement.classList.add('show');
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
    errorElement.classList.remove('show');
    }, 3000);
}

export function showGreenMessage(message){
    const errorElement = document.getElementById('error');
    errorElement.style.backgroundColor = "#476e47";
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorElement.classList.add('show');
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
      errorElement.classList.remove('show');
    }, 3000);
}

export function confirmCustomFunction(message) {
  return new Promise((resolve) => {
      const confirmOverlay = document.querySelector('#confirm-overlay');
      const confirmDialog = document.querySelector('#confirm-dialog');
      const confirmYes = document.querySelector('#confirm-yes');
      const confirmNo = document.querySelector('#confirm-no');

      confirmDialog.querySelector('p').textContent = message;
      confirmOverlay.style.display = 'block';
      confirmDialog.style.display = 'block';

      confirmYes.addEventListener('click', () => {
          confirmOverlay.style.display = 'none';
          confirmDialog.style.display = 'none';
          resolve(true);
      });

      confirmNo.addEventListener('click', () => {
          confirmOverlay.style.display = 'none';
          confirmDialog.style.display = 'none';
          resolve(false);
      });
  });
}