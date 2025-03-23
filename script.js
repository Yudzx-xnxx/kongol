document.getElementById("processImage").addEventListener("click", async function () {
    const fileInput = document.getElementById("imageInput");
    const skinColor = document.getElementById("skinColor").value;

    if (!fileInput.files.length) {
        alert("Pilih gambar dulu!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = async function () {
        const base64Image = reader.result.split(",")[1];

        let promptText = "Ubah warna kulit karakter menjadi ";
        if (skinColor === "hitam") promptText += "hitam";
        else if (skinColor === "coklat") promptText += "coklat";
        else promptText = "Biarkan warna kulit tetap sama";

        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AIzaSyDdfNNmvphdPdHSbIvpO5UkHdzBwx7NVm0", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { text: promptText },
                        {
                            inlineData: {
                                mimeType: file.type,
                                data: base64Image
                            }
                        }
                    ],
                    generationConfig: {
                        responseModalities: ["Text", "Image"]
                    }
                })
            });

            if (!response.ok) throw new Error("Gagal memproses gambar");

            const result = await response.json();

            let resultImage;
            for (const part of result.candidates[0].content.parts) {
                if (part.inlineData) {
                    resultImage = `data:image/png;base64,${part.inlineData.data}`;
                }
            }

            if (resultImage) {
                document.getElementById("result").innerHTML = `<img src="${resultImage}" alt="Hasil">`;
            } else {
                alert("Gagal mengubah warna kulit.");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan: " + error.message);
        }
    };

    reader.readAsDataURL(file);
});