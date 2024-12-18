const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');
const categoryForm = document.getElementById('category-form');
const incomeList = document.getElementById('income-list');
const expenseList = document.getElementById('expense-list');
const categoryList = document.getElementById('category-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const expensesChartCtx = document.getElementById('expenses-chart').getContext('2d');
const incomesChartCtx = document.getElementById('incomes-chart').getContext('2d');
const stackedChartCtx = document.getElementById('stacked-chart').getContext('2d');
const thermometerChartCtx = document.getElementById('thermometer-chart').getContext('2d');
const expenseCategorySelect = document.getElementById('expense-category');
const resetBtn = document.getElementById('reset-btn');
const currencySelector = document.getElementById('currency-selector');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file');
const notificationContainer = document.getElementById('notification-container');

const editCategoryModal = document.getElementById('edit-category-modal');
const closeCategoryModal = document.getElementById('close-category-modal');
const editCategoryForm = document.getElementById('edit-category-form');
const editCategoryIndex = document.getElementById('edit-category-index');
const editCategoryName = document.getElementById('edit-category-name');
const editCategoryColor = document.getElementById('edit-category-color');

const editExpenseModal = document.getElementById('edit-expense-modal');
const closeExpenseModal = document.getElementById('close-expense-modal');
const editExpenseForm = document.getElementById('edit-expense-form');
const editExpenseIndex = document.getElementById('edit-expense-index');
const editExpenseName = document.getElementById('edit-expense-name');
const editExpenseAmount = document.getElementById('edit-expense-amount');
const editExpenseDate = document.getElementById('edit-expense-date');
const editExpenseCategorySelect = document.getElementById('edit-expense-category');

const editIncomeModal = document.getElementById('edit-income-modal');
const closeIncomeModal = document.getElementById('close-income-modal');
const editIncomeForm = document.getElementById('edit-income-form');
const editIncomeIndex = document.getElementById('edit-income-index');
const editIncomeName = document.getElementById('edit-income-name');
const editIncomeAmount = document.getElementById('edit-income-amount');
const editIncomeDate = document.getElementById('edit-income-date');
const editIncomeColor = document.getElementById('edit-income-color');

const defaultCategories = [
    { name: 'Alimentación', color: '#32CD32', isDefault: true },
    { name: 'Transporte', color: '#FF9800', isDefault: true },
    { name: 'Entretenimiento', color: '#FFA726', isDefault: true },
    { name: 'Salud', color: '#FB8C00', isDefault: true },
    { name: 'Otros', color: '#FFCC80', isDefault: true }
];

let incomes = [];
let expenses = [];
let categories = [];
let selectedCurrency = 'USD';

const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'ARS': '$',
    'PEN': 'S/'
};

let expensesChart;
let incomesChart;
let stackedChart;
let thermometerChart;

// Side Menu Elements
const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');
const currencySelectorMenu = document.getElementById('currency-selector-menu');
const exportBtnMenu = document.getElementById('export-btn-menu');
const importBtnMenu = document.getElementById('import-btn-menu');
const resetBtnMenu = document.getElementById('reset-btn-menu');

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    
    const messageSpan = document.createElement('span');
    messageSpan.classList.add('message');
    messageSpan.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;';
    
    closeBtn.addEventListener('click', () => {
        notificationContainer.removeChild(notification);
    });
    
    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);
    notificationContainer.appendChild(notification);
    
    // Automatically remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notificationContainer.removeChild(notification);
        }
    }, 5000);
}

function loadData() {
    const storedIncomes = localStorage.getItem('incomes');
    const storedExpenses = localStorage.getItem('expenses');
    const storedCategories = localStorage.getItem('categories');
    const storedCurrency = localStorage.getItem('currency');
    incomes = storedIncomes ? JSON.parse(storedIncomes) : [];
    expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
    categories = storedCategories ? JSON.parse(storedCategories) : defaultCategories;
    selectedCurrency = storedCurrency ? storedCurrency : 'USD';
    currencySelector.value = selectedCurrency;
    currencySelectorMenu.value = selectedCurrency;
}

function saveData() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('currency', selectedCurrency);
}

function updateSummary() {
    const totalIncome = incomes.reduce((acc, income) => acc + Number(income.amount), 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = `${currencySymbols[selectedCurrency]}${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `${currencySymbols[selectedCurrency]}${totalExpenses.toFixed(2)}`;
    balanceEl.textContent = `${currencySymbols[selectedCurrency]}${balance.toFixed(2)}`;
}

function renderLists() {
    incomeList.innerHTML = '';
    incomes.forEach((income, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${income.name}: ${currencySymbols[selectedCurrency]}${Number(income.amount).toFixed(2)}</span>
            <div>
                <button class="edit-btn" data-type="income" data-index="${index}"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-btn" data-type="income" data-index="${index}"><i class="fas fa-trash-alt"></i> Eliminar</button>
            </div>
        `;
        incomeList.appendChild(li);
    });

    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${expense.name}</strong>: ${currencySymbols[selectedCurrency]}${Number(expense.amount).toFixed(2)} 
                <span>(${expense.category}) - ${formatDate(expense.date)}</span>
            </div>
            <div>
                <button class="edit-btn" data-type="expense" data-index="${index}"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-btn" data-type="expense" data-index="${index}"><i class="fas fa-trash-alt"></i> Eliminar</button>
            </div>
        `;
        expenseList.appendChild(li);
    });

    categoryList.innerHTML = '';
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="width: 15px; height: 15px; background-color: ${category.color}; display: inline-block; margin-right: 10px; border-radius: 3px;"></span>
                ${category.name}
            </div>
            <div>
                <button class="edit-btn" data-type="category" data-index="${index}"><i class="fas fa-edit"></i> Editar</button>
                ${!category.isDefault ? `<button class="delete-btn" data-type="category" data-index="${index}"><i class="fas fa-trash-alt"></i> Eliminar</button>` : ''}
            </div>
        `;
        categoryList.appendChild(li);
    });

    populateCategorySelect();
    populateEditExpenseCategorySelect();

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteItem);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', openEditModal);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
}

function populateCategorySelect() {
    expenseCategorySelect.innerHTML = '<option value="" disabled selected>Selecciona Categoría</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        expenseCategorySelect.appendChild(option);
    });
}

function populateEditExpenseCategorySelect() {
    editExpenseCategorySelect.innerHTML = '<option value="" disabled selected>Selecciona Categoría</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        editExpenseCategorySelect.appendChild(option);
    });
}

function deleteItem(e) {
    const button = e.target.closest('button');
    const type = button.getAttribute('data-type');
    const index = button.getAttribute('data-index');

    if (type === 'income') {
        incomes.splice(index, 1);
        showNotification('success', 'Ingreso eliminado correctamente.');
    } else if (type === 'expense') {
        expenses.splice(index, 1);
        showNotification('success', 'Gasto eliminado correctamente.');
    } else if (type === 'category') {
        const categoryName = categories[index].name;
        const hasExpenses = expenses.some(expense => expense.category === categoryName);
        if (hasExpenses) {
            showNotification('error', 'No puedes eliminar una categoría que tiene gastos asociados.');
            return;
        }
        categories.splice(index, 1);
        showNotification('success', 'Categoría eliminada correctamente.');
    }

    saveData();
    renderLists();
    updateSummary();
    updateCharts();
}

function openEditModal(e) {
    const button = e.target.closest('button');
    const type = button.getAttribute('data-type');
    const index = button.getAttribute('data-index');

    if (type === 'category') {
        const category = categories[index];
        editCategoryIndex.value = index;
        editCategoryName.value = category.name;
        editCategoryColor.value = category.color;
        editCategoryModal.style.display = 'block';
    } else if (type === 'expense') {
        const expense = expenses[index];
        editExpenseIndex.value = index;
        editExpenseName.value = expense.name;
        editExpenseAmount.value = expense.amount.toFixed(2);
        editExpenseDate.value = expense.date;
        editExpenseCategorySelect.value = expense.category;
        editExpenseModal.style.display = 'block';
    } else if (type === 'income') {
        const income = incomes[index];
        editIncomeIndex.value = index;
        editIncomeName.value = income.name;
        editIncomeAmount.value = income.amount.toFixed(2);
        editIncomeDate.value = income.date;
        editIncomeColor.value = income.color;
        editIncomeModal.style.display = 'block';
    }
}

closeCategoryModal.onclick = () => {
    editCategoryModal.style.display = 'none';
};

closeExpenseModal.onclick = () => {
    editExpenseModal.style.display = 'none';
};

closeIncomeModal.onclick = () => {
    editIncomeModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == editCategoryModal) {
        editCategoryModal.style.display = 'none';
    }
    if (event.target == editExpenseModal) {
        editExpenseModal.style.display = 'none';
    }
    if (event.target == editIncomeModal) {
        editIncomeModal.style.display = 'none';
    }
};

editCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = editCategoryIndex.value;
    const name = editCategoryName.value.trim();
    const color = editCategoryColor.value;

    if (name && color && !categories.some((cat, i) => cat.name.toLowerCase() === name.toLowerCase() && i != index)) {
        categories[index].name = name;
        categories[index].color = color;
        saveData();
        renderLists();
        updateCharts();
        editCategoryModal.style.display = 'none';
        showNotification('success', 'Categoría actualizada correctamente.');
    } else {
        showNotification('error', 'Por favor, ingresa un nombre válido y asegúrate de que la categoría no exista ya.');
    }
});

editExpenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = editExpenseIndex.value;
    const name = editExpenseName.value.trim();
    const amount = parseFloat(editExpenseAmount.value).toFixed(2);
    const date = editExpenseDate.value;
    const category = editExpenseCategorySelect.value;

    if (name && amount && date && category && !isNaN(amount) && Number(amount) > 0) {
        expenses[index].name = name;
        expenses[index].amount = Number(amount);
        expenses[index].date = date;
        expenses[index].category = category;
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        editExpenseModal.style.display = 'none';
        showNotification('success', 'Gasto actualizado correctamente.');
    } else {
        showNotification('error', 'Por favor, completa todos los campos con valores válidos.');
    }
});

editIncomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = editIncomeIndex.value;
    const name = editIncomeName.value.trim();
    const amount = parseFloat(editIncomeAmount.value).toFixed(2);
    const date = editIncomeDate.value;
    const color = editIncomeColor.value;

    if (name && amount && date && color && !isNaN(amount) && Number(amount) > 0) {
        incomes[index].name = name;
        incomes[index].amount = Number(amount);
        incomes[index].date = date;
        incomes[index].color = color;
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        editIncomeModal.style.display = 'none';
        showNotification('success', 'Ingreso actualizado correctamente.');
    } else {
        showNotification('error', 'Por favor, completa todos los campos con valores válidos.');
    }
});

incomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('income-name').value.trim();
    const amount = parseFloat(document.getElementById('income-amount').value.trim()).toFixed(2);
    const date = document.getElementById('income-date').value;
    const color = document.getElementById('income-color').value;

    if (name && amount && date && color && !isNaN(amount) && Number(amount) > 0) {
        incomes.push({ name, amount: Number(amount), date, color });
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        incomeForm.reset();
        showNotification('success', 'Ingreso agregado correctamente.');
    } else {
        showNotification('error', 'Por favor, ingresa un nombre válido, monto positivo, selecciona una fecha y un color.');
    }
});

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value.trim()).toFixed(2);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;

    if (name && amount && date && category && !isNaN(amount) && Number(amount) > 0) {
        expenses.push({ name, amount: Number(amount), date, category });
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        expenseForm.reset();
        showNotification('success', 'Gasto agregado correctamente.');
    } else {
        showNotification('error', 'Por favor, completa todos los campos con valores válidos.');
    }
});

categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('category-name').value.trim();
    const color = document.getElementById('category-color').value;

    if (name && color && !categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        categories.push({ name, color, isDefault: false });
        saveData();
        renderLists();
        updateCharts();
        categoryForm.reset();
        showNotification('success', 'Categoría agregada correctamente.');
    } else {
        showNotification('error', 'Por favor, ingresa un nombre válido y asegúrate de que la categoría no exista ya.');
    }
});

resetBtn.addEventListener('click', () => {
    resetAll();
});

// Side Menu Event Listeners
menuToggle.addEventListener('click', () => {
    sideMenu.classList.add('open');
});

closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('open');
});

// Close side menu when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target == sideMenu) {
        sideMenu.classList.remove('open');
    }
});

// Synchronize Currency Selectors
function handleCurrencyChange(e, source) {
    selectedCurrency = e.target.value;
    currencySelector.value = selectedCurrency;
    currencySelectorMenu.value = selectedCurrency;
    saveData();
    updateSummary();
    renderLists();
    updateCharts();
}

// Attach event listeners to both currency selectors
currencySelector.addEventListener('change', (e) => handleCurrencyChange(e, 'header'));
currencySelectorMenu.addEventListener('change', (e) => handleCurrencyChange(e, 'menu'));

// Handle Export Button from Header
exportBtn.addEventListener('click', () => {
    exportBudget();
});

// Handle Export Button from Menu
exportBtnMenu.addEventListener('click', () => {
    exportBudget();
    sideMenu.classList.remove('open');
});

// Handle Import Button from Header
importBtn.addEventListener('click', () => {
    importFileInput.click();
});

// Handle Import Button from Menu
importBtnMenu.addEventListener('click', () => {
    importFileInput.click();
    sideMenu.classList.remove('open');
});

// Handle Reset Button from Header
resetBtn.addEventListener('click', () => {
    resetAll();
});

// Handle Reset Button from Menu
resetBtnMenu.addEventListener('click', () => {
    resetAll();
    sideMenu.classList.remove('open');
});

function exportBudget() {
    const exportData = {
        createdAt: new Date().toLocaleString('es-ES'),
        incomes,
        expenses,
        categories
    };
    let txtContent = '# Exportado por CaiDelSol\n';
    txtContent += `Fecha de Exportación: ${exportData.createdAt}\n\n`;

    txtContent += '## Ingresos\n';
    exportData.incomes.forEach(income => {
        txtContent += `- Nombre: ${income.name}\n  Monto: ${income.amount.toFixed(2)}\n  Fecha: ${income.date}\n  Color: ${income.color}\n\n`;
    });

    txtContent += '## Gastos\n';
    exportData.expenses.forEach(expense => {
        txtContent += `- Nombre: ${expense.name}\n  Monto: ${expense.amount.toFixed(2)}\n  Fecha: ${expense.date}\n  Categoría: ${expense.category}\n\n`;
    });

    txtContent += '## Categorías\n';
    exportData.categories.forEach(category => {
        txtContent += `- Nombre: ${category.name}\n  Color: ${category.color}\n  Predeterminada: ${category.isDefault}\n\n`;
    });

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presupuesto.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Presupuesto exportado correctamente.');
}

function importBudget(content) {
    if (!content.startsWith('# Exportado por CaiDelSol')) {
        showNotification('error', 'El archivo no es válido o no proviene de CaiDelSol.');
        return;
    }

    const lines = content.split('\n');

    if (lines.length < 2 || !lines[1].startsWith('Fecha de Exportación:')) {
        showNotification('error', 'El archivo no contiene la fecha de exportación.');
        return;
    }

    const exportDate = lines[1].replace('Fecha de Exportación:', '').trim();

    const sections = content.split('## ').slice(1);
    const newData = {};
    sections.forEach(section => {
        const [title, ...lines] = section.split('\n');
        newData[title.trim()] = lines.filter(line => line.trim() !== '');
    });

    if (!newData['Ingresos'] || !newData['Gastos'] || !newData['Categorías']) {
        showNotification('error', 'El archivo no contiene todas las secciones necesarias.');
        return;
    }

    const importedIncomes = [];
    newData['Ingresos'].forEach((line, index) => {
        if (line.startsWith('- Nombre:')) {
            const name = line.split(':')[1].trim();
            const montoLine = newData['Ingresos'][index + 1];
            const monto = parseFloat(montoLine.split(':')[1].trim());
            const fechaLine = newData['Ingresos'][index + 2];
            const fecha = fechaLine.split(':')[1].trim();
            const colorLine = newData['Ingresos'][index + 3];
            const color = colorLine.split(':')[1].trim();
            importedIncomes.push({ name, amount: monto, date: fecha, color });
        }
    });

    const importedExpenses = [];
    newData['Gastos'].forEach((line, index) => {
        if (line.startsWith('- Nombre:')) {
            const name = line.split(':')[1].trim();
            const montoLine = newData['Gastos'][index + 1];
            const monto = parseFloat(montoLine.split(':')[1].trim());
            const fechaLine = newData['Gastos'][index + 2];
            const fecha = fechaLine.split(':')[1].trim();
            const categoriaLine = newData['Gastos'][index + 3];
            const categoria = categoriaLine.split(':')[1].trim();
            importedExpenses.push({ name, amount: monto, date: fecha, category: categoria });
        }
    });

    const importedCategories = [];
    newData['Categorías'].forEach((line, index) => {
        if (line.startsWith('- Nombre:')) {
            const name = line.split(':')[1].trim();
            const colorLine = newData['Categorías'][index + 1];
            const color = colorLine.split(':')[1].trim();
            const isDefaultLine = newData['Categorías'][index + 2];
            const isDefault = isDefaultLine.split(':')[1].trim() === 'true';
            importedCategories.push({ name, color, isDefault });
        }
    });

    incomes = importedIncomes;
    expenses = importedExpenses;
    categories = importedCategories;
    selectedCurrency = 'USD'; // Reset to default or handle currency if needed
    currencySelector.value = selectedCurrency;
    currencySelectorMenu.value = selectedCurrency;
    saveData();
    renderLists();
    updateSummary();
    updateCharts();
    showNotification('success', 'Presupuesto importado correctamente.');
}

importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        importBudget(content);
    };
    reader.readAsText(file);
});

function resetAll() {
    const confirmReset = confirm('¿Estás seguro de que deseas reiniciar todo? Esto eliminará todos los ingresos, gastos y categorías personalizadas.');
    if (confirmReset) {
        incomes = [];
        expenses = [];
        categories = [...defaultCategories];
        selectedCurrency = 'USD';
        currencySelector.value = selectedCurrency;
        currencySelectorMenu.value = selectedCurrency;
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        showNotification('success', 'Todo ha sido reiniciado correctamente.');
    }
}

function initCharts() {
    expensesChart = new Chart(expensesChartCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Gastos por Categoría',
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4E342E',
                        font: {
                            family: 'var(--chart-font)',
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Gastos',
                    color: '#FF5722',
                    font: {
                        size: 18,
                        weight: '600',
                        family: 'var(--chart-font)'
                    }
                },
                tooltip: {
                    backgroundColor: '#FF9800',
                    titleColor: '#4E342E',
                    bodyColor: '#4E342E',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${currencySymbols[selectedCurrency]}${value.toFixed(2)}`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });

    incomesChart = new Chart(incomesChartCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Ingresos por Ingreso',
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4E342E',
                        font: {
                            family: 'var(--chart-font)',
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Ingresos',
                    color: '#FF5722',
                    font: {
                        size: 18,
                        weight: '600',
                        family: 'var(--chart-font)'
                    }
                },
                tooltip: {
                    backgroundColor: '#FF9800',
                    titleColor: '#4E342E',
                    bodyColor: '#4E342E',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${currencySymbols[selectedCurrency]}${value.toFixed(2)}`;
                        }
                    }
                }
            },
            layout: {
                padding: 20
            }
        }
    });

    stackedChart = new Chart(stackedChartCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [],
                    backgroundColor: '#4CAF50',
                    borderRadius: 5
                },
                {
                    label: 'Gastos',
                    data: [],
                    backgroundColor: '#F44336',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4E342E',
                        font: {
                            family: 'var(--chart-font)',
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Ingresos vs Gastos por Mes',
                    color: '#FF5722',
                    font: {
                        size: 18,
                        weight: '600',
                        family: 'var(--chart-font)'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Mes',
                        color: '#FF5722',
                        font: {
                            family: 'var(--chart-font)',
                            size: 14,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: '#4E342E',
                        maxRotation: 90,
                        minRotation: 45,
                        font: {
                            family: 'var(--chart-font)',
                            size: 12
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `Monto (${currencySymbols[selectedCurrency]})`,
                        color: '#FF5722',
                        font: {
                            family: 'var(--chart-font)',
                            size: 14,
                            weight: '600'
                        }
                    },
                    ticks: {
                        color: '#4E342E',
                        font: {
                            family: 'var(--chart-font)',
                            size: 12
                        },
                        callback: function(value) {
                            return `${currencySymbols[selectedCurrency]}${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });

    thermometerChart = new Chart(thermometerChartCtx, {
        type: 'bar',
        data: {
            labels: ['% Gastado'],
            datasets: [{
                label: '% Gastado',
                data: [0],
                backgroundColor: ['#FF5722'],
                borderRadius: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Porcentaje del Ingreso Gastado',
                    color: '#FF5722',
                    font: {
                        size: 18,
                        weight: '600',
                        family: 'var(--chart-font)'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x}%`;
                        }
                    },
                    backgroundColor: '#FF9800',
                    titleColor: '#4E342E',
                    bodyColor: '#4E342E'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#4E342E',
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            family: 'var(--chart-font)',
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Porcentaje',
                        color: '#FF5722',
                        font: {
                            family: 'var(--chart-font)',
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                y: {
                    ticks: {
                        color: '#4E342E',
                        font: {
                            family: 'var(--chart-font)',
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateCharts() {
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    expensesChart.data.labels = Object.keys(categoryTotals);
    expensesChart.data.datasets[0].data = Object.values(categoryTotals);
    expensesChart.data.datasets[0].backgroundColor = categories
        .filter(category => categoryTotals[category.name])
        .map(category => category.color);
    expensesChart.update();

    const incomeTotals = {};
    incomes.forEach(income => {
        if (incomeTotals[income.name]) {
            incomeTotals[income.name] += income.amount;
        } else {
            incomeTotals[income.name] = income.amount;
        }
    });

    incomesChart.data.labels = Object.keys(incomeTotals);
    incomesChart.data.datasets[0].data = Object.values(incomeTotals);
    incomesChart.data.datasets[0].backgroundColor = incomes.map(income => income.color);
    incomesChart.update();

    const incomePerMonth = {};
    incomes.forEach(income => {
        const month = new Date(income.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (incomePerMonth[month]) {
            incomePerMonth[month] += income.amount;
        } else {
            incomePerMonth[month] = income.amount;
        }
    });

    const expensePerMonth = {};
    expenses.forEach(expense => {
        const month = new Date(expense.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (expensePerMonth[month]) {
            expensePerMonth[month] += expense.amount;
        } else {
            expensePerMonth[month] = expense.amount;
        }
    });

    const allMonths = Array.from(new Set([...Object.keys(incomePerMonth), ...Object.keys(expensePerMonth)]))
        .sort((a, b) => new Date(a) - new Date(b));

    stackedChart.data.labels = allMonths;
    stackedChart.data.datasets[0].data = allMonths.map(month => incomePerMonth[month] || 0);
    stackedChart.data.datasets[1].data = allMonths.map(month => expensePerMonth[month] || 0);
    stackedChart.update();

    const totalIncome = incomes.reduce((acc, income) => acc + Number(income.amount), 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
    const percentageSpent = totalIncome ? Math.min(((totalExpenses / totalIncome) * 100).toFixed(2), 100) : 0;

    thermometerChart.data.datasets[0].data = [percentageSpent];
    thermometerChart.update();
}

function init() {
    loadData();
    initCharts();
    renderLists();
    updateSummary();
    updateCharts();
}

init();
