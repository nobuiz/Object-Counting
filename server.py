
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)

CORS(app)

model = YOLO("yolov8n.pt")

@app.route("/detect", methods=["POST"])
def detect():

    file = request.files["image"]

    image_bytes = file.read()

    image = Image.open(io.BytesIO(image_bytes))

    results = model(image)

    detections = []

    for result in results:

        boxes = result.boxes

        for box in boxes:

            cls_id = int(box.cls[0])

            confidence = float(box.conf[0])

            class_name = model.names[cls_id]

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "name": class_name,
                "confidence": round(confidence * 100, 2),
                "box": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                }
            })

    return jsonify(detections)

if __name__ == "__main__":
    app.run(debug=True)

