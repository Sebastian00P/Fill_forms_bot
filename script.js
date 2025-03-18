chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
                                Object.keys(data).forEach(key => {
                                    let inputField = document.getElementById(key);
                                    if (inputField) {
                                        inputField.value = data[key];
                                        console.log(`Uzupełniono: ${key} = ${data[key]}`);
                                    } else {
                                        console.warn(`Nie znaleziono pola o ID: ${key}`);
                                    }
                                });
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

    if (request.action === "getFormFields") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    world: "MAIN",
                    func: () => {
                        let formFields = {};
                        let inputs = document.querySelectorAll("input, select, textarea");

                        inputs.forEach(input => {
                            let name = input.id || input.name;
                            if (name) {
                                formFields[name] = input.value;
                            }
                        });

                        return formFields;
                    }
                }, (results) => {
                    if (results && results[0] && results[0].result) {
                        sendResponse({ success: true, data: results[0].result });
                    } else {
                        sendResponse({ success: false, error: "Nie znaleziono pól formularza." });
                    }
                });
            } else {
                sendResponse({ success: false, error: "Brak aktywnej zakładki." });
            }
        });

        return true;
    }
});