Demo: [B Words Replacer](https://chrome.google.com/webstore/detail/b-words-replacer/efcnkaeocmkpckkenjinmdgkbjhajoca)

# Compiling for Runable Extension
Compile to runnable files of Chrome Extension
* ts --> js
* pug --> html
* scss --> css

# Setup Dev Environment
* Yarn
* Yarn `ts:c` or `ts:w` for typescript compilation
* Yarn `pug:b` or `pug:w` for Pug compilation
* scss --> css (manually or by FileWatcher in IDE)

# Misc.
* background.ts reponsible for communication (messaging) between the Extension UI and the web page UI
* Extension UI is *popup.html* and *popup.js*
* Web page content script is handled in *searchreplace.js*

`popup.js (popup, UI) <---> background.js (messaging) <---> searchreplace.js (functions)`
