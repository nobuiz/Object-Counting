const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const confidenceSlider = document.getElementById("confidence");
const confidenceValue = document.getElementById("confidenceValue");

const statusBadge = document.getElementById("statusBadge");
const totalObjects = document.getElementById("totalObjects");
const detectedClasses = document.getElementById("detectedClasses");
const avgConfidence = document.getElementById("avgConfidence");
const heroCount = document.getElementById("heroCount");
const resultTable = document.getElementById("resultTable");

let uploadedImage = null;

const demoObjects = [
  "Person",
  "Car",
  "Dog",
  "Cat",
  "Bottle",
  "Laptop",
  "Chair",
  "Backpack",
  "Phone",
  "Cup"
];

uploadBox.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    showImage(file);
  }
});

uploadBox.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadBox.classList.remove("dragover");

  const file = event.dataTransfer.files[0];
  if (file) {
    showImage(file);
  }
});

confidenceSlider.addEventListener("input", () => {
  confidenceValue.textContent = `${confidenceSlider.value}%`;
});

function showImage(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    uploadedImage = event.target.result;

    imagePreview.innerHTML = `
      <img src="${uploadedImage}" alt="Uploaded image" id="previewImage">
    `;

    resetResults();
    statusBadge.textContent = "Ready";
    statusBadge.classList.remove("done");
  };

  reader.readAsDataURL(file);
}

analyzeBtn.addEventListener("click", () => {
  if (!uploadedImage) {
    alert("Please upload an image first.");
    return;
  }

  statusBadge.textContent = "Analyzing...";
  statusBadge.classList.remove("done");

  resultTable.innerHTML = `
    <tr>
      <td colspan="3">AI is analyzing your image...</td>
    </tr>
  `;

  setTimeout(() => {
    const results = generateDemoResults();
    displayResults(results);
    drawDetectionBoxes(results);

    statusBadge.textContent = "Completed";
    statusBadge.classList.add("done");
  }, 900);
});

clearBtn.addEventListener("click", () => {
  uploadedImage = null;
  fileInput.value = "";

  imagePreview.innerHTML = `<p>No image uploaded yet</p>`;
  statusBadge.textContent = "Waiting";
  statusBadge.classList.remove("done");

  resetResults();
});

function generateDemoResults() {
  const numberOfClasses = Math.floor(Math.random() * 4) + 2;
  const selectedObjects = shuffleArray(demoObjects).slice(0, numberOfClasses);

  return selectedObjects.map((object) => {
    return {
      name: object,
      count: Math.floor(Math.random() * 6) + 1,
      confidence: Math.floor(Math.random() * 16) + Number(confidenceSlider.value)
    };
  });
}

function displayResults(results) {
  const total = results.reduce((sum, item) => sum + item.count, 0);

  const confidenceAverage = Math.round(
    results.reduce((sum, item) => sum + item.confidence, 0) / results.length
  );

  totalObjects.textContent = total;
  detectedClasses.textContent = results.length;
  avgConfidence.textContent = `${confidenceAverage}%`;
  heroCount.textContent = total;

  resultTable.innerHTML = "";

  results.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.count}</td>
      <td>${item.confidence}%</td>
    `;

    resultTable.appendChild(row);
  });
}

function drawDetectionBoxes(results) {
  const previewImage = document.getElementById("previewImage");

  if (!previewImage) return;

  const oldBoxes = document.querySelectorAll(".detection-box");
  oldBoxes.forEach((box) => box.remove());

  const totalBoxes = Math.min(
    results.reduce((sum, item) => sum + item.count, 0),
    10
  );

  for (let i = 0; i < totalBoxes; i++) {
    const object = results[i % results.length];

    const box = document.createElement("div");
    box.className = "detection-box";

    const width = randomNumber(12, 26);
    const height = randomNumber(12, 28);
    const left = randomNumber(5, 75);
    const top = randomNumber(10, 75);

    box.style.width = `${width}%`;
    box.style.height = `${height}%`;
    box.style.left = `${left}%`;
    box.style.top = `${top}%`;

    box.innerHTML = `
      <span class="detection-label">${object.name} ${object.confidence}%</span>
    `;

    imagePreview.appendChild(box);
  }
}

function resetResults() {
  totalObjects.textContent = "0";
  detectedClasses.textContent = "0";
  avgConfidence.textContent = "0%";
  heroCount.textContent = "0";

  resultTable.innerHTML = `
    <tr>
      <td colspan="3">No results yet</td>
    </tr>
  `;
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}