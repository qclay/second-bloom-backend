# Districts and cities: Tashkent and Samarqand (Uzbekistan)

Reference list from official/admin division sources (Wikipedia: Districts of Uzbekistan, Tashkent Region, Samarkand Region). Use for seed data or API validation.

---

## Tashkent City (capital city – 12 districts)

Tashkent as a **city** (not the surrounding region) is divided into 12 districts (since 2020, when Yangihayot was created):

| No | District name   | Notes                    |
|----|-----------------|--------------------------|
| 1  | Bektemir        |                          |
| 2  | Chilanzar       |                          |
| 3  | Yashnobod       | (formerly Khamza)        |
| 4  | Mirobod        | (Mirabad variant)        |
| 5  | Mirzo Ulugbek  | (Mirzo-Ulugbek)          |
| 6  | Sergeli        |                          |
| 7  | Shayxontoxur   | (Shayhontohur / Shaikhontohur) |
| 8  | Olmazor        |                          |
| 9  | Uchtepa        |                          |
| 10 | Yakkasaray     |                          |
| 11 | Yunusabad      |                          |
| 12 | Yangihayot     | Created November 2020    |

**Tashkent City districts (list for code):**  
Bektemir, Chilanzar, Yashnobod, Mirobod, Mirzo Ulugbek, Sergeli, Shayxontoxur, Olmazor, Uchtepa, Yakkasaray, Yunusabad, Yangihayot

---

## Tashkent Region (oblast – 15 districts)

The **region** (viloyat) around the capital. Capital of the region: **Nurafshon**.

| No | District name     | District capital |
|----|-------------------|------------------|
| 1  | Bekabad           | Zafar            |
| 2  | Boʻstonliq        | Gʻazalkent       |
| 3  | Boʻka             | Boʻka            |
| 4  | Chinoz            | Chinoz           |
| 5  | Qibray            | Qibray           |
| 6  | Ohangaron         | Ohangaron        |
| 7  | Oqqoʻrgʻon        | Oqqoʻrgʻon       |
| 8  | Parkent           | Parkent          |
| 9  | Piskent           | Piskent          |
| 10 | Quyichirchiq      | Doʻstobod        |
| 11 | Zangiota          | Eshonguzar       |
| 12 | Oʻrtachirchiq     | Nurafshon        |
| 13 | Yangiyoʻl         | Yangiyoʻl        |
| 14 | Yuqorichirchiq    | Yangibozor       |
| 15 | Tashkent District | Keles            |

**Major cities in Tashkent Region:**  
Nurafshon, Olmaliq, Angren, Bekabad, Ohangaron, Chirchiq, Yangiyoʻl, Oqqoʻrgʻon, Gʻazalkent, Boʻka, Parkent, Piskent, Chinoz, Keles, Doʻstobod, Yangiobod.

---

## Samarqand Region (14 districts + 2 district-level cities)

**District-level cities (not part of the 14 districts):**

- **Samarqand** (Samarkand) – regional capital  
- **Kattakurgan**

**14 districts:**

| No | District name     | District capital |
|----|-------------------|------------------|
| 1  | Bulungʻur         | Bulungʻur        |
| 2  | Ishtixon          | Ishtixon         |
| 3  | Jomboy            | Jomboy           |
| 4  | Kattakurgan       | Payshanba        |
| 5  | Qoʻshrabot        | Qoʻshrabot       |
| 6  | Narpay            | Oqtosh           |
| 7  | Nurobod           | Nurobod          |
| 8  | Oqdaryo           | Loyish           |
| 9  | Paxtachi          | Ziyovuddin       |
| 10 | Payariq           | Payariq          |
| 11 | Pastdargʻom       | Juma             |
| 12 | Samarqand District| Gulobod         |
| 13 | Toyloq            | Toyloq           |
| 14 | Urgut             | Urgut            |

**Other cities in Samarqand Region (e.g. district centres / towns):**  
Bulungʻur, Ishtixon, Jomboy, Oqtosh, Payariq, Chelak, Juma, Nurobod, Urgut, Payshanba, Qoʻshrabot, Loyish, Ziyovuddin, Gulobod, Toyloq.

---

## Summary

- **Tashkent City:** 12 districts (list above). No “cities” under it in the admin sense – it is the city.
- **Tashkent Region:** 15 districts; 16 cities (Nurafshon, Olmaliq, Angren, etc.).
- **Samarqand Region:** 2 district-level cities (Samarqand, Kattakurgan) + 14 districts with their district capitals as towns/cities.

If you use this for **seed**:  
- For **Tashkent City** create one “city” (e.g. “Tashkent”) under a “Tashkent City” region and attach the 12 districts to that city.  
- For **Tashkent Region** create the region and 15 districts (and optionally cities).  
- For **Samarqand** create the region, the 2 cities (Samarqand, Kattakurgan), and the 14 districts (with district capitals as cities if your model has both districts and cities).
