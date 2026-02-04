document.addEventListener("DOMContentLoaded", function () {
  const menuToggler = document.getElementById("menuToggler");

  if (!menuToggler) return;

  menuToggler.addEventListener("click", function () {
    const screenWidth = window.innerWidth;

    // Only allow on phone & iPad (Bootstrap lg breakpoint = 992px)
    if (screenWidth < 992) {
      // If this script is used in index.html (root)
      window.location.href = "menu.html";

      // If navbar is already inside /html folder, use instead:
      // window.location.href = "menu.html";
    } else {
      // Desktop: do nothing
      console.log("Menu disabled on desktop");
    }
  });
});


/* =========================
   BACK ARROW (3 pages only)
   pages: index.html, products.html, contact.html
========================= */
// BACK ARROW (Bootstrap-safe, works even if element is added later)
(function () {
  function currentPageName() {
    let path = (window.location.pathname || "").toLowerCase();

    // remove query/hash from safety (pathname shouldn't include them, but just in case)
    path = path.split("?")[0].split("#")[0];

    // remove trailing slash
    path = path.replace(/\/+$/, "");

    if (path === "" || path === "/") return "index.html";

    const last = path.split("/").pop();

    // Support "/products" style routes
    if (!last.includes(".")) {
      if (last === "products") return "products.html";
      if (last === "contact" || last === "contacts") return "contact.html";
      return "index.html";
    }

    return last || "index.html";
  }

  function fallbackFor(page) {
    if (page === "products.html") return "products.html";
    if (page === "contact.html") return "contact.html";
    return "index.html";
  }

  // CAPTURE MODE: we intercept before Bootstrap / other scripts
  document.addEventListener(
    "click",
    function (e) {
      const backArrow = e.target.closest("#mobileBackArrow");
      if (!backArrow) return;

      // Stop EVERYTHING else that might hijack the click
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // If it is an <a>, neutralize it completely
      if (backArrow.tagName === "A") backArrow.setAttribute("href", "#");

      // Prefer actual history
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      // No history: go to correct fallback (based on current page)
      const page = currentPageName();
      const target = fallbackFor(page);

      window.location.assign(target);
    },
    true
  );
})();


/* =========================
  PAGINATION
========================= */
function showPage(pageNumber) {
  // Hide all pages
  document.querySelectorAll(".product-page").forEach(page => {
    page.classList.add("d-none");
  });

  // Show selected page
  const activePage = document.getElementById("page" + pageNumber);
  if (activePage) activePage.classList.remove("d-none");

  // Update active pagination button
  document.querySelectorAll("#productPagination .page-item").forEach(item => {
    item.classList.remove("active");
  });

  const activeBtn = document.querySelector(`#productPagination .page-item:nth-child(${pageNumber})`);
  if (activeBtn) activeBtn.classList.add("active");

  // Optional: scroll back to top of products nicely
  const firstPage = document.getElementById("page1");
  if (firstPage) firstPage.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Make sure page 1 shows on load
document.addEventListener("DOMContentLoaded", () => showPage(1));




/* =========================
   searchProducts
========================= */
  function searchProducts() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    const pages = document.querySelectorAll(".product-page");
    const items = document.querySelectorAll(".product-item");

    // Create / get "no results" message
    let noResults = document.getElementById("noResultsMsg");
    if (!noResults) {
      noResults = document.createElement("div");
      noResults.id = "noResultsMsg";
      noResults.className = "text-center text-muted my-4";
      noResults.style.display = "none";
      noResults.innerHTML = "No products found.";
      // insert message before pagination if it exists, else at end of body
      const pagination = document.querySelector("nav[aria-label='Product pages'], nav .pagination")?.closest("nav");
      if (pagination) pagination.parentNode.insertBefore(noResults, pagination);
      else document.body.appendChild(noResults);
    }

    // If empty search: reset everything
    if (query === "") {
      // show all items
      items.forEach(item => item.classList.remove("d-none"));

      // reset pages: show page1, hide page2 & page3
      pages.forEach((p, idx) => {
        if (idx === 0) p.classList.remove("d-none");
        else p.classList.add("d-none");
      });

      // reset pagination active
      const paginationItems = document.querySelectorAll(".pagination .page-item");
      paginationItems.forEach((li, idx) => {
        li.classList.toggle("active", idx === 0);
      });

      noResults.style.display = "none";
      return;
    }

    // Filter items by title + text
    let anyMatch = false;

    items.forEach(item => {
      const title = item.querySelector(".card-title")?.innerText.toLowerCase() || "";
      const text  = item.querySelector(".card-text")?.innerText.toLowerCase() || "";
      const matches = title.includes(query) || text.includes(query);

      item.classList.toggle("d-none", !matches);
      if (matches) anyMatch = true;
    });

    // Show pages that contain visible items, hide pages that don't
    pages.forEach(page => {
      const hasVisible = page.querySelector(".product-item:not(.d-none)") !== null;
      page.classList.toggle("d-none", !hasVisible);
    });

    // Hide pagination while searching (optional but cleaner)
    const paginationNav = document.querySelector("nav[aria-label='Product pages']") || document.querySelector("nav .pagination")?.closest("nav");
    if (paginationNav) paginationNav.style.display = "none";

    // Show/hide "No results"
    noResults.style.display = anyMatch ? "none" : "block";
  }

  // OPTIONAL: when user clicks pagination, cancel search input
  function showPage(pageNumber) {
    // Clear search box if you want pagination to work normally
    const input = document.getElementById("searchInput");
    if (input) input.value = "";

    const pages = document.querySelectorAll(".product-page");
    pages.forEach(p => p.classList.add("d-none"));

    const activePage = document.getElementById("page" + pageNumber);
    if (activePage) activePage.classList.remove("d-none");

    // Update pagination active state
    document.querySelectorAll(".pagination .page-item").forEach(li => li.classList.remove("active"));
    const activeLi = document.querySelector(`.pagination .page-item:nth-child(${pageNumber})`);
    if (activeLi) activeLi.classList.add("active");

    // Re-show pagination if it was hidden during search
    const paginationNav = document.querySelector("nav[aria-label='Product pages']") || document.querySelector("nav .pagination")?.closest("nav");
    if (paginationNav) paginationNav.style.display = "block";

    // Ensure all products visible again
    document.querySelectorAll(".product-item").forEach(item => item.classList.remove("d-none"));

    // Hide "no results" if exists
    const noResults = document.getElementById("noResultsMsg");
    if (noResults) noResults.style.display = "none";
  }

  // Load default page
  document.addEventListener("DOMContentLoaded", () => {
    // Ensure page1 shows first
    if (typeof showPage === "function") showPage(1);
  });


  /* =========================
     Global search
  ========================= */
  function globalSearch(e) {
  e.preventDefault();
  const q = document.getElementById("globalSearchInput").value.trim();
  if (!q) return;

  // redirect to products with query
  window.location.href = "products.html?q=" + encodeURIComponent(q);
}
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");

  if (q) {
    const input = document.getElementById("searchInput");
    if (input) {
      input.value = q;
      searchProducts(); // run your existing filter
    }
  }
});

/* =========================
   ABOUT
========================= */
// about.js
(function () {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // If your main script.js doesn't exist or globalSearch isn't defined,
  // this prevents the form from breaking.
  if (typeof window.globalSearch !== "function") {
    window.globalSearch = function (e) {
      e.preventDefault();
      const input = document.getElementById("globalSearchInput");
      const q = (input?.value || "").trim();
      if (!q) return;
      window.location.href = "products.html?q=" + encodeURIComponent(q);
    };
  }

  // Quality-of-life: auto-close navbar after clicking a link on mobile
  const nav = document.getElementById("mainNavbar");
  if (nav) {
    const links = nav.querySelectorAll(".nav-link");
    links.forEach((a) => {
      a.addEventListener("click", () => {
        // Only close if it's currently shown (mobile)
        if (nav.classList.contains("show")) {
          const toggler = document.getElementById("menuToggler");
          toggler?.click();
        }
      });
    });
  }
})();

/* =========================
   contactForm
========================= */
const form = document.getElementById("contactForm");
 const alertBox = document.getElementById("formAlert");
 const sendBtn = document.getElementById("sendBtn");

 function showAlert(type, msg) {
   // type: "success" | "danger" | "warning" | "info"
   alertBox.className = `alert alert-${type}`;
   alertBox.textContent = msg;
   alertBox.classList.remove("d-none");
 }

 function setLoading(isLoading) {
   if (isLoading) {
     sendBtn.disabled = true;
     sendBtn.textContent = "Sending...";
   } else {
     sendBtn.disabled = false;
     sendBtn.textContent = "Send Message";
   }
 }

 form.addEventListener("submit", async (e) => {
   e.preventDefault(); // stop page redirect
   alertBox.classList.add("d-none");

   setLoading(true);

   try {
     const formData = new FormData(form);

     const res = await fetch(form.action, {
       method: "POST",
       body: formData,
       headers: {
         "Accept": "application/json"
       }
     });

     if (res.ok) {
       showAlert("success", "✅ Message sent successfully. We’ll get back to you shortly.");
       form.reset();
     } else {
       // Try to read Formspree error details
       let data = null;
       try { data = await res.json(); } catch (_) {}

       const msg = (data && data.errors && data.errors.length)
         ? "❌ " + data.errors.map(e => e.message).join(" | ")
         : "❌ Message not sent. Please try again.";

       showAlert("danger", msg);
     }
   } catch (err) {
     showAlert("danger", "❌ Network error. Check your internet and try again.");
   } finally {
     setLoading(false);
   }
 });
