(() => {
    "use strict";

    /* -----------------------------------------
       State
    ----------------------------------------- */

    const state = {
        items: [],
        categories: [],
        stats: {
            total: 0,
            uploaded: 0,
            missing: 0,
            progress: 0
        },
        selectedItem: null,
        pexels: {
            item: null,
            results: [],
            selected: null,
            busy: false
        }
    };


    const $ = (selector) => document.querySelector(selector);


    const elements = {
        totalItems: $("#totalItems"),
        uploadedItems: $("#uploadedItems"),
        missingItems: $("#missingItems"),
        progressText: $("#progressText"),

        searchInput: $("#searchInput"),
        categoryFilter: $("#categoryFilter"),
        imageFilter: $("#imageFilter"),
        nextMissingBtn: $("#nextMissingBtn"),

        loadingState: $("#loadingState"),
        errorState: $("#errorState"),
        errorMessage: $("#errorMessage"),
        retryBtn: $("#retryBtn"),

        itemsGrid: $("#itemsGrid"),
        emptyState: $("#emptyState"),

        uploadModal: $("#uploadModal"),
        closeModalBtn: $("#closeModalBtn"),
        cancelUploadBtn: $("#cancelUploadBtn"),

        modalItemName: $("#modalItemName"),
        modalCategory: $("#modalCategory"),

        imageInput: $("#imageInput"),
        imagePreviewWrapper: $("#imagePreviewWrapper"),
        imagePreview: $("#imagePreview"),

        uploadBtn: $("#uploadBtn"),
        uploadStatus: $("#uploadStatus"),

        pexelsModal: $("#pexelsModal"),
        closePexelsModalBtn: $("#closePexelsModalBtn"),
        pexelsItemName: $("#pexelsItemName"),
        pexelsItemCategory: $("#pexelsItemCategory"),
        pexelsCurrentImage: $("#pexelsCurrentImage"),
        pexelsQuery: $("#pexelsQuery"),
        pexelsSearchBtn: $("#pexelsSearchBtn"),
        pexelsSuggestBtn: $("#pexelsSuggestBtn"),
        pexelsQueryNote: $("#pexelsQueryNote"),
        pexelsSelectedImage: $("#pexelsSelectedImage"),
        pexelsSaveBtn: $("#pexelsSaveBtn"),
        pexelsClearBtn: $("#pexelsClearBtn"),
        pexelsStatus: $("#pexelsStatus"),
        pexelsResults: $("#pexelsResults"),
        pexelsNoResults: $("#pexelsNoResults"),

        logoutBtn: $("#logoutBtn")
    };


    /* -----------------------------------------
       Escape HTML / auth helpers
    ----------------------------------------- */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function redirectToLogin() {
        window.location.href = "/staff-login.html";
    }

    async function ensureAuthenticated() {
        try {
            if (window.api && typeof window.api.getMe === "function") {
                const me = await window.api.getMe();
                if (me && me.success) return true;
            }
            redirectToLogin();
            return false;
        } catch (_) {
            redirectToLogin();
            return false;
        }
    }

    function isAuthStatus(status) {
        return status === 401 || status === 403;
    }


    /* -----------------------------------------
       Load menu
    ----------------------------------------- */

    async function loadMenu() {

        showLoading();

        try {

            const params = new URLSearchParams();

            const search = elements.searchInput.value.trim();
            const category = elements.categoryFilter.value;
            const filter = elements.imageFilter.value;

            if (search) {
                params.set("search", search);
            }

            if (category) {
                params.set("category", category);
            }

            if (filter) {
                params.set("filter", filter);
            }

            const response = await fetch(
                `/api/image-manager/menu-items?${params.toString()}`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (isAuthStatus(response.status)) return redirectToLogin();
                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to load menu items."
                );
            }

            const result = data.data || {};

            state.items = result.items || [];
            state.categories = result.categories || [];

            state.stats = result.stats || {
                total: state.items.length,
                uploaded: 0,
                missing: 0,
                progress: 0
            };

            updateStats();
            populateCategories();
            renderItems();

            hideLoading();

        } catch (error) {

            console.error("Image manager error:", error);

            showError(error.message);

        }
    }


    /* -----------------------------------------
       Stats
    ----------------------------------------- */

    function updateStats() {

        const total = state.stats.total ?? 0;
        const uploaded = state.stats.uploaded ?? 0;

        elements.totalItems.textContent = total;
        elements.uploadedItems.textContent = uploaded;
        elements.missingItems.textContent = state.stats.missing ?? 0;
        elements.progressText.textContent = `${uploaded} / ${total}`;
    }


    /* -----------------------------------------
       Categories
    ----------------------------------------- */

    function populateCategories() {

        const currentValue =
            elements.categoryFilter.value;

        const categories = [...state.categories]
            .sort((a, b) =>
                String(a.name).localeCompare(String(b.name))
            );

        elements.categoryFilter.innerHTML =
            `<option value="">All Categories</option>`;

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            elements.categoryFilter.appendChild(option);

        });

        if (
            currentValue &&
            [...elements.categoryFilter.options]
                .some(option => option.value === currentValue)
        ) {
            elements.categoryFilter.value = currentValue;
        }
    }


    /* -----------------------------------------
       Render items
    ----------------------------------------- */

    function createImageElement(src, alt) {
        const image = document.createElement("img");
        image.src = src;
        image.alt = alt || "Dish";
        image.loading = "lazy";
        return image;
    }

    function renderItems() {

        elements.itemsGrid.innerHTML = "";

        if (!state.items.length) {

            elements.emptyState.classList.remove("hidden");

            return;
        }

        elements.emptyState.classList.add("hidden");

        state.items.forEach(item => {

            const card =
                document.createElement("article");

            card.className = "menu-item-card";
            card.dataset.itemId = String(item.id);

            const imageBox =
                document.createElement("div");

            imageBox.className = "menu-item-image";

            if (item.image_url) {
                const img = createImageElement(item.image_url, item.name);
                imageBox.appendChild(img);
            } else {
                const noImage =
                    document.createElement("div");
                noImage.className = "no-image";
                noImage.textContent = "No Image";
                imageBox.appendChild(noImage);
            }


            const details =
                document.createElement("div");

            details.className = "menu-item-details";

            const category =
                document.createElement("div");

            category.className = "menu-item-category";
            category.textContent =
                item.category_name || "Uncategorized";

            const name =
                document.createElement("h2");

            name.className = "menu-item-name";
            name.textContent = item.name;

            const price =
                document.createElement("div");

            price.className = "menu-item-price";
            price.textContent =
                `₹${Number(item.price || 0).toFixed(2)}`;


            const actions =
                document.createElement("div");

            actions.className = "menu-item-actions";

            const searchButton =
                document.createElement("button");

            searchButton.type = "button";
            searchButton.className =
                "image-action-btn search-action";
            searchButton.dataset.action = "search";
            searchButton.dataset.id = item.id;
            searchButton.textContent = "Search Pexels";

            const uploadButton =
                document.createElement("button");

            uploadButton.type = "button";
            uploadButton.className =
                "image-action-btn upload-action";
            uploadButton.dataset.action = "upload";
            uploadButton.dataset.id = item.id;
            uploadButton.textContent =
                item.image_url ? "Replace Image" : "Upload Image";

            actions.appendChild(searchButton);
            actions.appendChild(uploadButton);

            if (item.image_url) {
                const removeButton =
                    document.createElement("button");

                removeButton.type = "button";
                removeButton.className =
                    "image-action-btn remove-action";
                removeButton.dataset.action = "remove";
                removeButton.dataset.id = item.id;
                removeButton.textContent = "Remove";

                actions.appendChild(removeButton);
            }

            details.append(category, name, price, actions);
            card.append(imageBox, details);

            elements.itemsGrid.appendChild(card);
        });
    }


    /* -----------------------------------------
       Upload modal (unchanged behaviour)
    ----------------------------------------- */

    function openUploadModal(item) {

        state.selectedItem = item;

        elements.modalItemName.textContent =
            item.name;

        elements.modalCategory.textContent =
            item.category_name || "Uncategorized";

        elements.imageInput.value = "";

        elements.uploadStatus.textContent = "";

        elements.imagePreview.removeAttribute("src");

        elements.imagePreviewWrapper.classList.add("hidden");

        elements.uploadModal.classList.remove("hidden");
    }


    function closeUploadModal() {

        state.selectedItem = null;

        elements.uploadModal.classList.add("hidden");

        elements.imageInput.value = "";

        elements.uploadStatus.textContent = "";

        elements.imagePreviewWrapper.classList.add("hidden");
    }


    elements.imageInput.addEventListener(
        "change",
        () => {

            const file =
                elements.imageInput.files[0];

            if (!file) {
                return;
            }

            if (file.size > 10 * 1024 * 1024) {

                elements.uploadStatus.textContent =
                    "Image must be smaller than 10 MB.";

                elements.imageInput.value = "";

                return;
            }

            const reader = new FileReader();

            reader.onload = event => {

                elements.imagePreview.src =
                    event.target.result;

                elements.imagePreviewWrapper
                    .classList
                    .remove("hidden");
            };

            reader.readAsDataURL(file);

            elements.uploadStatus.textContent = "";
        }
    );


    async function uploadImage() {

        const item = state.selectedItem;

        const file =
            elements.imageInput.files[0];

        if (!item) {
            return;
        }

        if (!file) {

            elements.uploadStatus.textContent =
                "Please select an image.";

            return;
        }

        elements.uploadBtn.disabled = true;

        elements.uploadStatus.textContent =
            "Uploading image...";


        try {

            const formData = new FormData();

            formData.append("menu_item_id", item.id);
            formData.append("image", file);


            const response = await fetch(
                "/api/image-manager/upload",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );


            const data = await response.json();


            if (!response.ok) {

                if (isAuthStatus(response.status)) return redirectToLogin();

                throw new Error(
                    data.error ||
                    data.message ||
                    "Upload failed."
                );
            }


            elements.uploadStatus.textContent =
                "Image uploaded successfully.";


            closeUploadModal();

            await loadMenu();


        } catch (error) {

            console.error("Upload error:", error);

            elements.uploadStatus.textContent =
                error.message;

        } finally {

            elements.uploadBtn.disabled = false;
        }
    }


    /* -----------------------------------------
       Remove image
    ----------------------------------------- */

    async function removeImage(item) {

        const confirmed =
            window.confirm(
                `Remove the image for "${item.name}"?`
            );

        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
                `/api/image-manager/menu-items/${item.id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                if (isAuthStatus(response.status)) return redirectToLogin();

                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to remove image."
                );
            }


            await loadMenu();


        } catch (error) {

            console.error("Remove image error:", error);

            alert(error.message);
        }
    }


    /* -----------------------------------------
       Pexels search modal
    ----------------------------------------- */

    function setPexelsStatus(message, isError = false) {

        elements.pexelsStatus.textContent =
            message || "";

        elements.pexelsStatus.style.color =
            isError ? "var(--manager-danger)" : "";
    }

    function setPexelsBusy(busy) {

        state.pexels.busy = busy;

        elements.pexelsSearchBtn.disabled = busy;
        elements.pexelsSuggestBtn.disabled = busy;
    }


    function setPexelsNoResults(show, message) {

        if (!show) {

            elements.pexelsNoResults.classList.add("hidden");

            return;
        }

        const heading =
            elements.pexelsNoResults
                .querySelector("strong");

        const detail =
            elements.pexelsNoResults
                .querySelector("span");

        if (heading && message) {
            heading.textContent = message;
        }

        if (detail && message) {
            detail.textContent =
                "None of the returned photos clearly matched this dish. " +
                "Try a different search term, or skip this item and come back later.";
        }

        elements.pexelsNoResults.classList.remove("hidden");
    }


    const MATCH_LABELS = {
        exact: "Exact match",
        good: "Good match",
        possible: "Possible match"
    };

    function openPexelsModal(item) {

        state.pexels.item = item;
        state.pexels.results = [];
        state.pexels.selected = null;
        
        elements.pexelsItemName.textContent =
            item.name;

        elements.pexelsItemCategory.textContent =
            item.category_name || "Uncategorized";

        elements.pexelsQuery.value = item.name;
        elements.pexelsQueryNote.textContent = "";
        setPexelsStatus("");
        setPexelsNoResults(false);
        elements.pexelsResults.innerHTML = "";

        // Current image preview
        elements.pexelsCurrentImage.innerHTML = "";

        if (item.image_url) {
            const img = createImageElement(item.image_url, item.name);
            img.addEventListener("error", () => {
                elements.pexelsCurrentImage.innerHTML = "";
                const placeholder = document.createElement("span");
                placeholder.textContent = "Current image unavailable";
                elements.pexelsCurrentImage.appendChild(placeholder);
            }, { once: true });
            elements.pexelsCurrentImage.appendChild(img);
        } else {
            const placeholder = document.createElement("span");
            placeholder.textContent = "No image assigned yet";
            elements.pexelsCurrentImage.appendChild(placeholder);
        }

        // Selected preview
        elements.pexelsSelectedImage.innerHTML = "";
        const selectedHint =
            document.createElement("span");
        selectedHint.textContent =
            "Click a result to choose";
        elements.pexelsSelectedImage.appendChild(selectedHint);

        elements.pexelsSaveBtn.disabled = true;

        state.pexels.selected = null;

        elements.pexelsModal.classList.remove("hidden");

        requestAnimationFrame(() => {
            elements.pexelsQuery.focus();
            elements.pexelsQuery.select();
        });
    }


    function closePexelsModal() {

        elements.pexelsModal.classList.add("hidden");

        state.pexels.item = null;
        state.pexels.results = [];
        state.pexels.selected = null;
        setPexelsStatus("");
        setPexelsNoResults(false);
        elements.pexelsResults.innerHTML = "";
    }


    function handleSearchFailure(response, data) {

        if (isAuthStatus(response.status)) return redirectToLogin();

        if (data && data.configNeeded) {
            setPexelsStatus(
                "Pexels is not configured. Add PEXELS_API_KEY to the server's " +
                ".env file, then restart the server to enable image search. " +
                "Local uploads still work.",
                true
            );
            return;
        }

        setPexelsStatus(
            (data && (data.error || data.message)) ||
            "Image search failed.",
            true
        );
    }


    async function searchPexelsRequest(query) {

        const trimmed = String(query || "").trim();

        if (!trimmed) {
            setPexelsStatus("Enter a search term.", true);
            return;
        }

        setPexelsBusy(true);
        setPexelsStatus("Searching Pexels...");
        elements.pexelsResults.innerHTML = "";

        try {

            const response = await fetch(
                `/api/image-manager/search?q=${encodeURIComponent(trimmed)}`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                handleSearchFailure(response, data);
                return;
            }

            const result = data.data || {};

            state.pexels.results = result.results || [];

            elements.pexelsQueryNote.textContent =
                `Searched: "${result.query}". ` +
                (result.dropped
                    ? `${result.dropped} result(s) hidden as unrelated.`
                    : "All results reviewed for relevance.");

            renderPexelsResults();

            if (!state.pexels.results.length) {
                setPexelsNoResults(true);
                setPexelsStatus("No suitable image found for this term.");
            } else {
                setPexelsStatus(`Found ${state.pexels.results.length} relevant photo(s). Click one to select it.`);
            }

        } catch (error) {

            console.error("Pexels search error:", error);

            setPexelsStatus(error.message || "Image search failed.", true);

        } finally {

            setPexelsBusy(false);
        }
    }


    async function suggestPexelsRequest() {

        const item = state.pexels.item;

        if (!item) return;

        setPexelsBusy(true);
        setPexelsStatus("Generating search query...");
        elements.pexelsResults.innerHTML = "";

        try {

            const response = await fetch(
                "/api/image-manager/suggest",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ menu_item_id: item.id })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                handleSearchFailure(response, data);
                return;
            }

            const result = data.data || {};

            elements.pexelsQuery.value = result.query || item.name;

            const plan = result.queryPlan || [];
            const tried = result.queries || [];

            let note = `Primary query: "${result.query}" (exact dish name).`;

            if (plan.length > 1) {
                note += ` Fallback plan: ${plan
                    .slice(1)
                    .map(q => q.query)
                    .join(" · ")}.`;
            }

            const fallbackTried =
                tried.filter(q => q.tier !== "exact").length;

            if (tried.length > 1) {
                note += ` Used ${fallbackTried} fallback search(es).`;
            } else {
                note += " Exact search was strong; fallbacks not needed.";
            }

            elements.pexelsQueryNote.textContent = note;

            state.pexels.results = result.results || [];

            renderPexelsResults();

            if (!state.pexels.results.length) {
                setPexelsNoResults(true);
                setPexelsStatus(`No suitable image found for "${item.name}".`);
            } else {
                setPexelsStatus(`Found ${state.pexels.results.length} relevant photo(s) for "${item.name}". Click one to select it.`);
            }

        } catch (error) {

            console.error("Pexels suggest error:", error);

            setPexelsStatus(error.message || "Image search failed.", true);

        } finally {

            setPexelsBusy(false);
        }
    }


    function renderPexelsResults() {

        elements.pexelsResults.innerHTML = "";

        if (state.pexels.results.length) {
            setPexelsNoResults(false);
        }

        state.pexels.results.forEach(result => {

            const card =
                document.createElement("div");

            card.className =
                "pexels-result-card" +
                (state.pexels.selected &&
                 state.pexels.selected.id === result.id
                    ? " selected"
                    : "");

            card.dataset.resultId = String(result.id);

            const img =
                createImageElement(
                    result.preview_url,
                    result.alt || "Food image"
                );

            img.addEventListener("error", () => {
                card.classList.add("image-failed");
                img.remove();
            }, { once: true });

            card.appendChild(img);

            // Relevance badge
            const badge =
                document.createElement("span");

            badge.className =
                "match-badge " +
                String(result.match || "possible");

            badge.textContent =
                MATCH_LABELS[result.match] ||
                "Possible match";

            card.appendChild(badge);

            const meta =
                document.createElement("div");

            meta.className = "pexels-result-meta";
            meta.textContent =
                result.alt || "Food photo";

            card.appendChild(meta);

            const check =
                document.createElement("span");

            check.className = "pexels-result-check";
            check.textContent = "✓";

            card.appendChild(check);

            elements.pexelsResults.appendChild(card);
        });
    }


    function selectPexelsResult(result) {

        state.pexels.selected = result;

        renderPexelsResults();

        elements.pexelsSelectedImage.innerHTML = "";

        const img =
            createImageElement(
                result.preview_url,
                result.alt || "Selected food image"
            );

        img.addEventListener("error", () => {
            elements.pexelsSelectedImage.innerHTML = "";
            const placeholder = document.createElement("span");
            placeholder.textContent = "Preview unavailable";
            elements.pexelsSelectedImage.appendChild(placeholder);
        }, { once: true });

        elements.pexelsSelectedImage.appendChild(img);

        elements.pexelsSaveBtn.disabled = false;

        setPexelsStatus(
            `Selected by ${result.photographer || "Pexels"}. Click "Save Image" to assign it.`
        );
    }


    async function saveSelectedImage() {

        const item = state.pexels.item;
        const selected = state.pexels.selected;

        if (!item || !selected) return;

        elements.pexelsSaveBtn.disabled = true;
        setPexelsStatus("Saving image...");

        try {

            const response = await fetch(
                "/api/image-manager/save",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        menu_item_id: item.id,
                        image_url: selected.image_url
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (isAuthStatus(response.status)) return redirectToLogin();
                setPexelsStatus(
                    (data && (data.error || data.message)) ||
                    "Unable to save the image.",
                    true
                );
                elements.pexelsSaveBtn.disabled = false;
                return;
            }

            // Update local state + current preview
            const savedUrl =
                (data.data && data.data.image_url) ||
                selected.image_url;

            const found =
                state.items.find(
                    menuItem => Number(menuItem.id) === Number(item.id)
                );

            if (found) found.image_url = savedUrl;

            item.image_url = savedUrl;
            state.pexels.selected = null;
                        elements.pexelsSaveBtn.disabled = true;

            setPexelsStatus(`Saved — image assigned to "${item.name}".`);

            // Refresh current-preview + stats + grid without closing the modal
            elements.pexelsCurrentImage.innerHTML = "";

            const img = createImageElement(savedUrl, item.name);
            img.addEventListener("error", () => {
                elements.pexelsCurrentImage.innerHTML = "";
                const placeholder = document.createElement("span");
                placeholder.textContent = "Image saved, preview unavailable";
                elements.pexelsCurrentImage.appendChild(placeholder);
            }, { once: true });

            elements.pexelsCurrentImage.appendChild(img);

            // Refresh stats + grid (keeps the Pexels modal open)
            await loadMenu();

        } catch (error) {

            console.error("Save image error:", error);

            setPexelsStatus(error.message || "Unable to save the image.", true);

            elements.pexelsSaveBtn.disabled = false;
        }
    }


    /* -----------------------------------------
       Next missing item
    ----------------------------------------- */

    async function goToNextMissing() {

        try {

            elements.imageFilter.value = "missing";

            await loadMenu();

            const nextMissing =
                state.items.find(
                    item =>
                        !item.image_url ||
                        String(item.image_url).trim() === ""
                );

            if (!nextMissing) {

                alert("All items in the current list have images assigned.");

                return;
            }

            const card =
                elements.itemsGrid
                    .querySelector(
                        `.menu-item-card` +
                        `[data-item-id="${nextMissing.id}"]`
                    );

            if (card) {
                card.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            openPexelsModal(nextMissing);

            // Auto-run Suggest so candidates are ready for review immediately.
            requestAnimationFrame(() => suggestPexelsRequest());

        } catch (error) {

            console.error("Next missing error:", error);

            alert(error.message);
        }
    }


    /* -----------------------------------------
       Loading / errors
    ----------------------------------------- */

    function showLoading() {

        elements.loadingState.classList.remove("hidden");

        elements.errorState.classList.add("hidden");
    }


    function hideLoading() {

        elements.loadingState.classList.add("hidden");

        elements.errorState.classList.add("hidden");
    }


    function showError(message) {

        elements.loadingState.classList.add("hidden");

        elements.errorState.classList.remove("hidden");

        elements.errorMessage.textContent =
            message || "Unknown error.";
    }


    /* -----------------------------------------
       Events
    ----------------------------------------- */

    // Broken images shown in the grid fall back to a placeholder (no broken icon)
    elements.itemsGrid.addEventListener(
        "error",
        event => {

            const target = event.target;

            if (
                target &&
                target.tagName === "IMG" &&
                target.closest(".menu-item-image")
            ) {

                target.remove();

                const fallback =
                    document.createElement("div");

                fallback.className = "no-image";
                fallback.textContent = "Image Unavailable";

                target.closest(".menu-item-image")
                    .appendChild(fallback);
            }
        },
        true
    );


    elements.itemsGrid.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest("button[data-action]");

            if (!button) {
                return;
            }

            const id =
                Number(button.dataset.id);

            const item =
                state.items.find(
                    menuItem => Number(menuItem.id) === id
                );

            if (!item) {
                return;
            }


            if (button.dataset.action === "search") {

                openPexelsModal(item);

            } else if (button.dataset.action === "upload") {

                openUploadModal(item);

            } else if (
                button.dataset.action === "remove"
            ) {

                removeImage(item);

            }
        }
    );


    elements.uploadBtn.addEventListener(
        "click",
        uploadImage
    );


    elements.closeModalBtn.addEventListener(
        "click",
        closeUploadModal
    );


    elements.cancelUploadBtn.addEventListener(
        "click",
        closeUploadModal
    );


    elements.uploadModal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal-backdrop"
                )
            ) {
                closeUploadModal();
            }
        }
    );


    elements.pexelsSearchBtn.addEventListener(
        "click",
        () => searchPexelsRequest(elements.pexelsQuery.value)
    );


    elements.pexelsQuery.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                event.preventDefault();
                searchPexelsRequest(elements.pexelsQuery.value);
            }
        }
    );


    elements.pexelsSuggestBtn.addEventListener(
        "click",
        suggestPexelsRequest
    );


    elements.closePexelsModalBtn.addEventListener(
        "click",
        closePexelsModal
    );


    elements.pexelsModal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal-backdrop"
                )
            ) {
                closePexelsModal();
            }
        }
    );


    elements.pexelsResults.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(".pexels-result-card");

            if (!card) return;

            const id = Number(card.dataset.resultId);

            const result =
                state.pexels.results.find(
                    candidate =>
                        Number(candidate.id) === id
                );

            if (result) selectPexelsResult(result);
        }
    );


    elements.pexelsSaveBtn.addEventListener(
        "click",
        saveSelectedImage
    );


    elements.pexelsClearBtn.addEventListener(
        "click",
        () => {

            state.pexels.selected = null;
            
            elements.pexelsSelectedImage.innerHTML = "";

            const hint =
                document.createElement("span");

            hint.textContent =
                "Click a result to choose";

            elements.pexelsSelectedImage.appendChild(hint);

            elements.pexelsSaveBtn.disabled = true;

            renderPexelsResults();
        }
    );


    elements.nextMissingBtn.addEventListener(
        "click",
        goToNextMissing
    );


    elements.retryBtn.addEventListener(
        "click",
        loadMenu
    );


    elements.categoryFilter.addEventListener(
        "change",
        loadMenu
    );


    elements.imageFilter.addEventListener(
        "change",
        loadMenu
    );


    let searchTimer;

    elements.searchInput.addEventListener(
        "input",
        () => {

            clearTimeout(searchTimer);

            searchTimer = setTimeout(
                loadMenu,
                250
            );
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;

            if (!elements.uploadModal.classList.contains("hidden")) {
                closeUploadModal();
            }

            if (!elements.pexelsModal.classList.contains("hidden")) {
                closePexelsModal();
            }
        }
    );


    /* -----------------------------------------
       Logout
    ----------------------------------------- */

    elements.logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                if (
                    window.api &&
                    typeof window.api.logout === "function"
                ) {
                    await window.api.logout();
                } else {

                    await fetch(
                        "/api/staff/logout",
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );
                }

            } catch (error) {
                console.error(error);
            }

            window.location.href =
                "/staff-login.html";
        }
    );


    /* -----------------------------------------
       Start
    ----------------------------------------- */

    ensureAuthenticated().then(ok => {
        if (ok) loadMenu();
    });

})();