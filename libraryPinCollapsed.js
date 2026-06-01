// NAME: libraryPinCollapsed
// AUTHOR: ELpuripro525
// DESCRIPTION: choose which items appear in your library sidebar when it's collapsed and hide the rest.

(function libraryPinCollapsed() {
    const STORAGE_KEY = "libraryPinCollapsed:items";

    function getPinned() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch { return []; }
    }

    function setPinned(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }

    function isCollapsed() {
        const rootlist = document.querySelector(".main-rootlist-wrapper");
        if (!rootlist) return false;
        const sidebar =
            rootlist.closest("[class*='LeftSidebar']") ||
            document.querySelector("[data-testid='left-sidebar']");
        return sidebar ? sidebar.offsetWidth < 100 : rootlist.offsetWidth < 80;
    }

    function getItemName(el) {
        return el.querySelector('[dir="auto"]')?.textContent?.trim() || null;
    }

    function applyFilter() {
        const collapsed = isCollapsed();
        const pinned = getPinned();
        const items = document.querySelectorAll(".main-yourLibraryX-listItem");
        const scrollbar = document.querySelector(".main-rootlist-wrapper");

        items.forEach(el => {
            const name = getItemName(el);
            if (!collapsed || pinned.length === 0) {
                el.style.display = "";
            } else {
                el.style.display = pinned.includes(name) ? "" : "none";
            }
        });

        if (scrollbar) {
            scrollbar.style.overflowY = collapsed ? "hidden" : "";
            scrollbar.style.scrollbarWidth = collapsed ? "none" : "";
        }
    }

    function addContextMenus() {
        const items = document.querySelectorAll(".main-yourLibraryX-listItem");
        items.forEach(el => {
            if (el.dataset.lpcListener) return;
            el.dataset.lpcListener = "1";

            el.addEventListener("contextmenu", () => {
                setTimeout(() => {
                    const menu = document.querySelector(
                        '[class*="react-context-menu"], [data-testid*="context-menu"], ul[class*="menu"]'
                    );
                    if (!menu || menu.dataset.lpcInjected) return;
                    menu.dataset.lpcInjected = "1";

                    const name = getItemName(el);
                    if (!name) return;

                    const pinned = getPinned();
                    const isPinned = pinned.includes(name);

                    const item = document.createElement("li");
                    item.style.cssText = "list-style:none;cursor:pointer;padding:10px 16px;font-size:14px;color:var(--spice-text,#fff);";
                    item.textContent = isPinned
                        ? "❌ Unpin from collapsed view"
                        : "📌 Pin to collapsed view";

                    item.addEventListener("click", () => {
                        let updated = getPinned();
                        updated = isPinned
                            ? updated.filter(n => n !== name)
                            : [...updated, name];
                        setPinned(updated);
                        applyFilter();
                        menu.remove();
                    });

                    menu.appendChild(item);
                }, 100);
            });
        });
    }

    function observe() {
        new MutationObserver(() => {
            addContextMenus();
            applyFilter();
        }).observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        if (!document.querySelector(".main-yourLibraryX-listItem")) {
            setTimeout(init, 500);
            return;
        }
        addContextMenus();
        applyFilter();
        observe();
    }

    init();
})();
