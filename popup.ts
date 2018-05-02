/**
 * Functions responsible to process in layout (UI)
 * i.e., button click event handle
 */
import {ISearchReplace} from "./ISearchReplace";

// Restore all Search and handleReplace's values from Chrome Storage to the UI
function restoreSearchReplace() {
  chrome.storage.sync.get(['srFields', 'isMatchCase', 'isInputFieldOnly', 'isRegexUsing'],
    ({srFields, isMatchCase, isInputFieldOnly, isRegexUsing}) => {
      if (srFields) {

        // adding enough fields for filling stored data
        while (document.getElementsByClassName('data_field search').length < srFields.length) {
          addNewField();
        }

        const selectedChecks = document.getElementsByClassName('selected_check');
        const inputSearches = document.getElementsByClassName('data_field search');
        const inputReplaces = document.getElementsByClassName('data_field replace');

        srFields.map((item, index) => {
          (<HTMLInputElement> selectedChecks[index]).checked = item.isActive;
          (<HTMLInputElement> inputSearches[index]).value = item.searchValue;
          (<HTMLInputElement> inputReplaces[index]).value = item.replaceValue;
        });
      }

      const isMatchCaseElem = <HTMLInputElement> document.getElementById('idIsMatchCase');
      isMatchCaseElem.checked = isMatchCase == 'g';

      const isInputFieldOnlyElem = <HTMLInputElement> document.getElementById('idIsInputFieldOnly');
      isInputFieldOnlyElem.checked = isInputFieldOnly;

      const isRegexUsingElem = <HTMLInputElement> document.getElementById('idIsRegexUsing');
      isRegexUsingElem.checked = isRegexUsing;

    });
}

// Store all Search and handleReplace's values
const storeSearchReplace = () => {
  const srFields: ISearchReplace[] = [];

  // Collect values of Search & Replaces
  const selectedChecks = document.getElementsByClassName('selected_check');
  for (let i = 0; i < selectedChecks.length; i++) {
    const item = <HTMLInputElement> selectedChecks[i];
    try {
      const parent = item.parentElement.parentElement;

      const inputSearch = <HTMLInputElement> parent.getElementsByClassName('data_field search')[0];
      const inputReplace = <HTMLInputElement> parent.getElementsByClassName('data_field replace')[0];

      srFields.push({isActive: item.checked, searchValue: inputSearch.value, replaceValue: inputReplace.value});

    } catch (e) {
      console.error('There is something wrong, please completely remove Field and Add new one.')
    }
  }

  // Collect configurations of using MatchCase, Input Fields only, and Regex
  const isMatchCaseElem = <HTMLInputElement> document.getElementById('idIsMatchCase');
  const isMatchCase = isMatchCaseElem.checked ? 'g' : 'gi';

  const isInputFieldOnlyElem = <HTMLInputElement> document.getElementById('idIsInputFieldOnly');

  const isRegexUsingElem = <HTMLInputElement> document.getElementById('idIsRegexUsing');

  // sorting srFields by isActive field
  srFields.sort((a, b) => Number(b.isActive) - Number(a.isActive));

  // store collected data to Chrome storage
  chrome.storage.sync.set({
    srFields,
    isMatchCase,
    'isInputFieldOnly': isInputFieldOnlyElem.checked,
    'isRegexUsing': isRegexUsingElem.checked
  });
};

//Add new fields of Search & handleReplace
function addNewField() {
  const numberOfSearchFields = document.getElementsByClassName('data_field search').length + 1;
  const tr = document.createElement('tr');

  const td0 = document.createElement('td');
  td0.innerText = numberOfSearchFields.toString();

  const td1 = document.createElement('td');
  td1.innerHTML = '<input class="selected_check" name="selected_field_' + numberOfSearchFields + '" id="selected_field_' + numberOfSearchFields + '" type="checkbox">';

  const td2 = document.createElement('td');
  td2.innerHTML = '<span class="clearable">' +
    '<input class="form-control data_field search" name="search_' + numberOfSearchFields + '" id="search_' + numberOfSearchFields + '">' +
    '<span class="icon_clear" id="search_icon_clear_' + numberOfSearchFields + '">x</span>' +
    '</span>';

  const td3 = document.createElement('td');
  td3.innerHTML = '<span class="clearable">' +
    '<input class="form-control data_field replace" name="replace_' + numberOfSearchFields + '" id="replace_' + numberOfSearchFields + '">' +
    '<span class="icon_clear" id="replace_icon_clear_' + numberOfSearchFields + '">x</span>' +
    '</span>';

  const td4 = document.createElement('td');
  td4.setAttribute('class', 'text-center');
  td4.innerHTML = '<button class="btn btn_remove">x</button>';

  tr.appendChild(td0);
  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  const tbl = document.getElementById('tbl_fields');
  const tbodies = tbl.getElementsByTagName('tbody');
  if (tbodies && tbodies.length > 0) {
    const tbody = tbodies[0];
    tbody.appendChild(tr);

    setupHandlerInputCleared();
    setupHandlerInputChanged();
    setupHandlerInputRemoved();
    setupHandlerInputSelected();
  }
}

// 1. Handler of Checkbox of using Search & Replace inputs
function setupHandlerInputSelected() {
  const selectedChecks = document.getElementsByClassName('selected_check');
  for (let i = 0; i < selectedChecks.length; i++) {
    const item = selectedChecks[i];
    item.addEventListener('change', storeSearchReplace);
  }
}

// 2. Handler of input fields changing event
function setupHandlerInputChanged() {
  const dataFields = document.getElementsByClassName('data_field');
  for (let i = 0; i < dataFields.length; i++) {
    const item = dataFields[i];
    item.addEventListener('change', storeSearchReplace);
  }
}

// 3. Handler of clear icon click functions
function setupHandlerInputCleared() {
  const clearBtns = document.getElementsByClassName('icon_clear');
  for (let i = 0; i < clearBtns.length; i++) {
    clearBtns[i].addEventListener('click', event => {
      const itsInput = <HTMLInputElement> event.srcElement.previousElementSibling;
      itsInput.value = '';
      storeSearchReplace();
    })
  }
}

// 4. Handler of Remove Button click functions
function setupHandlerInputRemoved() {
  const removeBtns = document.getElementsByClassName('btn_remove');
  for (let i = 0; i < removeBtns.length; i++) {
    removeBtns[i].addEventListener('click', event => {
      event.srcElement.parentElement.parentElement.remove();
      storeSearchReplace();
    });
  }
}

function setupHandlerOptionChecks() {
  const optionChecks = document.getElementsByClassName('option_check');
  for (let i = 0; i < optionChecks.length; i++) {
    const item = optionChecks[i];
    item.addEventListener('change', storeSearchReplace);
  }
}

function setupHandlerAddField() {
  const btnAddField = document.getElementById('btn_add_field');
  btnAddField.addEventListener('click', () => addNewField());
}

function setupHandlerSearchAndReplace() {
  const btnGo = document.getElementById('btn_go');
  btnGo.addEventListener('click', () => {
    // send message to notify in background (background.js)
    chrome.runtime.sendMessage({search_replace: true});
  });
}

// intial setup =======================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupHandlerAddField();
  setupHandlerSearchAndReplace();

  setupHandlerInputSelected();
  setupHandlerInputChanged();
  setupHandlerInputCleared();
  setupHandlerInputRemoved();

  setupHandlerOptionChecks();

  // doing Restore
  restoreSearchReplace();

// listening for message sent from background (search & replace job done, the popup UI should be closed)
  chrome.runtime.onMessage.addListener(({popup_should_close}) => popup_should_close && window.close());
});
