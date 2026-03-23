// ==UserScript==
// @name           Simple Search
// @description    Universal Shift+Space shortcut to open tab search (%) in the URL bar
// @author         manuelcontrera
// @version        1.1.0
// ==/UserScript==

(function SimpleSearch() {
  "use strict";

  const PREF_USE_SHIFT = "simplesearch.useShift";
  const PREF_USE_CTRL  = "simplesearch.useCtrl";
  const PREF_USE_ALT   = "simplesearch.useAlt";

  function getPref(key, fallback) {
    try {
      const type = Services.prefs.getPrefType(key);
      if (type === Services.prefs.PREF_BOOL) return Services.prefs.getBoolPref(key);
    } catch (e) {}
    return fallback;
  }

  function isShortcutMatch(e) {
    const needShift = getPref(PREF_USE_SHIFT, true);
    const needCtrl  = getPref(PREF_USE_CTRL,  false);
    const needAlt   = getPref(PREF_USE_ALT,   false);

    return (
      e.code      === "Space"    &&
      e.shiftKey  === needShift  &&
      e.ctrlKey   === needCtrl   &&
      e.altKey    === needAlt
    );
  }

  function openTabSearch(win) {
    try {
      const gURLBar = win.gURLBar;
      if (!gURLBar) return;

      // Focus and open the URL bar dropdown
      gURLBar.focus();
      gURLBar.select();

      // Use the internal value setter to inject "% " which triggers tab search
      const input = gURLBar.inputField;
      if (!input) return;

      // Clear the field first
      input.value = "";

      // Set value to "% " — the space after % is required by Firefox to activate tab search
      gURLBar.value = "% ";

      // Fire an input event so Firefox picks up the new value
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Move cursor to end so the user types after "% "
      input.setSelectionRange(input.value.length, input.value.length);

    } catch (e) {
      Cu.reportError("[SimpleSearch] openTabSearch error: " + e);
    }
  }

  function attachToWindow(win) {
    if (!win || win._simpleSearchAttached) return;
    win._simpleSearchAttached = true;

    win.addEventListener(
      "keydown",
      function (e) {
        if (!isShortcutMatch(e)) return;

        // Don't fire if URL bar is already focused
        const urlBarInput = win.gURLBar?.inputField;
        if (win.document.activeElement === urlBarInput) return;

        e.preventDefault();
        e.stopPropagation();

        openTabSearch(win);
      },
      true // capture phase — intercepts before web page sees the event
    );
  }

  // Attach to all currently open windows
  for (const win of Services.wm.getEnumerator("navigator:browser")) {
    attachToWindow(win);
  }

  // Watch for new windows
  Services.ww.registerNotification({
    observe(subject, topic) {
      if (topic !== "domwindowopened") return;
      subject.addEventListener(
        "load",
        () => {
          if (
            subject.document?.documentElement?.getAttribute("windowtype") ===
            "navigator:browser"
          ) {
            attachToWindow(subject);
          }
        },
        { once: true }
      );
    },
  });

})();
