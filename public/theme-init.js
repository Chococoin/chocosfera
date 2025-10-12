(() => {
  try {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    const root = document.documentElement;
    const body = document.body;

    if (shouldUseDark) {
      root.classList.add("dark");
      body?.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body?.classList.remove("dark");
    }
  } catch {
    // Fallback if localStorage is not available
    console.warn("Unable to access localStorage for theme");
  }
})();
