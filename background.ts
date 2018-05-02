/**
 * Handles logic of messaging in Chrome, working in background of chrome,
 * while searchreplace works in real web pages
 * Send Message
 * Receive Message and process it
 * https://developer.chrome.com/apps/messaging
 */
import {ISearchReplace} from "./ISearchReplace";

// send Message loading_status to Tab
const sendMessageLoadingStatus = (tabId, status) => chrome.tabs.sendMessage(tabId, {loading_status: status});

// listening for messages sending from the Popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.search_replace) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      const tabId = tabs[0].id;
      chrome.tabs.executeScript(tabId, {file: 'searchreplace.js'}, () => {
        chrome.storage.sync.get(['srFields', 'isMatchCase', 'isInputFieldOnly', 'isRegexUsing'],
          ({srFields, isMatchCase, isInputFieldOnly, isRegexUsing}) => {
            // check if there is Search-n-Replace and at least 1 is selected
            if (srFields
              && srFields
                .map((item: ISearchReplace) => item.isActive)
                .reduce((prev, curr) => prev || curr, false)) {
              sendMessageLoadingStatus(tabId, true);
              let count = 0;

              // Action after append Loading
              setTimeout(() => {
                for (let i = 0; i < srFields.length; i++) {
                  const srField: ISearchReplace = srFields[i];
                  if (!srField.isActive)
                    continue;
                  count++;
                  chrome.tabs.sendMessage(
                    tabId,
                    {
                      search_for: srField.searchValue,
                      replace_by: srField.replaceValue,
                      match_case: isMatchCase,
                      input_only: isInputFieldOnly,
                      input_regrex: isRegexUsing,
                    },
                    () => {
                      count--;
                      if (count === 0) {
                        sendMessageLoadingStatus(tabId, false);
                        chrome.runtime.sendMessage({popup_should_close: true});
                      }
                    });
                }
              }, 10);
            }
            else {
              alert('There is no valid Search-n-Replace. Please enable at least 1 Search-Replace to continue.')
            }
          });
      });
    });
  }
});
