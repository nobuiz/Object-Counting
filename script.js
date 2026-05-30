
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const analyzeBtn = document.getElementById("analyzeBtn");

let uploadedImage = null;

uploadBox.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {

  const file = event.target.files[0];

  if (file) {
    showImage(file);
  }
});

function showImage(file) {

  const reader = new FileReader();

  reader.onload = function(event) {

    uploadedImage = event.target.result;

    imagePreview.innerHTML = `
      <img src="${uploadedImage}" id="previewImage">
    `;
  };

  reader.readAsDataURL(file);
}

analyzeBtn.addEventListener("click", async () => {

  if (!fileInput.files[0]) {
    alert("Upload image first");
    return;
  }

  const formData = new FormData();

  formData.append("image", fileInput.files[0]);

  try {

    const response = await fetch("http://127.0.0.1:5000/detect", {
      method: "POST",
      body: formData
    });

    const results = await response.json();

    drawDetectionBoxes(results);
    updateStats(results);

    console.log(results);

  } catch (error) {

    console.error(error);

    alert("Python server not running");
  }
});

function drawDetectionBoxes(results) {

  const previewImage = document.getElementById("previewImage");

  if (!previewImage) return;

  document
    .querySelectorAll(".detection-box")
    .forEach(box => box.remove());

  const imageWidth = previewImage.clientWidth;
  const imageHeight = previewImage.clientHeight;

  results.forEach((item) => {

    const box = document.createElement("div");

    box.className = "detection-box";

    const x1 = item.box.x1;
    const y1 = item.box.y1;
    const x2 = item.box.x2;
    const y2 = item.box.y2;

    box.style.left =
      `${(x1 / previewImage.naturalWidth) * imageWidth}px`;

    box.style.top =
      `${(y1 / previewImage.naturalHeight) * imageHeight}px`;

    box.style.width =
      `${((x2 - x1) / previewImage.naturalWidth) * imageWidth}px`;

    box.style.height =
      `${((y2 - y1) / previewImage.naturalHeight) * imageHeight}px`;

    box.innerHTML = `
      <span class="detection-label">
        ${item.name} ${item.confidence}%
      </span>
    `;

    imagePreview.appendChild(box);
  });
}
 
function updateStats(results) {

  const totalObjects =
    document.getElementById("totalObjects");

  const detectedClasses =
    document.getElementById("detectedClasses");

  const avgConfidence =
    document.getElementById("avgConfidence");

  totalObjects.textContent = results.length;

  const uniqueClasses =
    [...new Set(results.map(r => r.name))];

  detectedClasses.textContent =
    uniqueClasses.length;

  const avg =
    results.reduce(
      (sum, item) => sum + item.confidence,
      0
    ) / results.length;

  avgConfidence.textContent =
    `${Math.round(avg)}%`;
}

