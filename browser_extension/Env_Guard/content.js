// content.js
(function() {
    const DEFAULT_MARKERS = [
        {
            name: "生产环境",
            pattern: "https://www.example.com/",
            color: "rgba(255, 0, 0, 0.7)",
            opacity: "0.7",
            position: "top-center",
            fontSize: "30",
            enabled: true
        },
        {
            name: "测试环境",
            pattern: "https://test.example.com/",
            color: "rgba(255, 0, 0, 0.7)",
            opacity: "0.7",
            position: "top-center",
            fontSize: "30",
            enabled: true
        },
        {
            name: "开发环境",
            pattern: "localhost|127.0.0.1|dev.example.com",
            color: "rgba(16, 185, 129, 0.8)",
            opacity: "0.7",
            position: "top-center",
            fontSize: "30",
            enabled: true
        }
    ];

    const POSITION_LABELS = {
        "top-left": "左上",
        "top-center": "顶部居中",
        "top-right": "右上",
        "middle-left": "左中",
        center: "居中",
        "middle-right": "右中",
        "bottom-left": "左下",
        "bottom-center": "底部居中",
        "bottom-right": "右下"
    };

    function getOpacity(marker) {
        const opacity = Number(marker.opacity);
        if (Number.isFinite(opacity)) {
            return Math.min(1, Math.max(0.1, opacity));
        }

        const rgbaMatch = String(marker.color || "").match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/i);
        return rgbaMatch ? Math.min(1, Math.max(0.1, Number(rgbaMatch[1]))) : 0.7;
    }

    function toBackgroundColor(marker) {
        const color = marker.color || "#ff0000";
        const rgbaMatch = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        const opacity = getOpacity(marker);

        if (rgbaMatch) {
            return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
        }

        const hexMatch = String(color).match(/^#([0-9a-f]{6})$/i);
        if (!hexMatch) return color;

        const value = hexMatch[1];
        const red = parseInt(value.slice(0, 2), 16);
        const green = parseInt(value.slice(2, 4), 16);
        const blue = parseInt(value.slice(4, 6), 16);
        return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    }

    function applyDefaultPosition(element, position) {
        const preset = {
            "top-left": { left: "16px", top: "16px", transform: "translate3d(0, 0, 0)" },
            "top-center": { left: "50%", top: "16px", transform: "translate3d(-50%, 0, 0)" },
            "top-right": { right: "16px", top: "16px", transform: "translate3d(0, 0, 0)" },
            "middle-left": { left: "16px", top: "50%", transform: "translate3d(0, -50%, 0)" },
            center: { left: "50%", top: "50%", transform: "translate3d(-50%, -50%, 0)" },
            "middle-right": { right: "16px", top: "50%", transform: "translate3d(0, -50%, 0)" },
            "bottom-left": { left: "16px", bottom: "16px", transform: "translate3d(0, 0, 0)" },
            "bottom-center": { left: "50%", bottom: "16px", transform: "translate3d(-50%, 0, 0)" },
            "bottom-right": { right: "16px", bottom: "16px", transform: "translate3d(0, 0, 0)" }
        };

        const rule = preset[position] || preset["top-center"];
        element.style.left = "auto";
        element.style.right = "auto";
        element.style.top = "auto";
        element.style.bottom = "auto";
        Object.keys(rule).forEach(function(key) {
            element.style[key] = rule[key];
        });
    }

    function getMarkers(callback) {
        if (!chrome.storage || !chrome.storage.sync) {
            callback(DEFAULT_MARKERS);
            return;
        }

        chrome.storage.sync.get({ envCheckerMarkers: DEFAULT_MARKERS }, function(result) {
            callback(Array.isArray(result.envCheckerMarkers) ? result.envCheckerMarkers : DEFAULT_MARKERS);
        });
    }

    function saveMarkerPosition(markerKey, position) {
        try {
            chrome.storage.sync.get({ envCheckerMarkerPositions: {} }, function(result) {
                const positions = result.envCheckerMarkerPositions || {};
                positions[markerKey] = position;
                chrome.storage.sync.set({ envCheckerMarkerPositions: positions });
            });
        } catch (error) {
            // ignore storage failures in content script
        }
    }

    function getSavedPosition(markerKey, callback) {
        if (!chrome.storage || !chrome.storage.sync) {
            callback(null);
            return;
        }

        chrome.storage.sync.get({ envCheckerMarkerPositions: {} }, function(result) {
            const positions = result.envCheckerMarkerPositions || {};
            callback(positions[markerKey] || null);
        });
    }

    function isMatch(pattern, url) {
        if (!pattern) return false;

        try {
            return new RegExp(pattern).test(url);
        } catch (error) {
            return url.includes(pattern);
        }
    }

    function watchUrlChanges(onChange) {
        const emitChange = function() {
            window.requestAnimationFrame(onChange);
        };

        const wrapHistoryMethod = function(methodName) {
            const original = history[methodName];
            if (typeof original !== "function") return;

            history[methodName] = function() {
                const result = original.apply(this, arguments);
                emitChange();
                return result;
            };
        };

        wrapHistoryMethod("pushState");
        wrapHistoryMethod("replaceState");

        window.addEventListener("popstate", emitChange);
        window.addEventListener("hashchange", emitChange);
    }

    function addDragSupport(environmentDiv, markerKey, basePositionKey) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let baseX = 0;
        let baseY = 0;
        let nextX = 0;
        let nextY = 0;
        let frameId = null;

        function renderDragPosition() {
            frameId = null;
            environmentDiv.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
        }

        function scheduleRender() {
            if (frameId !== null) return;
            frameId = window.requestAnimationFrame(renderDragPosition);
        }

        environmentDiv.addEventListener("pointerdown", function(e) {
            if (e.button !== 0) return;

            isDragging = true;

            const rect = environmentDiv.getBoundingClientRect();
            baseX = rect.left;
            baseY = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            nextX = baseX;
            nextY = baseY;

            environmentDiv.style.left = "0";
            environmentDiv.style.top = "0";
            environmentDiv.style.right = "auto";
            environmentDiv.style.bottom = "auto";
            environmentDiv.style.transform = `translate3d(${baseX}px, ${baseY}px, 0)`;
            environmentDiv.style.userSelect = "none";
            environmentDiv.style.cursor = "grabbing";
            environmentDiv.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        environmentDiv.addEventListener("pointermove", function(e) {
            if (!isDragging) return;

            nextX = baseX + e.clientX - dragStartX;
            nextY = baseY + e.clientY - dragStartY;
            scheduleRender();
        });

        function stopDragging(e) {
            if (!isDragging) return;

            isDragging = false;
            environmentDiv.style.userSelect = "";
            environmentDiv.style.cursor = "grab";

            const rect = environmentDiv.getBoundingClientRect();
            saveMarkerPosition(markerKey, {
                left: rect.left,
                top: rect.top,
                transform: "none",
                basePositionKey: basePositionKey || "top-center"
            });

            if (e && environmentDiv.hasPointerCapture(e.pointerId)) {
                environmentDiv.releasePointerCapture(e.pointerId);
            }
        }

        environmentDiv.addEventListener("pointerup", stopDragging);
        environmentDiv.addEventListener("pointercancel", stopDragging);
    }

    getMarkers(function(markers) {
        let currentIndicator = null;
        let currentMarkerKey = null;

        function renderIndicator() {
            const url = window.location.href;
            const marker = markers.find(function(item) {
                return item && item.enabled !== false && isMatch(item.pattern, url);
            });

            if (!marker) {
                if (currentIndicator && currentIndicator.parentNode) {
                    currentIndicator.parentNode.removeChild(currentIndicator);
                }
                currentIndicator = null;
                currentMarkerKey = null;
                return;
            }

            const markerKey = marker.pattern || marker.name || "env-marker";

            if (currentIndicator && currentMarkerKey === markerKey) {
                currentIndicator.textContent = marker.name || "环境标记";
                currentIndicator.style.backgroundColor = toBackgroundColor(marker);
                currentIndicator.style.fontSize = `${Number(marker.fontSize) || 30}px`;
                return;
            }

            if (currentIndicator && currentIndicator.parentNode) {
                currentIndicator.parentNode.removeChild(currentIndicator);
            }

            const environmentDiv = document.createElement("div");
            environmentDiv.textContent = marker.name || "环境标记";
            environmentDiv.className = "environment-indicator";
            environmentDiv.style.backgroundColor = toBackgroundColor(marker);
            environmentDiv.style.fontSize = `${Number(marker.fontSize) || 30}px`;
            applyDefaultPosition(environmentDiv, marker.position);
            document.body.appendChild(environmentDiv);

            getSavedPosition(markerKey, function(savedPosition) {
                if (savedPosition && typeof savedPosition.left === "number" && typeof savedPosition.top === "number") {
                    environmentDiv.style.left = `${savedPosition.left}px`;
                    environmentDiv.style.top = `${savedPosition.top}px`;
                    environmentDiv.style.transform = "none";
                    environmentDiv.style.right = "auto";
                    environmentDiv.style.bottom = "auto";
                }

                addDragSupport(environmentDiv, markerKey, marker.position);
            });

            currentIndicator = environmentDiv;
            currentMarkerKey = markerKey;
        }

        renderIndicator();
        watchUrlChanges(renderIndicator);
    });
})();



