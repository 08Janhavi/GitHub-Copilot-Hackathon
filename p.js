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
