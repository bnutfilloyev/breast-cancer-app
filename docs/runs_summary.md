# YOLO Training Runs Summary

Quyidagi jadval `runs/detect/` papkasidagi checkpointlar va natijalar bo'yicha asosiy ko'rsatkichlarni jamlaydi.

|Run|Epochs|Best epoch|Best mAP50-95|Best mAP50|Best Precision|Best Recall|Final mAP50-95|Final Precision|Final Recall|
|---|---|---|---|---|---|---|---|---|---|
|train3|100|86|0.1477|0.2889|0.4119|0.2733|0.1395|0.3758|0.3084|
|train3 (2)|100|86|0.1477|0.2889|0.4119|0.2733|0.1395|0.3758|0.3084|
|train2|100|77|0.1014|0.2145|0.6416|0.1626|0.0652|0.2212|0.2733|
|train5|100|72|0.0753|0.1840|0.2164|0.2382|0.0558|0.2030|0.2379|

**Eslatma:** `train3` va `train3 (2)` natijalari bir xil bo'lib, ensemble yoki threshold tuning uchun asosiy nomzod. `train2` va `train5` pastroq ko'rsatkichlar kuzatgan – label sifati va data balansini qayta ko'rib chiqing.
