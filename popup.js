document.addEventListener("DOMContentLoaded", function () {
    let fileInput = document.getElementById("fileInput");
    let fileLabel = document.querySelector(".file-label span");
    let loadBtn = document.getElementById("loadBtn");
    let downloadBtn = document.getElementById("downloadBtn");
    let status = document.getElementById("status");

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileLabel.textContent = `📄 ${fileInput.files[0].name}`;
            fileLabel.style.color = "#4CAF50";
        } else {
            fileLabel.textContent = "📂 Wybierz plik JSON";
            fileLabel.style.color = "#555";
        }
    });

    loadBtn.addEventListener("click", () => {
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
                            status.textContent = "✅ Dane wprowadzone!";
                        } else {
                            status.textContent = "❌ Błąd parsowania danych.";
                        }
                    });
                } catch (error) {
                    status.textContent = "⚠️ Niepoprawny format pliku JSON.";
                }
            };

            reader.readAsText(file);
        } else {
            alert("Wybierz plik!");
        }
    });

    downloadBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "getFormFields" }, (response) => {
            if (response && response.success) {
                let jsonData = JSON.stringify(response.data, null, 4);
                let blob = new Blob([jsonData], { type: "application/json" });
                let url = URL.createObjectURL(blob);

                let a = document.createElement("a");
                a.href = url;
                a.download = "formularz.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                status.textContent = "📥 Pobrano formularz!";
            } else {
                status.textContent = "⚠️ Błąd pobierania formularza.";
            }
        });
    });
});