import sys
import json
import os
sys.path.append('c:/PROJECT/backend')
from transformers import pipeline

MODEL_DIR = os.path.join('c:/PROJECT/backend', 'ml_models')

text = """a 59 year old male patient with no significant history of autoimmune disease presented to clinic with bleeding from a mole in the right forearm. biopsy and mutation testing identified melanoma with brafv600e mutation. pet ct showed four fdg avid soft tissue nodules in the subcutaneous tissues of chest and back abdominal mesentery and right retroperitoneum. excisional biopsy from right axillary lymph node was positive for melanin a staining and showed extracapsular invasion confirming the diagnosis of stage m1c metastatic melanoma. therefore patient received 4 cycles of ipilimumab 3 mg kg treatment every 3 weeks without significant adverse reaction except skin rash on the infusion site. twelve weeks after the last cycle of ipilimumab treatment the patient presented to ed with acute onset chest pain and shortness of breath which started 1 day prior to the presentation. vital sign showed bp 97 55 mmhg hr 106 beats min rr 20 breaths min and o2 saturation 99% while breathing room air and temperature 36.9 c. physical examination revealed distant heart sound and 5 cm of jugular venous distension. electrocardiogram showed low qrs voltage and t wave inversion on v1 v4 leads and troponin i was negative. ct angiogram showed negative for pulmonary embolism however it demonstrated pericardial thickening and moderate sized pericardial effusion which are new compared to the prior study figures and . subsequent echocardiogram showed septal bouncing and respiratory septal shift suggesting ventricular interdependence and constrictive effusive physiology. total 3 l of fluid was given for low blood pressure. bedsides pericardiocentesis drained 130 ml of serosanguinous fluid and subxiphoid pericardial window was performed the next day. biochemical study from pericardial fluid showed ldh 794 iu l protein 4.3 g dl amylase 29 iu l and glucose 99 mg dl. fluid cytology gram stain and culture were negative for neoplasm or microorganism and adenosine deaminase pcr was also negative. wbc count was 19 600 l with 90% of lymphocyte consistent with marked acute inflammation. pathology from pericardial tissue demonstrated acute fibrinous pericarditis without any evidence of malignancy or microorganism . additional examinations for autoimmune disease including rheumatoid factor anti nuclear antibodies ana double strand dna dsdna anti neutrophil cytoplasmic antibodies anca proteinase 3 and myeloperoxidase antibodies were all negative. further infectious work up including blood culture sputum culture and respiratory viral panel were all negative as well. indomethacin 50 mg three times a day was started for the treatment of acute pericarditis however patient developed worsening shortness of breath generalized weakness somnolence and diarrhea. blood pressure dropped down to 64 42 for which levophed and aggressive fluid resuscitation was initiated. repeat ct scan demonstrated persistent pericardial effusion and large bilateral pleural effusion with compressive atelectasis in the lower lobes . thoracentesis was performed to drain 1.4 l of pleural fluid and biochemistry revealed borderline exudates with ldh ratio 0.27 protein ratio 0.51 and wbc 667 l with lymphocyte dominance 57% but no evidence of malignancy or infection. brain mri showed no pathologic changes. tsh free t4 and morning random cortisol levels after the last cycle of ipilimumab treatment were 3.26 iu ml 0.8 ng dl and 10.6 g dl respectively and rechecked levels on admission showed 6.78 iu ml 0.4 ng dl and 1.0 g dl indicating hypothyroidism and adrenal insufficiency . screening colonoscopy prior to ipilimumab treatment had shown normal finding and infectious work up for the new onset diarrhea including c. diff toxin pcr stool gram stain culture and parasites was all negative. collectively these results suggested ipilimumab induced immune mediated pericarditis hypothyroidism adrenal insufficiency and diarrhea for which high dose intravenous methylprednisolone 125 mg daily was started. patient achieved remarkable clinical improvement over the 48 hours and methylprednisolone was switched to prednisone 40 mg daily and budesonide 9 mg daily on the third day and they were tapered down over a month. repeat chest x ray and ct scan showed resolved pleural and pericardial effusion and diarrhea improved gradually over the month. rechecked tsh and random cortisol levels also showed normal range of 2.85 iu ml without thyroid hormone replacement and 1.5 g dl respectively"""

def run_test():
    path = os.path.join(MODEL_DIR, 'Biobert')
    biobert_model = pipeline("text-classification", model=path, tokenizer=path)
    
    # 1. Start and end
    t1 = text[:750] + " " + text[-750:]
    res1 = biobert_model(t1, truncation=True, max_length=512)
    print("Start+End:", res1)
    
    # 2. Sequential chunks
    words = text.split()
    chunk_size = 200
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        print(f"Chunk {i//chunk_size}:", biobert_model(chunk, truncation=True, max_length=512))

run_test()
