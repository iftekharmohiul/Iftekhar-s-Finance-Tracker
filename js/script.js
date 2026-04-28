let transactions = JSON.parse(localStorage.getItem('financeData')) || [];
let myChart;
let currentFilter = 'all';

window.onload = () => {
    document.getElementById('date').valueAsDate = new Date();
    setupCardFilters();
    updateUI();
    updateChart();
};

// Summary cards click logic
function setupCardFilters() {
    document.querySelector('.income-card').onclick = () => { currentFilter = 'income'; updateUI(); };
    document.querySelector('.expense-card').onclick = () => { currentFilter = 'expense'; updateUI(); };
    document.querySelector('.balance-card').onclick = () => { resetFilters(); };
}

function resetFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('searchInput').value = '';
    currentFilter = 'all';
    updateUI();
}

function addData() {
    const date = document.getElementById('date').value;
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!date || !desc || isNaN(amount)) {
        alert("Sothik bhabe shob gulo ghor puron koro.");
        return;
    }

    const entry = { id: Date.now(), date, desc, amount, type };
    transactions.push(entry);
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveAndRefresh();
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
}

function deleteEntry(id) {
    if(confirm("Tumi ki eiti delete korte chao?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('financeData', JSON.stringify(transactions));
    updateUI();
    updateChart();
}

function updateUI() {
    const list = document.getElementById('data-list');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    list.innerHTML = "";
    let totalInc = 0;
    let totalExp = 0;

    transactions.forEach(t => {
        // Shob somoy calculation full data theke hobe
        if (t.type === 'income') totalInc += t.amount;
        else totalExp += t.amount;

        // Filtering Logic
        const matchesType = (currentFilter === 'all' || t.type === currentFilter);
        const matchesSearch = t.desc.toLowerCase().includes(searchTerm);
        const matchesDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);

        if (matchesType && matchesSearch && matchesDate) {
            const row = `<tr>
                <td>${t.date}</td>
                <td>${t.desc}</td>
                <td>৳${t.amount.toLocaleString()}</td>
                <td style="color: ${t.type === 'income' ? '#27ae60' : '#e74c3c'}; font-weight:bold;">
                    ${t.type.toUpperCase()}
                </td>
                <td><button class="delete-btn" onclick="deleteEntry(${t.id})">Delete</button></td>
            </tr>`;
            list.innerHTML += row;
        }
    });

    document.getElementById('total-income').innerText = `৳${totalInc.toLocaleString()}`;
    document.getElementById('total-expense').innerText = `৳${totalExp.toLocaleString()}`;
    document.getElementById('total-balance').innerText = `৳${(totalInc - totalExp).toLocaleString()}`;
}

function updateChart() {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const ctx = document.getElementById('financeChart').getContext('2d');
    
    if (myChart) myChart.destroy();
    if (inc === 0 && exp === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [inc, exp],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom' } }
        }
    });
}