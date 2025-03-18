document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loadBtn").addEventListener("click", () => {
        let fileInput = document.getElementById("fileInput");
        let status = document.getElementById("status");

        if (fileInput.files.length > 0) {
            let file = fileInput.files[0];
            let reader = new FileReader();

            reader.onload = function (event) {
                try {
                    let jsonData = JSON.parse(event.target.result);

                    chrome.runtime.sendMessage({ action: "loadData", data: jsonData }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                            status.textContent = "Błąd komunikacji z rozszerzeniem.";
                        } else if (response && response.success) {
                            status.textContent = "Dane wprowadzone!";
                        } else {
                            status.textContent = "Błąd parsowania danych.";
                        }
                    });
                } catch (error) {
                    status.textContent = "Niepoprawny format pliku JSON.";
                }
            };

            reader.readAsText(file);
        } else {
            alert("Wybierz plik!");
        }
    });
});
