chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // IMPORT
    if (request.action === "loadData") {
        try {
            let jsonData = request.data;

            chrome.storage.local.set({ formData: jsonData }, () => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            world: "MAIN",
                            func: (data) => {
                                try {
                                    const appElement = document.querySelector('div[data-ng-show="view === \'form\'"]');
                                    if (!appElement) throw new Error("Nie znaleziono elementu z data-ng-show='view === form'");

                                    const scope = angular.element(appElement).scope();
                                    if (!scope) throw new Error("Nie znaleziono scope'a Angulara");

                                    scope.dane = data;
                                    scope.$apply();

                                    console.log("✅ Model Angulara załadowany.");
                                } catch (err) {
                                    console.error("❌ Błąd przy ładowaniu danych:", err);
                                }
                            },
                            args: [jsonData]
                        });
                    }
                });

                sendResponse({ success: true });
            });
        } catch (error) {
            sendResponse({ success: false, error: "Błąd parsowania JSON" });
        }

        return true;
    }

    // EKSPORT
    if (request.action === "getFormFields") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    world: "MAIN",
                    func: () => {
                        try {
                            const appElement = document.querySelector('div[data-ng-show="view === \'form\'"]');
                            if (!appElement) throw new Error("Nie znaleziono elementu z data-ng-show='view === form'");

                            const scope = angular.element(appElement).scope();
                            if (!scope) throw new Error("Nie znaleziono scope'a Angulara");

                            return scope.dane;
                        } catch (err) {
                            console.error("❌ Błąd podczas eksportu danych:", err);
                            return null;
                        }
                    }
                }, (results) => {
                    if (results && results[0] && results[0].result) {
                        sendResponse({ success: true, data: results[0].result });
                    } else {
                        sendResponse({ success: false, error: "Nie udało się odczytać danych z Angulara." });
                    }
                });
            } else {
                sendResponse({ success: false, error: "Brak aktywnej zakładki." });
            }
        });

        return true;
    }
});