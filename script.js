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
});
