// script.js

// Selección de elementos del DOM
const budgetForm = document.getElementById('budget-form');
const expenseForm = document.getElementById('expense-form');
const categoryForm = document.getElementById('category-form');
const budgetList = document.getElementById('budget-list');
const expenseList = document.getElementById('expense-list');
const categoryList = document.getElementById('category-list');
const totalBudgetEl = document.getElementById('total-budget');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const expensesChartCtx = document.getElementById('expenses-chart').getContext('2d');
const incomesChartCtx = document.getElementById('incomes-chart').getContext('2d');
const stackedChartCtx = document.getElementById('stacked-chart').getContext('2d'); // Gráfico de Ingresos vs Gastos por Mes
const thermometerChartCtx = document.getElementById('thermometer-chart').getContext('2d'); // Gráfico de Porcentaje del Presupuesto Gastado
const expenseCategorySelect = document.getElementById('expense-category');
const resetBtn = document.getElementById('reset-btn');
const currencySelector = document.getElementById('currency-selector');

// Modales
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

const editBudgetModal = document.getElementById('edit-budget-modal');
const closeBudgetModal = document.getElementById('close-budget-modal');
const editBudgetForm = document.getElementById('edit-budget-form');
const editBudgetIndex = document.getElementById('edit-budget-index');
const editBudgetName = document.getElementById('edit-budget-name');
const editBudgetAmount = document.getElementById('edit-budget-amount');
const editBudgetDate = document.getElementById('edit-budget-date');
const editBudgetColor = document.getElementById('edit-budget-color');

// Datos por defecto
const defaultCategories = [
    { name: 'Alimentación', color: '#FFB74D', isDefault: true },
    { name: 'Transporte', color: '#FF9800', isDefault: true },
    { name: 'Entretenimiento', color: '#FFA726', isDefault: true },
    { name: 'Salud', color: '#FB8C00', isDefault: true },
    { name: 'Otros', color: '#FFCC80', isDefault: true }
];

// Variables para almacenar datos
let budgets = [];
let expenses = [];
let categories = [];
let selectedCurrency = 'USD';

// Símbolos de moneda
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'ARS': '$',
    'PEN': 'S/'
};

// Instancias de Chart.js
let expensesChart;
let incomesChart;
let stackedChart;
let thermometerChart;

// Función para cargar datos desde LocalStorage
function loadData() {
    const storedBudgets = localStorage.getItem('budgets');
    const storedExpenses = localStorage.getItem('expenses');
    const storedCategories = localStorage.getItem('categories');
    const storedCurrency = localStorage.getItem('currency');
    budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
    categories = storedCategories ? JSON.parse(storedCategories) : defaultCategories;
    selectedCurrency = storedCurrency ? storedCurrency : 'USD';
    currencySelector.value = selectedCurrency;
}

// Función para guardar datos en LocalStorage
function saveData() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('currency', selectedCurrency);
}

// Función para actualizar el resumen
function updateSummary() {
    const totalBudget = budgets.reduce((acc, budget) => acc + Number(budget.amount), 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
    const balance = totalBudget - totalExpenses;

    totalBudgetEl.textContent = `${currencySymbols[selectedCurrency]}${totalBudget.toFixed(2)}`;
    totalExpensesEl.textContent = `${currencySymbols[selectedCurrency]}${totalExpenses.toFixed(2)}`;
    balanceEl.textContent = `${currencySymbols[selectedCurrency]}${balance.toFixed(2)}`;
}

// Función para renderizar las listas
function renderLists() {
    // Renderizar presupuestos
    budgetList.innerHTML = '';
    budgets.forEach((budget, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${budget.name}: ${currencySymbols[selectedCurrency]}${Number(budget.amount).toFixed(2)}</span>
            <div>
                <button class="edit-btn" data-type="budget" data-index="${index}"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-btn" data-type="budget" data-index="${index}"><i class="fas fa-trash-alt"></i> Eliminar</button>
            </div>
        `;
        budgetList.appendChild(li);
    });

    // Renderizar gastos
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

    // Renderizar categorías
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

    // Agregar eventos a los botones de eliminar y editar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteItem);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', openEditModal);
    });
}

// Función para formatear fechas
function formatDate(dateStr) {
    if (!dateStr) return 'Sin fecha';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
}

// Función para poblar el select de categorías en gastos
function populateCategorySelect() {
    expenseCategorySelect.innerHTML = '<option value="" disabled selected>Selecciona Categoría</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        expenseCategorySelect.appendChild(option);
    });
}

// Función para poblar el select de categorías en el modal de edición de gastos
function populateEditExpenseCategorySelect() {
    editExpenseCategorySelect.innerHTML = '<option value="" disabled selected>Selecciona Categoría</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        editExpenseCategorySelect.appendChild(option);
    });
}

// Función para eliminar elementos
function deleteItem(e) {
    const type = e.target.closest('button').getAttribute('data-type');
    const index = e.target.closest('button').getAttribute('data-index');

    if (type === 'budget') {
        budgets.splice(index, 1);
    } else if (type === 'expense') {
        expenses.splice(index, 1);
    } else if (type === 'category') {
        const categoryName = categories[index].name;
        const hasExpenses = expenses.some(expense => expense.category === categoryName);
        if (hasExpenses) {
            alert('No puedes eliminar una categoría que tiene gastos asociados.');
            return;
        }
        categories.splice(index, 1);
    }

    saveData();
    renderLists();
    updateSummary();
    updateCharts();
}

// Función para abrir el modal de edición
function openEditModal(e) {
    const type = e.target.closest('button').getAttribute('data-type');
    const index = e.target.closest('button').getAttribute('data-index');

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
        editExpenseAmount.value = expense.amount;
        editExpenseDate.value = expense.date;
        editExpenseCategorySelect.value = expense.category;
        editExpenseModal.style.display = 'block';
    } else if (type === 'budget') {
        const budget = budgets[index];
        editBudgetIndex.value = index;
        editBudgetName.value = budget.name;
        editBudgetAmount.value = budget.amount;
        editBudgetDate.value = budget.date;
        editBudgetColor.value = budget.color;
        editBudgetModal.style.display = 'block';
    }
}

// Cerrar modales al hacer clic en la "X"
closeCategoryModal.onclick = () => {
    editCategoryModal.style.display = 'none';
};

closeExpenseModal.onclick = () => {
    editExpenseModal.style.display = 'none';
};

closeBudgetModal.onclick = () => {
    editBudgetModal.style.display = 'none';
};

// Cerrar modales al hacer clic fuera del contenido del modal
window.onclick = (event) => {
    if (event.target == editCategoryModal) {
        editCategoryModal.style.display = 'none';
    }
    if (event.target == editExpenseModal) {
        editExpenseModal.style.display = 'none';
    }
    if (event.target == editBudgetModal) {
        editBudgetModal.style.display = 'none';
    }
};

// Eventos para los formularios de edición
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
    } else {
        alert('Por favor, ingresa un nombre válido y asegúrate de que la categoría no exista ya.');
    }
});

editExpenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = editExpenseIndex.value;
    const name = editExpenseName.value.trim();
    const amount = editExpenseAmount.value.trim();
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
    } else {
        alert('Por favor, completa todos los campos con valores válidos.');
    }
});

editBudgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const index = editBudgetIndex.value;
    const name = editBudgetName.value.trim();
    const amount = editBudgetAmount.value.trim();
    const date = editBudgetDate.value;
    const color = editBudgetColor.value;

    if (name && amount && date && color && !isNaN(amount) && Number(amount) > 0) {
        budgets[index].name = name;
        budgets[index].amount = Number(amount);
        budgets[index].date = date;
        budgets[index].color = color;
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        editBudgetModal.style.display = 'none';
    } else {
        alert('Por favor, completa todos los campos con valores válidos.');
    }
});

// Eventos para los formularios principales
budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('budget-name').value.trim();
    const amount = document.getElementById('budget-amount').value.trim();
    const date = document.getElementById('budget-date').value;
    const color = document.getElementById('budget-color').value;

    if (name && amount && date && color && !isNaN(amount) && Number(amount) > 0) {
        budgets.push({ name, amount: Number(amount), date, color });
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        budgetForm.reset();
    } else {
        alert('Por favor, ingresa un nombre válido, monto positivo, selecciona una fecha y un color.');
    }
});

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('expense-name').value.trim();
    const amount = document.getElementById('expense-amount').value.trim();
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;

    if (name && amount && date && category && !isNaN(amount) && Number(amount) > 0) {
        expenses.push({ name, amount: Number(amount), date, category });
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
        expenseForm.reset();
    } else {
        alert('Por favor, completa todos los campos con valores válidos.');
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
    } else {
        alert('Por favor, ingresa un nombre válido y asegúrate de que la categoría no exista ya.');
    }
});

// Evento para reiniciar todos los datos
resetBtn.addEventListener('click', () => {
    const confirmReset = confirm('¿Estás seguro de que deseas reiniciar todo? Esto eliminará todos los presupuestos, gastos y categorías personalizadas.');
    if (confirmReset) {
        budgets = [];
        expenses = [];
        categories = [...defaultCategories];
        selectedCurrency = 'USD';
        currencySelector.value = selectedCurrency;
        saveData();
        renderLists();
        updateSummary();
        updateCharts();
    }
});

// Evento para cambiar la moneda
currencySelector.addEventListener('change', (e) => {
    selectedCurrency = e.target.value;
    saveData();
    updateSummary();
    renderLists();
    updateCharts();
});

// Función para inicializar los gráficos
function initCharts() {
    // Gráfico de Gastos (Pie)
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
            maintainAspectRatio: false, // Permite que el gráfico ocupe todo el contenedor
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#3E2723'
                    }
                },
                title: {
                    display: true,
                    text: 'Gastos',
                    color: '#D84315',
                    font: {
                        size: 18,
                        weight: '600'
                    }
                },
                tooltip: {
                    backgroundColor: '#FFB74D',
                    titleColor: '#3E2723',
                    bodyColor: '#3E2723'
                }
            }
        }
    });

    // Gráfico de Ingresos (Pie)
    incomesChart = new Chart(incomesChartCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                label: 'Ingresos por Presupuesto',
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que el gráfico ocupe todo el contenedor
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#3E2723'
                    }
                },
                title: {
                    display: true,
                    text: 'Ingresos',
                    color: '#D84315',
                    font: {
                        size: 18,
                        weight: '600'
                    }
                },
                tooltip: {
                    backgroundColor: '#FFB74D',
                    titleColor: '#3E2723',
                    bodyColor: '#3E2723'
                }
            }
        }
    });

    // Gráfico de Pila Vertical (Ingresos vs Gastos por Mes) - Aumentado en altura y más delgado
    stackedChart = new Chart(stackedChartCtx, {
        type: 'bar',
        data: {
            labels: [], // Meses
            datasets: [
                {
                    label: 'Ingresos',
                    data: [],
                    backgroundColor: '#D84315'
                },
                {
                    label: 'Gastos',
                    data: [],
                    backgroundColor: '#FFB74D'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que el gráfico ocupe todo el contenedor
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#3E2723'
                    }
                },
                title: {
                    display: true,
                    text: 'Ingresos vs Gastos por Mes',
                    color: '#D84315',
                    font: {
                        size: 18,
                        weight: '600'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Mes',
                        color: '#D84315'
                    },
                    ticks: {
                        color: '#3E2723',
                        maxRotation: 90,
                        minRotation: 45
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `Monto (${currencySymbols[selectedCurrency]})`,
                        color: '#D84315'
                    },
                    ticks: {
                        color: '#3E2723'
                    }
                }
            }
        }
    });

    // Gráfico Termómetro (Porcentaje del Presupuesto Gastado) - Más largo sin aumentar altura
    thermometerChart = new Chart(thermometerChartCtx, {
        type: 'bar',
        data: {
            labels: ['% Gastado'],
            datasets: [{
                label: '% Gastado',
                data: [0],
                backgroundColor: ['#D84315'],
                borderRadius: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false, // Permite que el gráfico ocupe todo el contenedor
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Porcentaje del Presupuesto Gastado',
                    color: '#D84315',
                    font: {
                        size: 18,
                        weight: '600'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x}%`;
                        }
                    },
                    backgroundColor: '#FFB74D',
                    titleColor: '#3E2723',
                    bodyColor: '#3E2723'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#3E2723',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Porcentaje',
                        color: '#D84315'
                    }
                },
                y: {
                    ticks: {
                        color: '#3E2723'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Función para actualizar los gráficos
function updateCharts() {
    // Actualizar Gráfico de Gastos
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

    // Actualizar Gráfico de Ingresos
    const incomeTotals = {};
    budgets.forEach(budget => {
        if (incomeTotals[budget.name]) {
            incomeTotals[budget.name] += budget.amount;
        } else {
            incomeTotals[budget.name] = budget.amount;
        }
    });

    incomesChart.data.labels = Object.keys(incomeTotals);
    incomesChart.data.datasets[0].data = Object.values(incomeTotals);
    incomesChart.data.datasets[0].backgroundColor = budgets.map(budget => budget.color);
    incomesChart.update();

    // Actualizar Gráfico de Pila Vertical (Ingresos vs Gastos por Mes)
    const incomePerMonth = {};
    budgets.forEach(budget => {
        const month = new Date(budget.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (incomePerMonth[month]) {
            incomePerMonth[month] += budget.amount;
        } else {
            incomePerMonth[month] = budget.amount;
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

    // Actualizar Gráfico Termómetro
    const totalBudget = budgets.reduce((acc, budget) => acc + Number(budget.amount), 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
    const percentageSpent = totalBudget ? Math.min(((totalExpenses / totalBudget) * 100).toFixed(2), 100) : 0;

    thermometerChart.data.datasets[0].data = [percentageSpent];
    thermometerChart.update();
}

// Función de inicialización
function init() {
    loadData();
    initCharts();
    renderLists();
    updateSummary();
    updateCharts();
}

// Ejecutar la función de inicialización al cargar la página
init();
