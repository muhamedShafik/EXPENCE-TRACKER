const categoryInput = document.getElementById("Category");
const amountInput = document.getElementById("Amount");
const totalEl = document.getElementById("total");
const avgEl = document.getElementById("Avarage");
const entriesEl = document.getElementById("Entery");
const expenseList = document.getElementById("exapenseList");
const addBtn = document.getElementById("addBtn");

let expenses = [];
let chart;
const STORAGE_KEY = "expenses";

function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) expenses = JSON.parse(raw);
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

addBtn.addEventListener("click", () => {
  const category = categoryInput.value;
  const amount = parseFloat(amountInput.value);


  if(Number(category)|| category==null||!category){
    
    alert("plese enter valid category")
    return;
  }

  if ( isNaN(amount) || amount <= 0) return;

  
  const expense = {
    id: Date.now().toString(),
    category,
    amount,
    dateISO: new Date().toISOString()
  };

  expenses.push(expense);
  saveToLocalStorage();
  updateUI();

  categoryInput.value = "";
  amountInput.value = "";
});

function updateUI() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalEl.textContent = total.toFixed(2);

  const months = new Set(
    expenses.map(e => {
      const d = new Date(e.dateISO);
      return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}`;
    })
  );
  const monthsCount = months.size || 1;
  avgEl.textContent = (total / monthsCount).toFixed(2);

  entriesEl.textContent = expenses.length;
  renderList();
  updateChart();
}

function renderList() {
  expenseList.innerHTML = `
    <table class="table ">
      <thead>
        <tr>
          <th>id</th>
          <th>Date</th>
          <th>Category</th>
          <th>Amount</th>
          <th>remove</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = expenseList.querySelector("tbody");

  expenses.forEach((exp , index) => {
    const tr = document.createElement("tr");
    const displayDate = new Date(exp.dateISO).toLocaleDateString();
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${displayDate}</td>
      <td>${exp.category}</td>
      <td>$${exp.amount.toFixed(2)}</td>
      <td><button data-id="${exp.id}" class="btn btn-danger btn-sm">Remove</button></td>
    `;

    tr.querySelector("button").addEventListener("click", e => {
      const id = e.target.getAttribute("data-id");
      expenses = expenses.filter(item => item.id !== id);
      saveToLocalStorage();
      updateUI();
    });

    tbody.appendChild(tr);
  });
}


function updateChart() {
  const ctx = document.getElementById("expenseChart")
  const totalsByCategory = {};
  expenses.forEach(e => {
    totalsByCategory[e.category] = (totalsByCategory[e.category] || 0) + e.amount;
  });
  const categories = Object.keys(totalsByCategory);
  const amounts = Object.values(totalsByCategory);
  if (chart) chart.destroy();
  if (categories.length === 0) return;

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: [
          "rgba(75,192,192,0.7)",
          "rgba(255,99,132,0.7)",
          "rgba(255,205,86,0.7)",
          "rgba(54,162,235,0.7)",
          "rgba(153,102,255,0.7)",
          "rgba(255,159,64,0.7)"
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((value / total) * 100).toFixed(1);
              return `${context.label}: $${value} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

loadFromLocalStorage();
updateUI();
