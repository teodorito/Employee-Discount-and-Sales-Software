let employees = {};
let products = [];
let sales = [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('file-input-employees').addEventListener('change', handleEmployeeFile, false);
    document.getElementById('file-input-products').addEventListener('change', handleProductFile, false);
    document.getElementById('search-btn').addEventListener('click', searchProduct, false);
});

// Cargar empleados desde archivo Excel
function handleEmployeeFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            employees = json.slice(1).reduce((acc, row) => {
                acc[row[0]] = row[1];
                return acc;
            }, {});
            alert('Base de datos de empleados cargada');
        };
        reader.readAsArrayBuffer(file);
    }
}

// Cargar productos desde archivo Excel
function handleProductFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            products = json.slice(1).map(row => ({
                barcode: row[0], // Celda A: Código de barras
                name: row[1],    // Celda B: Nombre del producto
                price: row[2]    // Celda C: Precio del producto
            }));
            alert('Lista de precios cargada');
        };
        reader.readAsArrayBuffer(file);
    }
}

// Buscar productos
function searchProduct() {
    const searchValue = document.getElementById('product-search').value.toLowerCase().trim();

    // Filtrar productos por código de barras o nombre
    const filteredProducts = products.filter(product => {
        const barcodeMatch = product.barcode.toString().toLowerCase().includes(searchValue);
        const nameMatch = product.name.toLowerCase().includes(searchValue);
        return barcodeMatch || nameMatch;
    });

    // Limpiar la lista antes de agregar los resultados de búsqueda
    const select = document.getElementById('product-select');
    select.innerHTML = '';

    // Mostrar productos filtrados
    if (filteredProducts.length === 0) {
        alert('No se encontraron productos');
        return;
    }

    filteredProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.barcode;
        option.text = `${product.name} - $${product.price}`;
        select.add(option);
    });
}

function verifyEmployee() {
    const empNumber = document.getElementById('employee-number').value;
    const employeeName = employees[empNumber];
    document.getElementById('employee-name').innerText = employeeName ? `Nombre: ${employeeName}` : 'Empleado no encontrado';
}

function addSale() {
    const empNumber = document.getElementById('employee-number').value;
    const selectedOptions = Array.from(document.getElementById('product-select').selectedOptions);
    const selectedProducts = selectedOptions.map(option => {
        const product = products.find(p => p.barcode == option.value);
        return { ...product };
    });

    if (!employees[empNumber]) {
        alert('Empleado no encontrado');
        return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().split('T').join(' ').split('.')[0]; // Formato: YYYY-MM-DD HH:MM:SS

    selectedProducts.forEach(product => {
        sales.push({
            employeeNumber: empNumber,
            employeeName: employees[empNumber],
            productName: product.name,
            productPrice: product.price,
            date: formattedDate
        });
    });

    alert('Ventas añadidas');

    // Limpiar los datos
    document.getElementById('employee-number').value = '';
    document.getElementById('product-select').selectedIndex = -1;
    document.getElementById('employee-name').innerText = '';
}

function saveSales() {
    if (sales.length === 0) {
        alert('No hay ventas para guardar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sales);
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'ventas.xlsx');
}
