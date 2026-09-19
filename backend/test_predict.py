import sys
sys.path.append('c:/PROJECT/backend')
from app.predict import predict

text = "Patient was admitted with complaints of shortness of breath and cough."

print("Testing Default model set:")
res1 = predict(text, model_set='default')
print("\nTesting Discharge model set:")
res2 = predict(text, model_set='discharge')
print("\nResults:")
print("Default:", res1['final_prediction'], res1['confidence'])
print("Discharge:", res2['final_prediction'], res2['confidence'], "BioBERT:", res2.get('biobert_result'))
