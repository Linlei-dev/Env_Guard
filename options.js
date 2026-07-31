// options.js
(function() {
    const STORAGE_KEY = "envCheckerMarkers";
    const DEFAULT_MARKERS = [
        {
            name: "生产环境",
            pattern: "https://www.example.com/",
            color: "#ff0000",
            opacity: "0.7",
            position: "top-center",
            fontSize: "30",
            enabled: true
        },
        {
            name: "测试环境",
            pattern: "https://test.example.com/",
            color: "#f5a623",
            opacity: "0.8",
            position: "top-center",
            fontSize: "30",
            enabled: true
        },
        {
            name: "开发环境",
            pattern: "localhost|127.0.0.1|dev.example.com",
            color: "#10b981",
            opacity: "0.8",
            position: "top-center",
            fontSize: "30",
            enabled: true
        }
    ];

    const POSITION_OPTIONS = [
        ["top-left", "左上"],
        ["top-center", "顶部居中"],
        ["top-right", "右上"],
        ["middle-left", "左中"],
        ["center", "居中"],
        ["middle-right", "右中"],
        ["bottom-left", "左下"],
        ["bottom-center", "底部居中"],
        ["bottom-right", "右下"]
    ];

    const markerRows = document.getElementById("markerRows");
    const status = document.getElementById("status");
    const testResult = document.getElementById("testResult");

    function showStatus(message, isError) {
        status.textContent = message;
        status.style.color = isError ? "#dc2626" : "#047857";

        if (!isError) {
            window.setTimeout(function() {
                status.textContent = "";
            }, 2500);
        }
    }

    function normalizeColor(color) {
        if (/^#[0-9a-f]{6}$/i.test(color || "")) return color;

        const rgbaMatch = String(color || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!rgbaMatch) return "#ff0000";

        return [rgbaMatch[1], rgbaMatch[2], rgbaMatch[3]].map(function(part) {
            return Number(part).toString(16).padStart(2, "0");
        }).join("").replace(/^/, "#");
    }

    function normalizeOpacity(marker) {
        const opacity = Number(marker.opacity);
        if (Number.isFinite(opacity)) return Math.min(1, Math.max(0.1, opacity)).toFixed(1);

        const rgbaMatch = String(marker.color || "").match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/i);
        if (rgbaMatch) return Math.min(1, Math.max(0.1, Number(rgbaMatch[1]))).toFixed(1);

        return "0.7";
    }

    function normalizePosition(position) {
        const valid = new Set(POSITION_OPTIONS.map(function(item) { return item[0]; }));
        return valid.has(position) ? position : "top-center";
    }

    function isMatch(pattern, url) {
        if (!pattern) return false;

        try {
            return new RegExp(pattern).test(url);
        } catch (error) {
            return url.includes(pattern);
        }
    }

    function createMarkerRow(marker) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="enabled-cell"><input type="checkbox" class="enabled"></td>
            <td class="name-cell"><input type="text" class="name" placeholder="例如：生产环境"></td>
            <td class="pattern-cell"><input type="text" class="pattern" placeholder="例如：www.example.com 或 ^https://test\\."></td>
            <td class="color-cell"><input type="color" class="color"></td>
            <td class="opacity-cell">
                <div class="opacity-control">
                    <input type="range" class="opacity" min="0.1" max="1" step="0.1">
                    <span class="opacity-value"></span>
                </div>
            </td>
            <td class="position-cell"><select class="position"></select></td>
            <td class="font-cell"><input type="number" class="font-size" min="12" max="80" step="1"></td>
            <td class="actions-cell"><button type="button" class="remove-btn">删除</button></td>
        `;

        const opacityInput = tr.querySelector(".opacity");
        const opacityValue = tr.querySelector(".opacity-value");

        function updateOpacityValue() {
            opacityValue.textContent = `${Math.round(Number(opacityInput.value) * 100)}%`;
        }

        tr.querySelector(".enabled").checked = marker.enabled !== false;
        tr.querySelector(".name").value = marker.name || "";
        tr.querySelector(".pattern").value = marker.pattern || "";
        tr.querySelector(".color").value = normalizeColor(marker.color);
        opacityInput.value = normalizeOpacity(marker);
        updateOpacityValue();
        opacityInput.addEventListener("input", updateOpacityValue);
        const positionSelect = tr.querySelector(".position");
        POSITION_OPTIONS.forEach(function(item) {
            const option = document.createElement("option");
            option.value = item[0];
            option.textContent = item[1];
            positionSelect.appendChild(option);
        });
        positionSelect.value = normalizePosition(marker.position);
        tr.querySelector(".font-size").value = Number(marker.fontSize) || 30;
        tr.querySelector(".remove-btn").addEventListener("click", function() {
            tr.remove();
        });

        markerRows.appendChild(tr);
    }

    function renderMarkers(markers) {
        markerRows.innerHTML = "";
        markers.forEach(createMarkerRow);
    }

    function collectMarkers() {
        return Array.from(markerRows.querySelectorAll("tr")).map(function(row) {
            return {
                enabled: row.querySelector(".enabled").checked,
                name: row.querySelector(".name").value.trim(),
                pattern: row.querySelector(".pattern").value.trim(),
                color: row.querySelector(".color").value,
                opacity: row.querySelector(".opacity").value,
                position: row.querySelector(".position").value,
                fontSize: row.querySelector(".font-size").value || "30"
            };
        }).filter(function(marker) {
            return marker.name && marker.pattern;
        });
    }

    function saveMarkers(markers) {
        chrome.storage.sync.set({ [STORAGE_KEY]: markers }, function() {
            showStatus("已保存");
        });
    }

    function loadMarkers() {
        chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_MARKERS }, function(result) {
            renderMarkers(Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : DEFAULT_MARKERS);
        });
    }

    document.getElementById("addMarkerBtn").addEventListener("click", function() {
        createMarkerRow({
            enabled: true,
            name: "",
            pattern: "",
            color: "#ff0000",
            opacity: "0.7",
            position: "top-center",
            fontSize: "30"
        });
    });

    document.getElementById("testRuleBtn").addEventListener("click", function() {
        const testUrl = document.getElementById("testUrl").value.trim();

        if (!testUrl) {
            testResult.className = "test-result";
            testResult.textContent = "请输入要测试的 URL。";
            return;
        }

        const markers = collectMarkers();
        const marker = markers.find(function(item) {
            return item.enabled !== false && isMatch(item.pattern, testUrl);
        });

        if (!marker) {
            testResult.className = "test-result";
            testResult.textContent = "未命中任何规则。";
            return;
        }

        testResult.className = "test-result match";
        testResult.textContent = `命中规则：${marker.name}。`;
    });

    document.getElementById("saveBtn").addEventListener("click", function() {
        saveMarkers(collectMarkers());
    });

    document.getElementById("resetBtn").addEventListener("click", function() {
        renderMarkers(DEFAULT_MARKERS);
        saveMarkers(DEFAULT_MARKERS);
    });

    document.getElementById("exportBtn").addEventListener("click", function() {
        const blob = new Blob([JSON.stringify({ [STORAGE_KEY]: collectMarkers() }, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "env-guard-config.json";
        link.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById("importFile").addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function() {
            try {
                const parsed = JSON.parse(reader.result);
                const markers = Array.isArray(parsed) ? parsed : parsed[STORAGE_KEY];

                if (!Array.isArray(markers)) {
                    showStatus("导入失败：JSON 格式不正确", true);
                    return;
                }

                renderMarkers(markers);
                saveMarkers(collectMarkers());
            } catch (error) {
                showStatus("导入失败：无法解析 JSON", true);
            }
        };
        reader.readAsText(file, "UTF-8");
        event.target.value = "";
    });

    loadMarkers();
})();
