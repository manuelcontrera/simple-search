// ==UserScript==
// @name           Simple Search
// @description    Universal Shift+Space shortcut to open tab search (%) in the URL bar
// @author         manuelcontrera
// @version        1.0.0
// ==/UserScript==

(function TabSearchShortcut() {
  "use strict";

  // Pref keys used by this mod
  const PREF_SHORTCUT_KEY  = "tabsearchshortcut.key";
  const PREF_USE_SHIFT     = "tabsearchshortcut.useShift";
  const PREF_USE_CTRL      = "tabsearchshortcut.useCtrl";
  const PREF_USE_ALT       = "tabsearchshortcut.useAlt";

  /**
   * Read a pref, returning `fallback` if the pref doesn't exist yet.
   */
  function getPref(key, fallback) {
    try {
      const type = Services.prefs.getPrefType(key);
      if (type === Services.prefs.PREF_STRING)  return Services.prefs.getStringPref(key);
      if (type === Services.prefs.PREF_BOOL)    return Services.prefs.getBoolPref(key);
      if (type === Services.prefs.PREF_INT)     return Services.prefs.getIntPref(key);
    } catch (e) {}
    return fallback;
  }

  /**
   * Returns true when the keyboard event matches the configured shortcut.
   * Defaults: Shift + Space  (no Ctrl, no Alt)
   */
  function isShortcutMatch(e) {
    const configKey   = getPref(PREF_SHORTCUT_KEY, " ");   // " " = Space
    const needShift   = getPref(PREF_USE_SHIFT,    true);
    const needCtrl    = getPref(PREF_USE_CTRL,     false);
    const needAlt     = getPref(PREF_USE_ALT,      false);

    // e.key for Space is " ", for letters is the letter itself
    return (
      e.key       === configKey  &&
      e.shiftKey  === needShift  &&
      e.ctrlKey   === needCtrl   &&
      e.altKey    === needAlt
    );
  }

  /**
   * Core action: focus the URL bar, insert "% " so Firefox switches to
   * tab-search mode, and positions the cursor ready for typing.
   *
   * The sequence mirrors what happens manually when a user clicks the
   * address bar and types "% " — Firefox then filters all open tabs
   * across every workspace/container.
   */
  function openTabSearch(win) {
    const urlBar = win.gURLBar;
    if (!urlBar) return;

    // 1. Open the URL bar in search mode (equivalent to clicking it)
    urlBar.focus();

    // 2. Enter tab-search mode by setting the search string to "% "
    //    setSearchMode is the official Fx API for switching heuristic modes.
    if (urlBar.setSearchMode) {
      urlBar.setSearchMode({
        engineName: null,
        entry: "typed",
        isPreview: false,
        source: 3,          // UrlbarUtils.RESULT_SOURCE.TABS
      });
      // Clear any existing text so the user starts fresh
      urlBar.select();
    } else {
      // Fallback for builds where setSearchMode is unavailable:
      // programmatically type "% " into the bar.
      urlBar.value = "";
      urlBar.select();

      const inputEl = urlBar.inputField || urlBar.querySelector("input");
      if (inputEl) {
        // Simulate typing "% " which triggers Firefox's tab-search heuristic
        ["% "].forEach((text) => {
          inputEl.setRangeText(text, 0, inputEl.value.length, "end");
          inputEl.dispatchEvent(new InputEvent("input", { bubbles: true }));
        });
      }
    }
  }

  /**
   * Attach a capturing keydown listener to a browser window.
   * Using capture=true lets us intercept the event before web content
   * sees it, making the shortcut truly universal.
   */
  function attachToWindow(win) {
    if (!win || win.__tabSearchShortcutAttached) return;
    win.__tabSearchShortcutAttached = true;

    win.addEventListener(
      "keydown",
      function onKeyDown(e) {
        if (!isShortcutMatch(e)) return;

        // Don't fire if the user is typing in the URL bar itself
        const focused = win.document.activeElement;
        const urlBarInput = win.gURLBar?.inputField;
        if (focused === urlBarInput) return;

        e.preventDefault();
        e.stopPropagation();
        openTabSearch(win);
      },
      true   // capture phase — fires before web-content handlers
    );
  }

  /**
   * Observe new browser windows so the shortcut works in every window,
   * including ones opened after the script loads.
   */
  const windowObserver = {
    observe(subject, topic) {
      if (topic === "domwindowopened") {
        subject.addEventListener(
          "load",
          () => {
            if (subject.document?.documentElement?.getAttribute("windowtype") === "navigator:browser") {
              attachToWindow(subject);
            }
          },
          { once: true }
        );
      }
    },
  };

  // Attach to all already-open windows
  for (const win of Services.wm.getEnumerator("navigator:browser")) {
    attachToWindow(win);
  }

  // Watch for future windows
  Services.ww.registerNotification(windowObserver);

})();
