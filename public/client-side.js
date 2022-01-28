const generalInput = document.querySelector('#general-input');
const inputSelected = document.querySelector('#selected-option');
const btnSearch = document.querySelector('#btn-search');
const inputUpdateId = document.querySelector('#update-id-input');
const inputAddName = document.querySelector('#add-name-input');
const inputUpdateName = document.querySelector('#update-name-input');
const btnAddUser = document.querySelector('#btn-add-user');
const btnUpdate = document.querySelector('#btn-update');
const btnAddConfirm = document.querySelector('#btn-add-confirm');
const btnUpdateConfirm = document.querySelector('#btn-update-confirm');
const btnDelUser = document.querySelector('#btn-del-user');
const btnCloseAddForms = document.querySelector('#btn-in-close-add-forms');
const btnCloseUpdateForms = document.querySelector('#btn-in-close-update-forms');
const addUserForms = document.querySelector('#add-user-forms');
const updateUserForms = document.querySelector('#update-user-forms');

let pid = 0;
let minNumberOfCharToStartTrigger;

loadTableWithAllUsers();

btnAddUser.onclick = () => showForms('add');

btnUpdateConfirm.onclick = function () {
    const userToBeUpdated =
    {
        'id': inputUpdateId.value,
        'name': inputUpdateName.value,
    };
    if (userToBeUpdated.name) {
        updateUser(userToBeUpdated);
    } else {
        alert('Please fill in all fields!');
    }
}

btnUpdate.onclick = function () {
    if (inputSelected.value == 'id') {
        if (generalInput.value) {
            const userToBeUpdated = generalInput.value;
            fetch(`/search?id=${userToBeUpdated}`).then(resp => resp.text()).then(element => {
                element = JSON.parse(element);
                if (!element.error && parseInt(element[0].id) === parseInt(userToBeUpdated)) {
                    showForms('update');
                    inputUpdateId.value = element[0].id;
                    inputUpdateId.disabled = true;
                    inputUpdateName.value = element[0].name;
                } else {
                    alert('User not found!');
                }
            });
        } else {
            alert('Please enter a value to be updated!')
        }
    } else {
        alert('It is only possible to UPDATE by the ID parameter!');
    }
}

btnAddConfirm.onclick = function () {
    if (inputAddName.value) {
        saveNewUser();
    } else {
        alert('Please fill in all fields!');
    }
}

btnDelUser.onclick = () => {
    if (inputSelected.value == 'id') {
        if (generalInput.value) {
            deleteUser(generalInput.value);
        } else {
            alert('Please enter a value to be deleted!')
        }
    } else {
        alert('It is only possible to DELETE by the ID parameter!');
    }
};

btnCloseAddForms.innerHTML = "X";
btnCloseAddForms.onclick = function () { closeForms('add'); }

btnCloseUpdateForms.innerHTML = "X";
btnCloseUpdateForms.onclick = function () {
    closeForms('update');
    inputUpdateId.value = '';
    inputUpdateName.value = '';
}

inputSelected.onchange = function () {
    generalInput.value = "";
    if (inputSelected.value != "id") {
        generalInput.type = 'text';
    } else {
        generalInput.type = 'number';
    }
}

generalInput.addEventListener('input', function () {
    const inputName = inputSelected.value;

    if (inputName == "id") {
        minNumberOfCharToStartTrigger = 1;
    } else {
        minNumberOfCharToStartTrigger = 3;
    }
    triggersTheSearch(generalInput, filterByInputName);
});

btnSearch.onclick = function () {
    const inputName = inputSelected.value;
    const inputValue = generalInput.value;

    if (inputValue) {
        filterByInputName(inputValue, inputName);
    } else {
        alert("Digite algum valor!");
    }
}

function triggersTheSearch(_inputValue, _filterByInput) {
    const reqPart = _inputValue.value;
    const whatIsTheInputName = inputSelected.value;

    if (reqPart.length < minNumberOfCharToStartTrigger) {
        loadFirstLineTable();
        clearTimeout(pid);
        return;
    }

    clearTimeout(pid);

    pid = setTimeout(() => {
        _filterByInput(reqPart, whatIsTheInputName);
    }, 2000);
}

function filterByInputName(_inputValue, _inputName) {
    fetch(`/search?${_inputName}=${_inputValue}`).then(resp => resp.text()).then(element => {
        element = JSON.parse(element);
        loadFilteredTable(element);
    });
}

function saveNewUser() {
    const element = {};
    element.name = inputAddName.value;

    saveUserOnServer(element);
}

function saveUserOnServer(_element) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_element)
    };

    fetch('/save', requestOptions).then(resp => resp.text()).then(el => {
        el = JSON.parse(el);
        console.log(el);
        if (!el.error) {
            const addedUser = [];

            closeForms('add');
            addedUser.push(el)
            loadTableWithAllUsers();
            alert(`The user ${addedUser[0].id} has been added!`)
        } else {
            console.log('damn!');
        }
    });
}

function deleteUser(_userToBeDeleted) {
    const id = _userToBeDeleted;

    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: _userToBeDeleted })
    };

    fetch('/delete', requestOptions).then(resp => resp.text()).then(el => {
        el = JSON.parse(el);
        if (!el.error) {
            alert(`User ${el.id} has been deleted!`);
            loadTableWithAllUsers();
        } else {
            console.log('damn!');
        }
    });
}

function updateUser(_userToBeUpdated) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_userToBeUpdated)
    };

    fetch('/update', requestOptions).then(resp => resp.text()).then(el => {
        el = JSON.parse(el);
        console.log(el);
        if (!el.error) {
            const updatedUser = [];
            updatedUser.push(el);
            alert(`User ${el.id} has been Updated!`);
            closeForms('update');
            loadTableWithAllUsers();
        } else {
            console.log('damn!');
        }
    });
}

function loadTableWithAllUsers() {
    fetch('/produtos/all').then(resp => resp.text()).then(element => {
        element = JSON.parse(element);
        loadFilteredTable(element);
    });
}

function loadFilteredTable(_element) {
    loadFirstLineTable();

    if (!_element.error) {
        for (let i = 0; i < _element.length; i++) {
            const el = _element[i];
            document.querySelector("#table").innerHTML += `
            <tr>
            <td>${el.id}</td>
            <td>${el.name}</td>
            </tr>
            `;
        }
    } else {
        errorMsg(_element.msg);
    }
}

function loadFirstLineTable() {
    document.querySelector("#table").innerHTML = `
    <tr>
        <th>ID</th>
        <th>NAME</th>
    </tr>
    `;
}

function errorMsg(_str) {
    document.querySelector("#table").innerHTML += `
    <tr>
        <td></td>
        <td>${_str}</td>
    </tr>
    `;
}

function showForms(_addOrUpdateUser) {
    if (_addOrUpdateUser === 'add') {
        addUserForms.style.display = "block";
        addUserForms.style.visibility = "visible";
        addUserForms.style.opacity = "1";
    } else if (_addOrUpdateUser === 'update') {
        updateUserForms.style.display = "block";
        updateUserForms.style.visibility = "visible";
        updateUserForms.style.opacity = "1";
    }
}

function closeForms(_addOrUpdateUser) {
    if (_addOrUpdateUser === 'add') {
        addUserForms.style.visibility = "hidden";
        addUserForms.style.opacity = "0";
    } else if (_addOrUpdateUser === 'update') {
        updateUserForms.style.visibility = "hidden";
        updateUserForms.style.opacity = "0";
    }
}