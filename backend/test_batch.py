import sys
import json
import os
sys.path.append('c:/PROJECT/backend')
from app.predict import predict

def run_tests():
    path = r"c:\PROJECT\test\test (1).json"
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} records.")
    
    correct = 0
    total = 20
    for i in range(total):
        item = data[i]
        text = item.get('patient', '')
        true_label = str(item.get('label'))
        res = predict(text, model_set='discharge')
        pred_label = '1' if 'PH detected' in res['final_prediction'] else '0'
        print(f"[{i}] True: {true_label}, Pred: {pred_label} | {res['final_prediction']}")
        if pred_label == true_label:
            correct += 1
    print(f"Accuracy: {correct}/{total}")

if __name__ == '__main__':
    run_tests()
