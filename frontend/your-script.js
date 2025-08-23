
    // Handle email submission
document.getElementById('emailForm').addEventListener('submit', function (event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  
  // Send the email to the backend for generating and sending a verification code
  fetch('/send-verification-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
  .then(response => response.json())
  .then(data => {
    // if (data.success) {
      // Show the verification code form
      document.getElementById('emailForm').style.display = 'none';
      document.getElementById('verificationForm').style.display = 'block';
    // } else {
    //   alert('Error sending email. Please try again.');
    // }
  });
});

// Handle verification code submission
document.getElementById('verificationForm').addEventListener('submit', function (event) {
  event.preventDefault();
  
  const verificationCode = document.getElementById('verificationCode').value;
  
  // Send the code to the backend to verify
  fetch('/verify-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ verificationCode }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Email verified successfully!');
    } else {
      alert('Invalid or expired code.');
    }
  });
});