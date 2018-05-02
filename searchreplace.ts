/**
 * Handle basic (core) functions related to search and replace
 * This is a content-script which attached to all tab pages to process its data
 * https://developer.chrome.com/extensions/overview#contentScripts
 */

// shorthand function definition
const RegExEscape = (text: string): string => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// doing handleReplace
const handleReplace = (inputs: NodeListOf<HTMLInputElement | HTMLTextAreaElement>, search: string, replace: string, matchCase: string) => {
  if (!inputs || !search)
    return;
  for (let i = 0; i < inputs.length; i++) {
    const item = inputs[i];
    item.value = item.value.replace(new RegExp(search, matchCase), replace);
  }
};

/**
 * Searching and replace
 * @param {string} search
 * @param {string} replace
 * @param {string} matchcase
 * @param {boolean} isInputOrTextareaOnly
 * @param {boolean} isUsingRegex
 * @constructor
 */
function SearchReplace(search: string, replace: string, matchcase: string, isInputOrTextareaOnly: boolean, isUsingRegex: boolean) {
  const iframes = document.querySelectorAll('iframe');
  const searchTerm = !isUsingRegex ? RegExEscape(search) : search;

  if (isInputOrTextareaOnly) {

    // Replace words in the current document
    const allInputs = document.getElementsByTagName('input');
    handleReplace(allInputs, searchTerm, replace, matchcase);

    const textAreas = document.getElementsByTagName('textarea');
    handleReplace(textAreas, searchTerm, replace, matchcase);

    // Replace words in iframes (input & textarea) if it has
    if (iframes && iframes.length) {
      for (let i = 0; i < iframes.length; i++) {
        const theIframe = iframes[i];
        if (theIframe.src.match('^http://' + window.location.host) || !theIframe.src.match('^https?')) {
          const iframeDocument = theIframe.contentDocument.documentElement;

          const iframeInputs = iframeDocument.getElementsByTagName('input');
          handleReplace(iframeInputs, searchTerm, replace, matchcase);

          const iframeTextAreas = iframeDocument.getElementsByTagName('textarea');
          handleReplace(iframeTextAreas, searchTerm, replace, matchcase);
        }
      }
    }
  }
  else {
    const body = document.getElementsByTagName('body')[0];
    body.innerHTML = body.innerHTML.replace(new RegExp(searchTerm, matchcase), replace);

    if (iframes) {
      for (let i = 0; i < iframes.length; i++) {
        const theIframe = iframes[i];
        if (theIframe.src.match('^http://' + window.location.host) || !theIframe.src.match('^https?')) {
          const content = theIframe.contentDocument.documentElement.innerHTML;
          theIframe.contentDocument.documentElement.innerHTML = content.replace(new RegExp(searchTerm, matchcase), replace);
        }
      }
      const allElements = document.getElementsByTagName("*");
      for (let i = 0; i < allElements.length; i++) {
        if (!allElements[i].tagName.match('/HEAD|SCRIPT|BODY|STYLE|IFRAME/')) {
          if (!allElements[i].innerHTML.match('<iframe([\s\S]*|.*)</iframe>')) {
            allElements[i].innerHTML = allElements[i].innerHTML.replace(new RegExp(searchTerm, matchcase), replace);
          }
        }
      }
    }
  }
}

function setLoading(status: boolean) {
  const body = document.getElementsByTagName('body')[0];
  if (status) {
    const loadingElem = document.createElement('div');
    loadingElem.id = 'gnm_loading_div';
    loadingElem.setAttribute('style', 'position:fixed;left: 0;top: 0;width: 100%;height: 100%;text-align: center;line-height: 75vh;background-color: #55555560;color: white;font-size: 2rem;z-index:99999;');
    loadingElem.innerHTML = 'Loading...';
    body.appendChild(loadingElem);
  }
  else {
    const loadingElem = document.getElementById('gnm_loading_div');
    if (loadingElem)
      body.removeChild(loadingElem);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  const {loading_status, search_for, replace_by, match_case, input_only, input_regrex} = message;

  if (!isNaN(loading_status)) {
    setLoading(loading_status);
  }

  if (search_for) {
    SearchReplace(search_for, replace_by, match_case, input_only, input_regrex);
  }
});
