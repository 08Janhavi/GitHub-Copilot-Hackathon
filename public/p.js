const balance = document.querySelector("#balance");
const inc_amt = document.querySelector("#inc-amt");
const exp_amt = document.querySelector("#exp-amt");
const trans = document.querySelector("#trans");
const form = document.querySelector("#form");
const description = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const category = document.querySelector("#category");

/*
const dummyData = [
  { id: 1, description: "Flower", amount: -20, category: "Expense" },
  { id: 2, description: "Salary", amount: 35000, category: "Income" },
  { id: 3, description: "Book", amount: 10, category: "Expense" },
  { id: 4, description: "Camera", amount: -150, category: "Expense" },
  { id: 5, description: "Petrol", amount: -250, category: "Expense" },
];

let transactions = dummyData;
*/

const localStorageTrans = JSON.parse(localStorage.getItem("trans"));
let transactions = localStorage.getItem("trans") !== null ? localStorageTrans : [];

function loadTransactionDetails(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "exp" : "inc");
  item.innerHTML = `
    ${transaction.description}
    <span>${sign} ${Math.abs(transaction.amount)}</span>
    <span class="category">${transaction.category}</span>
    <button class="btn-del" onclick="removeTrans(${transaction.id})">x</button>
    <button class="btn-edit" onclick="editTrans(${transaction.id})">Edit</button>
  `;
  trans.appendChild(item);
}

function removeTrans(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((transaction) => transaction.id != id);
    config();
    updateLocalStorage();
  } else {
    return;
  }
}



function config() {
  trans.innerHTML = "";
  transactions.forEach(loadTransactionDetails);
  updateAmount();
}

function addTransaction(e) {
  e.preventDefault();
  if (
    description.value.trim() === "" ||
    amount.value.trim() === "" ||
    category.value.trim() === ""
  ) {
    alert("Please enter description, amount, and category.");
  } else {
    let transactionAmount = parseFloat(amount.value);
    let transactionCategory = category.value.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    if (transactionCategory === "expense") {
      transactionAmount = -transactionAmount;
    }
    const transaction = {
      id: uniqueId(),
      description: description.value,
      amount: transactionAmount,
      category: transactionCategory,
    };
    transactions.push(transaction);
    loadTransactionDetails(transaction);
    description.value = "";
    amount.value = "";
    category.value = "";
    updateAmount();
    updateLocalStorage();
  }
}





function updateAmount() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  balance.innerHTML = `₹ ${total}`;

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  inc_amt.innerHTML = `₹ ${income}`;

  const expense = amounts
    .filter((item) => item < 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  exp_amt.innerHTML = `₹ ${Math.abs(expense)}`;
}


function uniqueId() {
  return Math.floor(Math.random() * 10000000);
}

form.addEventListener("submit", addTransaction);

window.addEventListener("load", function () {
  config();
});

function updateLocalStorage() {
  localStorage.setItem("trans", JSON.stringify(transactions));
}


function editTrans(id) {
  const transaction = transactions.find((trans) => trans.id === id);
  if (transaction) {
    const updatedDescription = prompt("Enter a new description:", transaction.description);
    const updatedAmount = prompt("Enter a new amount:", transaction.amount);
    if (updatedDescription && updatedAmount) {
      transaction.description = updatedDescription;
      transaction.amount = +updatedAmount;
      config();
      updateLocalStorage();
    }
  }
}
// Calculate the total balance
const totalBalance = Math.abs(transactions.reduce((acc, transaction) => acc + transaction.amount, 0));

// Calculate the percentages for each category
const percentages = transactions.reduce((acc, transaction) => {
  const category = transaction.category.toLowerCase();
  if (!acc[category]) {
    acc[category] = 0;
  }
  acc[category] += Math.abs(transaction.amount);
  return acc;
}, {});

// Calculate the percentage values and colors
const labels = [];
const percentagesData = [];
const colors = [];

for (const category in percentages) {
  const percentage = ((percentages[category] / totalBalance) * 100).toFixed(2);
  labels.push(category);
  percentagesData.push(percentage);
  colors.push(category === 'expense' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 128, 0, 0.8)');
}

// Create the spending pattern chart
const ctx = document.getElementById('spending-chart').getContext('2d');
new Chart(ctx, {
  type: 'pie',
  data: {
    labels: labels,
    datasets: [{
      data: percentagesData,
      backgroundColor: colors,
    }]
  },
  options: {
    responsive: true,
    legend: {
      position: 'bottom',
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          const label = data.labels[tooltipItem.index];
          const percentage = data.datasets[0].data[tooltipItem.index];
          return `${label}: ${percentage}%`;
        }
      }
    }
  },
});


// Function to handle receipt scanning
function scanReceipt() {
  const fileInput = document.getElementById('receipt-input');
  const scannedResult = document.getElementById('scanned-result');

  // Get the selected file
  const file = fileInput.files[0];

  // Create a FormData object to send the file to the server
  const formData = new FormData();
  formData.append('receipt', file);

  // Send the FormData object to the server for processing
  // You would need to implement the server-side processing logic to perform OCR and extract relevant information from the receipt

  // Display the scanned result
  scannedResult.innerHTML = 'Scanned Result: <br> ...'; // Update with the processed information from the server
}

// Event listener for the scan button
const scanButton = document.getElementById('scan-button');
scanButton.addEventListener('click', scanReceipt);


// Add an event listener to the scan button
// const scanButton = document.getElementById("scan-button");
// scanButton.addEventListener("click", scanReceipt);

// Function to handle receipt scanning
function scanReceipt() {
  const fileInput = document.getElementById("receipt-input");
  const file = fileInput.files[0];

  if (file) {
    // Create a new Tesseract.js worker
    const worker = Tesseract.createWorker();

    // Load the image file and perform OCR
    worker.load()
      .then(() => {
        return worker.recognize(file);
      })
      .then(result => {
        // Display the scanned result
        const scannedTextElement = document.getElementById("scanned-text");
        scannedTextElement.textContent = result.text;

        // Terminate the worker
        worker.terminate();
      })
      .catch(err => {
        console.error("Error during OCR:", err);
      });
  }
}

// Function to handle form submission
function saveAccount(event) {
  event.preventDefault();

  // Get form inputs
  const accountType = document.getElementById("account-type").value;
  const accountNumber = document.getElementById("account-number").value;
  const accountName = document.getElementById("account-name").value;
  const accountBank = document.getElementById("account-bank").value;

  // Create an object to store the account details
  const account = {
    type: accountType,
    number: accountNumber,
    name: accountName,
    bank: accountBank
  };

  // Save the account to the backend or local storage
  // You can implement your own backend functionality here, such as sending the data to a server or storing it in a database

  // Example: Saving the account to local storage
  localStorage.setItem("account", JSON.stringify(account));

  // Clear the form inputs
  document.getElementById("account-form").reset();

  // Show a success message or perform any other desired action
  alert("Account saved successfully!");
}

// Add event listener to the form submit event
document.getElementById("account-form").addEventListener("submit", saveAccount);


// Retrieve scanned receipt details and update finance tracker
function processReceiptDetails(receiptDetails) {
  // Extract relevant information from the receiptDetails object
  const { description, amount, category } = receiptDetails;

  // Update the finance tracker with the receipt details
  const transElement = document.getElementById("trans");
  const listItem = document.createElement("li");
  listItem.className = category === "income" ? "inc" : "exp";
  listItem.innerHTML = `
    ${description}
    <span>${amount}</span>
    <button class="btn-del">x</button>
  `;
  transElement.appendChild(listItem);
}

// Event listener for scanning receipt
document.getElementById("scan-button").addEventListener("click", function () {
  // Simulating receipt scanning process
  const scannedReceipt = {
    description: "Groceries",
    amount: -50.0,
    category: "expense",
    // Add more receipt details as needed
  };

  // Process the scanned receipt details
  processReceiptDetails(scannedReceipt);
});