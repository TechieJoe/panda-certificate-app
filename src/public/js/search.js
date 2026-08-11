const input = document.getElementById("searchInput");
const box = document.getElementById("searchSuggestions");

if (input && box) {

    input.addEventListener("input", async () => {

        const q = input.value.trim();

        if (!q) {
            box.style.display = "none";
            box.innerHTML = "";
            return;
        }

        const res = await fetch(
            `/certificates/search/suggestions?q=${encodeURIComponent(q)}`
        );

        const data = await res.json();

        if (!data.length) {
            box.style.display = "none";
            return;
        }

        box.innerHTML = data.map(item => `
            <div class="search-item"
                 onclick="window.location='/certificates/${item.id}/view'">

                <div class="search-title">
                    ${item.certificateNo || "No Certificate No"}
                </div>

                <div class="search-sub">
                    ${item.client}
                    •
                    ${item.serialNo}
                    •
                    ${item.template}
                </div>

            </div>
        `).join("");

        box.style.display = "block";

    });

    document.addEventListener("click", e => {

        if (!box.contains(e.target) && e.target !== input) {

            box.style.display = "none";

        }

    });

}