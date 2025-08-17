document.addEventListener('DOMContentLoaded', () => {
    const dataTableContainer = document.getElementById('data-table-container');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const addNewRecordBtn = document.getElementById('addNewRecordBtn');
    const addRecordForm = document.getElementById('add-record-form');
    const formFieldsContainer = document.getElementById('form-fields-container');
    const submitNewRecordBtn = document.getElementById('submitNewRecordBtn');
    const cancelNewRecordBtn = document.getElementById('cancelNewRecordBtn');
    const paginationControls = document.getElementById('pagination-controls');

    let currentData = []; // All data (not paginated or filtered)
    let dataHeaders = []; // To store column headers

    let currentPage = 1;
    const recordsPerPage = 25;
    let totalRecords = 0; // Total records from the backend (for pagination)

    const fetchData = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: recordsPerPage
            });

            const response = await fetch(`/data?${params.toString()}`);
            const result = await response.json();

            currentData = result.data; // This is now the paginated data
            totalRecords = result.total_records; // Total records

            if (currentData.length > 0 && dataHeaders.length === 0) {
                dataHeaders = Object.keys(currentData[0]);
            }

            renderTable(currentData);
            renderPagination();
        } catch (error) {
            console.error('Error fetching data:', error);
            dataTableContainer.innerHTML = '<p>Error loading data.</p>';
        }
    };

    const renderTable = (data) => {
        if (data.length === 0) {
            dataTableContainer.innerHTML = '<p>No data available.</p>';
            return;
        }

        let tableHTML = '<table><thead><tr>';
        const columnOrder = ['ID', 'activa', 'categoria', 'pregunta', 'respuesta', 'rango_max', 'rango_min', 'informacion', 'fuente'];

        columnOrder.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '<th>Actions</th></tr></thead><tbody>';

        data.forEach((row, index) => {
            const originalIndex = (currentPage - 1) * recordsPerPage + index;

            let rowClass = '';
            // Check for inactive records (assuming 'estado' column)
            if (row.estado && row.estado.toLowerCase() === 'no activa') {
                rowClass += ' inactive-record';
            }

            // Check for records with empty cells (simple check for now)
            const hasEmptyCell = Object.values(row).some(value => value === null || value === '' || value === undefined);
            if (hasEmptyCell) {
                rowClass += ' empty-cell-record';
            }

            tableHTML += `<tr data-id="${originalIndex}" class="${rowClass.trim()}">`;
            columnOrder.forEach(header => {
                let cellClass = '';
                if (header.toLowerCase() === 'respuesta') {
                    cellClass = 'respuesta-column';
                }
                tableHTML += `<td class="${cellClass}" data-field="${header}">${row[header]}</td>`;
            });
            tableHTML += `
                <td class="action-buttons">
                    <button class="edit-btn" data-original-index="${originalIndex}" title="Edit"><i class="icon-edit">&#9998;</i></button>
                    <button class="delete-btn" data-original-index="${originalIndex}" title="Delete"><i class="icon-delete">&#128465;</i></button>
                </td>
            </tr>`;
        });

        tableHTML += '</tbody></table>';
        dataTableContainer.innerHTML = tableHTML;

        attachTableEventListeners();
    };

    const attachTableEventListeners = () => {
        dataTableContainer.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = () => editRow(parseInt(button.dataset.originalIndex));
        });
        dataTableContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = () => deleteRow(parseInt(button.dataset.originalIndex));
        });
    };

    window.editRow = (index) => {
        const rowElement = document.querySelector(`tr[data-id="${index}"]`);
        if (!rowElement) return;

        const cells = rowElement.querySelectorAll('td[data-field]');
        cells.forEach(cell => {
            const field = cell.dataset.field;
            const currentValue = cell.textContent;
            cell.innerHTML = `<input type="text" class="edit-input" data-field="${field}" value="${currentValue}">`;
        });

        const actionButtonsCell = rowElement.querySelector('.action-buttons');
        actionButtonsCell.innerHTML = `
            <button class="save-btn" onclick="saveRow(${index})" title="Save"><i class="icon-save">&#128190;</i></button>
            <button class="cancel-btn" onclick="cancelEdit(${index}, ${JSON.stringify(currentData[index])})" title="Cancel"><i class="icon-cancel">&#10060;</i></button>
        `;
    };

    window.saveRow = async (index) => {
        const rowElement = document.querySelector(`tr[data-id="${index}"]`);
        if (!rowElement) return;

        const inputs = rowElement.querySelectorAll('.edit-input');
        const updatedRecord = {};
        inputs.forEach(input => {
            updatedRecord[input.dataset.field] = input.value;
        });

        try {
            const response = await fetch(`/data/${index}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedRecord),
            });
            if (response.ok) {
                await fetchData(); // Re-fetch and re-render to ensure data consistency
            } else {
                console.error('Failed to update record');
                alert('Failed to update record.');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data.');
        }
    };

    window.cancelEdit = (index, originalRecord) => {
        fetchData();
    };

    window.deleteRow = async (index) => {
        if (!confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            const response = await fetch(`/data/${index}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchData(); // Re-fetch and re-render to ensure data consistency
            } else {
                console.error('Failed to delete record');
                alert('Failed to delete record.');
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            alert('Error deleting data.');
        }
    };

    // Add New Record functionality
    addNewRecordBtn.addEventListener('click', () => {
        addRecordForm.style.display = 'block';
        formFieldsContainer.innerHTML = ''; // Clear previous fields
        dataHeaders.forEach(header => {
            formFieldsContainer.innerHTML += `
                <label for="new-${header}">${header}:</label><br>
                <input type="text" id="new-${header}" name="${header}" class="edit-input"><br><br>
            `;
        });
    });

    submitNewRecordBtn.addEventListener('click', async () => {
        const newRecord = {};
        dataHeaders.forEach(header => {
            const inputElement = document.getElementById(`new-${header}`);
            if (inputElement) {
                newRecord[header] = inputElement.value;
            }
        });

        try {
            const response = await fetch('/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecord),
            });
            if (response.ok) {
                addRecordForm.style.display = 'none'; // Hide form
                currentPage = 1; // Go to first page after adding
                await fetchData(); // Re-fetch and re-render
            } else {
                console.error('Failed to add new record');
                alert('Failed to add new record.');
            }
        } catch (error) {
            console.error('Error adding new record:', error);
            alert('Error adding new record.');
        }
    });

    cancelNewRecordBtn.addEventListener('click', () => {
        addRecordForm.style.display = 'none';
    });

    exportJsonBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/export');
            const jsonData = await response.json();
            const dataStr = JSON.stringify(jsonData, null, 4);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'casicasi_data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting JSON:', error);
            alert('Error exporting JSON.');
        }
    });

    // Pagination functions
    const renderPagination = () => {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        if (totalPages <= 1) return;

        const createButton = (text, page, isDisabled) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.disabled = isDisabled;
            button.onclick = () => {
                currentPage = page;
                fetchData();
            };
            return button;
        };

        paginationControls.appendChild(createButton('Previous', currentPage - 1, currentPage === 1));

        const maxPageButtons = 5; // Number of page buttons to display
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
            paginationControls.appendChild(createButton(1, 1, false));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 5px';
                paginationControls.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const button = createButton(i, i, currentPage === i);
            if (currentPage === i) {
                button.style.fontWeight = 'bold';
            }
            paginationControls.appendChild(button);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.margin = '0 5px';
                paginationControls.appendChild(ellipsis);
            }
            paginationControls.appendChild(createButton(totalPages, totalPages, false));
        }

        paginationControls.appendChild(createButton('Next', currentPage + 1, currentPage === totalPages));
    };

    // Initial data fetch
    fetchData();
});