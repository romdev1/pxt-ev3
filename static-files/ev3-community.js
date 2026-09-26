/* This file contains custom scripts to fix various Makecode EV3 editor problems
 * when running as a static site on github pages.
 */

/* Early theme restoration before any styles/scripts render */
(function() {
    try {
        const themeChoice = localStorage.getItem("brickcode_theme_choice");
        const rawIds = localStorage.getItem("ev3/user-pref:colorThemeIds") || localStorage.getItem("user-pref:colorThemeIds");
        if (!themeChoice && rawIds) {
            if (rawIds.includes("ev3-dark")) localStorage.setItem("brickcode_theme_choice", "ev3-dark");
            else if (rawIds.includes("ev3-light")) localStorage.setItem("brickcode_theme_choice", "ev3-light");
            else if (rawIds.includes("pxt-high-contrast")) localStorage.setItem("brickcode_theme_choice", "pxt-high-contrast");
        }
        if (localStorage.getItem("brickcode_theme_choice") === "ev3-dark") {
            const darkVal = JSON.stringify({ ev3: "ev3-dark" });
            localStorage.setItem("ev3/user-pref:colorThemeIds", darkVal);
            localStorage.setItem("user-pref:colorThemeIds", darkVal);
            if (document.documentElement) document.documentElement.setAttribute('data-theme', 'dark');
        }
    } catch (e) {}
})();

/* Fix URL prefix in docs when running the beta site */
function checkDocsBetaUrl()
{
    const docurl = window.location.hash;
    if (docurl.startsWith("#doc:/pxt-ev3/beta/"))
    {
        const newurl = docurl.replace("pxt-ev3/beta/", "");
        window.location.replace(window.location.origin + window.location.pathname + window.location.search + newurl);
    }
}

/* Rewrite XMLHttpRequest urls to download translated docs from MakeCode API when needed. */
function bindDocsXHROpen()
{
    const docurl = window.location.hash;
    if (docurl.startsWith("#doc:/docs") && !docurl.endsWith(":en"))
    {
        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function(method, url, ...rest)
        {
            const match = url.match(/docs\/([\w\/]+).md\?lang=([\w-]+)$/);
            if (match) {
                const newurl = "https://cdn.makecode.com/api/md/ev3/" + match[1] + "?targetVersion=1.4.41&lang=" + match[2];
                console.log("Getting translated docs for " + url + " from " + newurl);
                return originalOpen.apply(this, [method, newurl, ...rest]);
            }

            return originalOpen.apply(this, [method, url, ...rest]);
        };
    }
}

if (window.location.pathname.split('/').pop() == "docs.html")
{
    checkDocsBetaUrl();
    bindDocsXHROpen();
}

/* Add class to body to customize CSS for beta site */
if (window.location.hostname != 'brickcode.org')
{
    window.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('ev3beta');
    });
}

/* Automatically select "API key" for GitHub login dialog, as OAuth
 * cannot work with GitHub pages. */
function bindGitHubLoginHook()
{
    function callback(mutationList, observer)
    {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                        node.querySelectorAll('h3').forEach(hdr => {
                            if (hdr.textContent.includes("GitHub"))
                            {
                                const link = node.querySelector("a.ui.link");
                                if (link)
                                {
                                    console.log("Selecting GitHub API token mode");
                                    link.click();
                                }
                            }
                        });
                  });
            }
        }
    };
    
    const observer = new MutationObserver(callback);
    observer.observe(document.body, { childList: true, subtree: false });
}

window.addEventListener('DOMContentLoaded', bindGitHubLoginHook);

/* Register PWA offline service worker for reliable offline caching */
function registerPwaWorker()
{
    // Clean up outdated v1, v2, and v3 caches if present
    if ('caches' in window) {
        caches.keys().then(keys => {
            keys.forEach(k => {
                if (k.startsWith('brickcode-pwa-') && k !== 'brickcode-pwa-v4') {
                    caches.delete(k);
                }
            });
        }).catch(() => {});
    }

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('pwaworker.js').then(reg => {
                console.log('BrickCode PWA ServiceWorker active:', reg.scope);
                reg.update().catch(() => {});
            }).catch(err => {
                console.warn('BrickCode PWA ServiceWorker registration failed:', err);
            });
        });
    }
}

registerPwaWorker();

/* Fallback definitions for EV3 themes to guarantee presence regardless of cache state */
const EV3_DARK_THEME = {
    id: "ev3-dark",
    name: "EV3 Dark",
    weight: 25,
    monacoBaseTheme: "vs-dark",
    overrideFiles: [
        "/overrides/ev3-dark-overrides.css"
    ],
    colors: {
        "pxt-header-background": "#1e1e1e",
        "pxt-header-foreground": "#FFFFFF",
        "pxt-header-background-hover": "#2d2d2d",
        "pxt-header-foreground-hover": "#FFFFFF",
        "pxt-header-stencil": "#0089BF",
        "pxt-header-secondary-background": "#252526",
        "pxt-header-secondary-foreground": "#CCCCCC",
        "pxt-primary-background": "#0089BF",
        "pxt-primary-foreground": "#FFFFFF",
        "pxt-primary-background-hover": "#0073A1",
        "pxt-primary-foreground-hover": "#FFFFFF",
        "pxt-primary-accent": "#00a5c8",
        "pxt-secondary-background": "#E5A914",
        "pxt-secondary-foreground": "#1E1E1E",
        "pxt-secondary-background-hover": "#C9930D",
        "pxt-secondary-foreground-hover": "#1E1E1E",
        "pxt-secondary-accent": "#eb6306",
        "pxt-tertiary-background": "#2D3748",
        "pxt-tertiary-foreground": "#E2E8F0",
        "pxt-tertiary-background-hover": "#4A5568",
        "pxt-tertiary-foreground-hover": "#FFFFFF",
        "pxt-tertiary-accent": "#0089BF",
        "pxt-target-background1": "#181818",
        "pxt-target-foreground1": "#E0E0E0",
        "pxt-target-background1-hover": "#282828",
        "pxt-target-foreground1-hover": "#FFFFFF",
        "pxt-target-stencil1": "#333333",
        "pxt-target-background2": "#1E1E1E",
        "pxt-target-foreground2": "#E0E0E0",
        "pxt-target-background2-hover": "#2D2D30",
        "pxt-target-foreground2-hover": "#FFFFFF",
        "pxt-target-stencil2": "#383838",
        "pxt-target-background3": "#141414",
        "pxt-target-foreground3": "#CCCCCC",
        "pxt-target-background3-hover": "#222222",
        "pxt-target-foreground3-hover": "#FFFFFF",
        "pxt-target-stencil3": "#2A2A2A",
        "pxt-neutral-background1": "#1E1E1E",
        "pxt-neutral-foreground1": "#D4D4D4",
        "pxt-neutral-background1-hover": "#2A2D2E",
        "pxt-neutral-foreground1-hover": "#FFFFFF",
        "pxt-neutral-stencil1": "rgba(255, 255, 255, 0.12)",
        "pxt-neutral-background2": "#252526",
        "pxt-neutral-foreground2": "rgba(255, 255, 255, 0.7)",
        "pxt-neutral-background2-hover": "#2D2D30",
        "pxt-neutral-foreground2-hover": "rgba(255, 255, 255, 0.9)",
        "pxt-neutral-stencil2": "#383838",
        "pxt-neutral-background3": "#2D2D30",
        "pxt-neutral-foreground3": "#FFFFFF",
        "pxt-neutral-background3-hover": "#3E3E42",
        "pxt-neutral-foreground3-hover": "#FFFFFF",
        "pxt-neutral-stencil3": "#555555",
        "pxt-neutral-background3-alpha90": "#1E1E1EE5",
        "pxt-neutral-base": "rgba(255, 255, 255, 0.9)",
        "pxt-neutral-alpha0": "rgba(255, 255, 255, 0)",
        "pxt-neutral-alpha5": "rgba(255, 255, 255, 0.05)",
        "pxt-neutral-alpha10": "rgba(255, 255, 255, 0.1)",
        "pxt-neutral-alpha20": "rgba(255, 255, 255, 0.2)",
        "pxt-neutral-alpha30": "rgba(255, 255, 255, 0.3)",
        "pxt-neutral-alpha40": "rgba(255, 255, 255, 0.4)",
        "pxt-neutral-alpha50": "rgba(255, 255, 255, 0.5)",
        "pxt-link": "#4DAAF8",
        "pxt-link-hover": "#78C2FC",
        "pxt-focus-border": "#0089BF",
        "pxt-colors-red-background": "#E53935",
        "pxt-colors-red-foreground": "#FFFFFF",
        "pxt-colors-red-hover": "#C62828",
        "pxt-colors-green-background": "#43A047",
        "pxt-colors-green-foreground": "#FFFFFF",
        "pxt-colors-green-hover": "#2E7D32",
        "pxt-colors-blue-background": "#0089BF",
        "pxt-colors-blue-foreground": "#FFFFFF",
        "pxt-colors-orange-background": "#FB8C00",
        "pxt-colors-orange-foreground": "#FFFFFF",
        "pxt-colors-orange-hover": "#EF6C00",
        "pxt-colors-yellow-background": "#FDD835",
        "pxt-colors-yellow-foreground": "#1E1E1E",
        "pxt-colors-yellow-hover": "#FBC02D"
    }
};

const EV3_LIGHT_THEME = {
    id: "ev3-light",
    name: "EV3 Light",
    weight: 20,
    overrideFiles: [
        "/overrides/ev3-light-overrides.css"
    ],
    colors: {
        "pxt-header-background": "#F2F2F2",
        "pxt-header-foreground": "#FFFFFF",
        "pxt-header-background-hover": "#1d3282",
        "pxt-header-foreground-hover": "#FFFFFF",
        "pxt-header-stencil": "#00a5c8",
        "pxt-header-secondary-background": "#999999",
        "pxt-header-secondary-foreground": "#FFFFFF",
        "pxt-primary-background": "#1AA5C6",
        "pxt-primary-foreground": "#FFFFFF",
        "pxt-primary-background-hover": "#0F97b7",
        "pxt-primary-foreground-hover": "#FFFFFF",
        "pxt-primary-accent": "#0f97b7",
        "pxt-secondary-background": "#ffd417",
        "pxt-secondary-foreground": "#FFFFFF",
        "pxt-secondary-background-hover": "#fccd00",
        "pxt-secondary-foreground-hover": "#FFFFFF",
        "pxt-secondary-accent": "#eb6306",
        "pxt-tertiary-background": "#3454D1",
        "pxt-tertiary-foreground": "#4a4a4a",
        "pxt-tertiary-background-hover": "#2742ab",
        "pxt-tertiary-foreground-hover": "#000000",
        "pxt-tertiary-accent": "#1d3282",
        "pxt-target-background1": "#f2f2f2",
        "pxt-target-foreground1": "#000000",
        "pxt-target-background1-hover": "#cfd9db",
        "pxt-target-foreground1-hover": "#000000",
        "pxt-target-stencil1": "#e1e1e1",
        "pxt-target-background2": "#FDFDFF",
        "pxt-target-foreground2": "#000000",
        "pxt-target-background2-hover": "#cacaff",
        "pxt-target-foreground2-hover": "#000000",
        "pxt-target-stencil2": "#e1e1e1",
        "pxt-target-background3": "#F2F2F2",
        "pxt-target-foreground3": "#000000",
        "pxt-target-background3-hover": "#e6e6e6",
        "pxt-target-foreground3-hover": "#000000",
        "pxt-target-stencil3": "#d9d9d9",
        "pxt-neutral-background1": "#FFFFFF",
        "pxt-neutral-foreground1": "#5d5d5d",
        "pxt-neutral-background1-hover": "#e6e6e6",
        "pxt-neutral-foreground1-hover": "rgba(0, 0, 0, 0.85)",
        "pxt-neutral-stencil1": "rgba(34, 74, 114, 0.15)",
        "pxt-neutral-background2": "#e0e1e2",
        "pxt-neutral-foreground2": "rgba(0, 0, 0, 0.6)",
        "pxt-neutral-background2-hover": "#cacbcd",
        "pxt-neutral-foreground2-hover": "rgba(0, 0, 0, 0.8)",
        "pxt-neutral-stencil2": "#e9eef2",
        "pxt-neutral-background3": "#3b3c3d",
        "pxt-neutral-foreground3": "#FFFFFF",
        "pxt-neutral-background3-hover": "#363c3d",
        "pxt-neutral-foreground3-hover": "#FFFFFF",
        "pxt-neutral-stencil3": "#FFFFFF",
        "pxt-neutral-background3-alpha90": "#617374E5",
        "pxt-neutral-base": "rgba(0, 0, 0, 1)",
        "pxt-neutral-alpha0": "rgba(0, 0, 0, 0)",
        "pxt-neutral-alpha5": "rgba(0, 0, 0, 0.05)",
        "pxt-neutral-alpha10": "rgba(0, 0, 0, 0.1)",
        "pxt-neutral-alpha20": "rgba(0, 0, 0, 0.2)",
        "pxt-neutral-alpha30": "rgba(0, 0, 0, 0.3)",
        "pxt-neutral-alpha40": "rgba(0, 0, 0, 0.4)",
        "pxt-neutral-alpha50": "rgba(0, 0, 0, 0.5)",
        "pxt-link": "#3977B4",
        "pxt-link-hover": "#204467",
        "pxt-focus-border": "#007EF4",
        "pxt-colors-red-background": "#d4000d",
        "pxt-colors-red-foreground": "#FFFFFF",
        "pxt-colors-red-hover": "#8f0000",
        "pxt-colors-green-background": "#84ab0f",
        "pxt-colors-green-foreground": "#FFFFFF",
        "pxt-colors-green-hover": "#759a06",
        "pxt-colors-blue-background": "#007EF4",
        "pxt-colors-blue-foreground": "#FFFFFF",
        "pxt-colors-orange-background": "#fa7f2a",
        "pxt-colors-orange-foreground": "#FFFFFF",
        "pxt-colors-orange-hover": "#eb6306",
        "pxt-colors-yellow-background": "#fccd00",
        "pxt-colors-yellow-foreground": "#FFFFFF",
        "pxt-colors-yellow-hover": "#FDB80C"
    }
};

const EV3_HIGH_CONTRAST_THEME = {
    id: "pxt-high-contrast",
    name: "High Contrast",
    weight: 100,
    monacoBaseTheme: "hc-black",
    colors: {
        "pxt-header-background": "#000000",
        "pxt-header-foreground": "#FFFFFF",
        "pxt-header-background-hover": "#000000",
        "pxt-header-foreground-hover": "#FFFFFF",
        "pxt-header-stencil": "#FFFFFF",
        "pxt-primary-background": "#000000",
        "pxt-primary-foreground": "#FFFFFF",
        "pxt-primary-background-hover": "#000000",
        "pxt-primary-foreground-hover": "#FFFFFF",
        "pxt-primary-accent": "#000000",
        "pxt-secondary-background": "#000000",
        "pxt-secondary-foreground": "#FFFFFF",
        "pxt-secondary-background-hover": "#000000",
        "pxt-secondary-foreground-hover": "#FFFFFF"
    }
};

function injectThemes(targetObj)
{
    if (!targetObj) return;
    if (!targetObj.colorThemeMap) targetObj.colorThemeMap = {};
    if (!targetObj.colorThemeMap['ev3-dark']) {
        targetObj.colorThemeMap['ev3-dark'] = EV3_DARK_THEME;
    }
    if (!targetObj.colorThemeMap['ev3-light']) {
        targetObj.colorThemeMap['ev3-light'] = EV3_LIGHT_THEME;
    }
    if (!targetObj.colorThemeMap['pxt-high-contrast']) {
        targetObj.colorThemeMap['pxt-high-contrast'] = EV3_HIGH_CONTRAST_THEME;
    }
}

function ensureDarkThemeRegistered()
{
    if (window.pxtTargetBundle) injectThemes(window.pxtTargetBundle);
    if (window.pxt && window.pxt.appTarget) injectThemes(window.pxt.appTarget);
}

function preserveThemeSelection()
{
    try {
        const choice = localStorage.getItem("brickcode_theme_choice");
        if (choice === "ev3-dark" && window.pxt && window.pxt.storage && window.pxt.storage.setLocal) {
            const current = window.pxt.storage.getLocal("user-pref:colorThemeIds");
            if (!current || !current.includes("ev3-dark")) {
                const targetId = (window.pxt.appTarget && window.pxt.appTarget.id) || "ev3";
                window.pxt.storage.setLocal("user-pref:colorThemeIds", JSON.stringify({ [targetId]: "ev3-dark" }));
            }
        }
    } catch (e) {}
}

// Immediate interception and continuous registration
(function setupThemeInterceptors() {
    let _bundle = window.pxtTargetBundle;
    Object.defineProperty(window, 'pxtTargetBundle', {
        configurable: true,
        enumerable: true,
        get() { return _bundle; },
        set(val) {
            _bundle = val;
            injectThemes(_bundle);
        }
    });
    if (_bundle) injectThemes(_bundle);

    function hookPxt(pxtObj) {
        if (!pxtObj) return;
        if (pxtObj.appTarget) injectThemes(pxtObj.appTarget);

        const origSetAppTarget = pxtObj.setAppTarget;
        if (origSetAppTarget && !origSetAppTarget._ev3Hooked) {
            pxtObj.setAppTarget = function(bundle) {
                injectThemes(bundle);
                const res = origSetAppTarget.apply(this, arguments);
                if (pxtObj.appTarget) injectThemes(pxtObj.appTarget);
                return res;
            };
            pxtObj.setAppTarget._ev3Hooked = true;
        }

        if (pxtObj.storage && pxtObj.storage.getLocal && !pxtObj.storage.getLocal._ev3Hooked) {
            const origGetLocal = pxtObj.storage.getLocal;
            pxtObj.storage.getLocal = function(key) {
                const res = origGetLocal.apply(this, arguments);
                if (key === "user-pref:colorThemeIds") {
                    const choice = localStorage.getItem("brickcode_theme_choice");
                    if (choice === "ev3-dark") {
                        return JSON.stringify({ ev3: "ev3-dark" });
                    } else if (choice === "ev3-light") {
                        return JSON.stringify({ ev3: "ev3-light" });
                    } else if (choice === "pxt-high-contrast") {
                        return JSON.stringify({ ev3: "pxt-high-contrast" });
                    }
                }
                return res;
            };
            pxtObj.storage.getLocal._ev3Hooked = true;
        }

        if (pxtObj.storage && pxtObj.storage.setLocal && !pxtObj.storage.setLocal._ev3Hooked) {
            const origSetLocal = pxtObj.storage.setLocal;
            pxtObj.storage.setLocal = function(key, val) {
                if (key === "user-pref:colorThemeIds" && typeof val === "string") {
                    if (val.includes("ev3-dark")) localStorage.setItem("brickcode_theme_choice", "ev3-dark");
                    else if (val.includes("ev3-light")) localStorage.setItem("brickcode_theme_choice", "ev3-light");
                    else if (val.includes("pxt-high-contrast")) localStorage.setItem("brickcode_theme_choice", "pxt-high-contrast");
                }
                return origSetLocal.apply(this, arguments);
            };
            pxtObj.storage.setLocal._ev3Hooked = true;
        }
    }

    let _pxt = window.pxt;
    Object.defineProperty(window, 'pxt', {
        configurable: true,
        enumerable: true,
        get() { return _pxt; },
        set(val) {
            _pxt = val;
            hookPxt(_pxt);
        }
    });
    if (_pxt) hookPxt(_pxt);

    const interval = setInterval(() => {
        if (window.pxt) hookPxt(window.pxt);
        if (window.pxtTargetBundle) injectThemes(window.pxtTargetBundle);
    }, 50);
    setTimeout(() => clearInterval(interval), 15000);
})();

ensureDarkThemeRegistered();
preserveThemeSelection();

/* Community Russian translations for custom BrickCode dialogs and NXT blocks */
const RU_TRANSLATIONS = {
    // Bluetooth and transfer dialogs
    "First time here?": "Вы здесь впервые?",
    "You must have version 1.10E or above of the firmware": "На блоке EV3 должна быть установлена прошивка версии 1.10E или выше",
    "Check your firmware version here and update if needed": "Проверьте версию прошивки здесь и обновите при необходимости",
    "File Transfer": "Передача файлов",
    "This is the standard way to transfer a program to your EV3. Download the program as a file and transfer it to the EV3 manually.": "Стандартный способ загрузки программы на EV3. Скачайте файл программы и вручную скопируйте его на диск EV3.",
    "Bluetooth": "Bluetooth",
    "Upload the program directly to your EV3 over a Bluetooth connection using Web Serial.": "Прямая загрузка программы на EV3 по Bluetooth через Web Serial.",
    "Note": "Примечание",
    "To change the upload method, click the '...' button next to Download and select 'Upload method'.": "Чтобы изменить способ загрузки, нажмите кнопку '...' рядом с кнопкой «Скачать» и выберите «Способ загрузки».",
    "Download to your EV3": "Загрузка на EV3",
    "I got it": "Понятно",
    "Connect the EV3 to your computer with a USB cable": "Подключите EV3 к компьютеру с помощью USB-кабеля",
    "Use the miniUSB port on the top of the EV3 Brick": "Используйте порт miniUSB в верхней части модуля EV3",
    "Move the .uf2 file to the EV3 Brick": "Переместите файл .uf2 на модуль EV3",
    "Locate the downloaded .uf2 file and drag it to the EV3 USB drive": "Найдите скачанный файл .uf2 и скопируйте его на USB-диск EV3",
    "Don't show this again": "Больше не показывать это окно",
    "Done": "Готово",
    "Download Again": "Скачать снова",
    "Download as File": "Скачать как файл",
    "Upload method": "Способ загрузки",
    "Bluetooth pairing": "Сопряжение по Bluetooth",
    "Bluetooth download uses Web Serial. Your browser will ask you to select a serial port.": "Загрузка по Bluetooth использует Web Serial. Браузер попросит вас выбрать последовательный порт.",
    "Before continuing, make sure your EV3 is turned on and already paired with your computer. Close other applications that may be using the EV3 Bluetooth connection, such as 'EV3 Lab', 'EV3 Classroom', other BrickCode (MakeCode) editor tabs, or other applications using the EV3 Bluetooth serial connection.": "Перед продолжением убедитесь, что модуль EV3 включен и сопряжён с компьютером. Закройте другие программы, использующие Bluetooth-подключение EV3 (например, 'EV3 Lab', 'EV3 Classroom', другие вкладки редактора BrickCode).",
    "If 'Port View' is open on the EV3, close it before downloading. The program may download successfully, but it will not start.": "Если на модуле EV3 открыт режим «Просмотр порта» (Port View), закройте его перед загрузкой. Иначе программа загрузится, но не запустится.",
    "When the browser asks you to select a serial port, select the port with the name of your EV3. This is the name you set on your EV3 controller.": "Когда браузер предложит выбрать порт, выберите устройство с именем вашего EV3 (имя, указанное в настройках блока).",
    "On some Windows computers, the browser may not display your EV3 by name. The exact cause of this issue has not yet been determined. In this case, select the outgoing Bluetooth COM port assigned to your EV3. You can check the Bluetooth settings and open the COM Ports tab to identify the ports assigned to your EV3.": "На некоторых компьютерах с Windows браузер может не отображать имя EV3. В этом случае выберите исходящий COM-порт Bluetooth, назначенный вашему EV3 (его можно узнать в параметрах Bluetooth на вкладке «COM-порты»).",
    "Do not select unrelated COM ports, USB devices, or serial ports belonging to other hardware. If the EV3 does not respond after selecting a port, try selecting a different Bluetooth serial port.": "Не выбирайте сторонние COM-порты или USB-устройства. Если EV3 не отвечает после выбора порта, попробуйте выбрать другой Bluetooth COM-порт.",
    "Could not connect to EV3": "Не удалось подключиться к EV3",
    "The selected serial port did not respond as an EV3 device.": "Выбранный последовательный порт не отвечает как устройство EV3.",
    "Make sure your EV3 is turned on and paired with your computer, then select the correct Bluetooth serial port and try again.": "Убедитесь, что модуль EV3 включен и сопряжён с компьютером, затем выберите правильный Bluetooth COM-порт и повторите попытку.",
    "Bluetooth connection stuck": "Bluetooth-соединение зависло",
    "The Bluetooth connection could not be established.": "Не удалось установить соединение по Bluetooth.",
    "This can happen if a previous Bluetooth connection is still active or if the Bluetooth connection is temporarily unavailable.": "Это может произойти, если предыдущее соединение всё ещё активно или Bluetooth временно недоступен.",
    "If other robotics software (such as EV3 Classroom or EV3 Lab) is open, close it to release the port.": "Если открыты другие программы (например, EV3 Classroom или EV3 Lab), закройте их для освобождения порта.",
    "Stop the program on the EV3 and try again. If the problem persists, turn Bluetooth off and on again, then try again.": "Остановите выполнение программы на EV3 и повторите попытку. Если проблема сохраняется, выключите и снова включите Bluetooth на блоке EV3.",
    
    // NXT Touch Sensor blocks
    "on **nxt touch sensor** %this|%event": "при **датчик касания nxt** %this|%event",
    "pause until **nxt touch sensor** %this|%event": "ждать пока **датчик касания nxt** %this|%event",
    "**nxt touch sensor** %this|is pressed": "**датчик касания nxt** %this|нажат",
    "**nxt touch sensor** %this|was pressed": "**датчик касания nxt** %this|был нажат",
    "Run some code when the NXT touch sensor is pressed, released, or bumped.": "Выполнить код, когда датчик касания NXT нажат, отпущен или кликнут.",
    "Wait until the NXT touch sensor is touched.": "Ждать, пока датчик касания NXT не будет нажат.",
    "Check if the NXT touch sensor is currently pressed.": "Проверить, нажат ли датчик касания NXT в данный момент.",
    "Check if NXT touch sensor is touched since it was last checked.": "Проверить, нажимался ли датчик касания NXT с момента последней проверки.",

    // NXT Light Sensor blocks
    "on **nxt light sensor** %this|%event": "при **датчик света nxt** %this|%event",
    "pause until **nxt light sensor** %this|%event": "ждать пока **датчик света nxt** %this|%event",
    "**nxt light sensor** %this|light level": "**датчик света nxt** %this|уровень освещённости",
    "**nxt light sensor** %this|reflected light": "**датчик света nxt** %this|отражённый свет",
    "**nxt light sensor** %this|ambient light": "**датчик света nxt** %this|внешнее освещение",

    // NXT Sound Sensor blocks
    "**nxt sound sensor** %this|sound level": "**датчик звука nxt** %this|уровень звука",
    "on **nxt sound sensor** %this|%event": "при **датчик звука nxt** %this|%event",
    "pause until **nxt sound sensor** %this|%event": "ждать пока **датчик звука nxt** %this|%event",

    // Color theme picker translations
    "{id:color-theme-name}EV3 Dark": "EV3 Темная",
    "{id:color-theme-name}EV3 Light": "EV3 Светлая",
    "{id:color-theme-name}High Contrast": "Высокая контрастность",
    "EV3 Dark": "EV3 Темная",
    "EV3 Light": "EV3 Светлая",
    "High Contrast": "Высокая контрастность",
    "Theme": "Тема",
    "Select Theme": "Выбрать тему",
    "Choose a Theme": "Выберите тему",
    "Choose a theme": "Выберите тему",
    "Apply": "Применить",
    "Reset": "Сбросить",
    "Theme type": "Тип темы",
    "Editor theme": "Тема редактора",
    "Simulator theme": "Тема симулятора"
};

/* Synchronize dark theme class with document body and head */
function initDarkThemeSync()
{
    function updateTheme()
    {
        ensureDarkThemeRegistered();
        preserveThemeSelection();

        const style = document.getElementById('theme-override');
        const text = (style && style.textContent) || '';

        // Detect user's theme selection from style tag overrides
        if (text.includes('--pxt-header-background: #1e1e1e') || text.includes('EV3 Dark')) {
            localStorage.setItem("brickcode_theme_choice", "ev3-dark");
        } else if (text.includes('--pxt-header-background: #F2F2F2') || text.includes('--pxt-header-background: #f2f2f2') || text.includes('EV3 Light')) {
            localStorage.setItem("brickcode_theme_choice", "ev3-light");
        } else if (text.includes('--pxt-header-background: #000000') || text.includes('High Contrast')) {
            localStorage.setItem("brickcode_theme_choice", "pxt-high-contrast");
        }

        const choice = localStorage.getItem("brickcode_theme_choice");
        const isDark = choice === "ev3-dark"
            || text.includes('--pxt-header-background: #1e1e1e')
            || text.includes('--pxt-target-background1: #181818')
            || text.includes('EV3 Dark')
            || (window.pxt && window.pxt.storage && window.pxt.storage.getLocal && (window.pxt.storage.getLocal("user-pref:colorThemeIds") || "").includes('"ev3-dark"'));

        if (isDark) {
            if (document.body && !document.body.classList.contains('ev3-dark-theme')) {
                document.body.classList.add('ev3-dark-theme');
            }
            if (document.documentElement && document.documentElement.getAttribute('data-theme') !== 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        } else {
            if (document.body && document.body.classList.contains('ev3-dark-theme')) {
                document.body.classList.remove('ev3-dark-theme');
            }
            if (document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark') {
                document.documentElement.removeAttribute('data-theme');
            }
        }
    }

    const observer = new MutationObserver(updateTheme);
    if (document.head) observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    window.addEventListener('DOMContentLoaded', () => {
        if (document.head) observer.observe(document.head, { childList: true, subtree: true, characterData: true });
        updateTheme();
    });
    window.addEventListener('load', updateTheme);
    setInterval(updateTheme, 300);
}

initDarkThemeSync();

function installCommunityTranslations()
{
    function patchUtil(util)
    {
        if (!util || util._communityPatched) return;
        util._communityPatched = true;

        if (util.enableLiveLocalizationUpdates) {
            util.enableLiveLocalizationUpdates = function() {};
        }
        if (util.liveLocalizationEnabled) {
            util.liveLocalizationEnabled = function() { return false; };
        }

        const origSet = util.setLocalizedStrings;
        util.setLocalizedStrings = function(strings) {
            if (strings) {
                const isRu = (util.userLanguage && util.userLanguage() === "ru")
                    || (document.documentElement.lang && document.documentElement.lang.startsWith("ru"))
                    || (document.cookie && document.cookie.includes("PXT_LANG=ru"))
                    || strings["Blocks"] === "Блоки"
                    || strings["Help"] === "Справка"
                    || strings["Bluetooth pairing"] === "Сопряжение по Bluetooth";
                if (isRu) {
                    Object.assign(strings, RU_TRANSLATIONS);
                }
            }
            if (origSet) return origSet.call(this, strings);
        };

        const origLocalize = util._localize;
        if (origLocalize) {
            util._localize = function(s) {
                const isRu = (util.userLanguage && util.userLanguage() === "ru")
                    || (document.documentElement.lang && document.documentElement.lang.startsWith("ru"))
                    || (document.cookie && document.cookie.includes("PXT_LANG=ru"))
                    || (util.getLocalizedStrings && util.getLocalizedStrings()["Blocks"] === "Блоки");
                if (isRu && RU_TRANSLATIONS[s]) {
                    return RU_TRANSLATIONS[s];
                }
                return origLocalize.call(this, s);
            };
        }

        if (util.getLocalizedStrings) {
            const current = util.getLocalizedStrings();
            if (current) {
                const isRu = (util.userLanguage && util.userLanguage() === "ru")
                    || (document.documentElement.lang && document.documentElement.lang.startsWith("ru"))
                    || (document.cookie && document.cookie.includes("PXT_LANG=ru"))
                    || current["Blocks"] === "Блоки"
                    || current["Help"] === "Справка";
                if (isRu) {
                    Object.assign(current, RU_TRANSLATIONS);
                }
            }
        }
    }

    function checkAndPatch()
    {
        if (window.pxt && window.pxt.Util) patchUtil(window.pxt.Util);
        if (window.ts && window.ts.pxtc && window.ts.pxtc.Util) patchUtil(window.ts.pxtc.Util);
        if (window.pxt && window.pxt.appTarget && window.pxt.appTarget.appTheme) {
            window.pxt.appTarget.appTheme.disableLiveTranslations = true;
        }
    }

    checkAndPatch();
    window.addEventListener('DOMContentLoaded', checkAndPatch);
    window.addEventListener('load', checkAndPatch);

    // Keep active to catch async translation reloads
    const timer = setInterval(checkAndPatch, 100);
    setTimeout(() => {
        // Reduce check frequency after page stabilizes
        clearInterval(timer);
        setInterval(checkAndPatch, 1000);
    }, 10000);
}

installCommunityTranslations();

