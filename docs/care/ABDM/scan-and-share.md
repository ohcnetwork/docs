# Scan and Share Feature in CARE

The Scan and Share feature in CARE is designed to help patients register quickly by scanning a QR code at the hospital counter. This eliminates the need to stand in a long queue. Once the QR is scanned and the initial registration is complete, patients are directed to a special ABDM queue to continue the rest of their registration process.

For more details on the feature, visit [ABDM Scan and Share](https://abdm.gov.in/scan-share).

---

## How It Works

1. **Scan the QR Code:**  
   Patients scan the QR code provided at the hospital counter.

2. **Quick Registration:**  
   Scanning the code initiates a fast registration process.

3. **Proceed to Special Queue:**  
   After registering, patients are guided to a special ABDM queue to complete their registration.

---

## Creating the QR Code

There are two ways to generate the Scan and Share QR code for a facility:

### 1. Using ABDM's Health Facility Dashboard

- **Reference Document:**  
  Follow the Software Linkage section in the [User Manual](https://sandboxcms.abdm.gov.in/uploads/User_Manual_New_58c71f13dc.pdf).

### 2. Creating the QR Code Manually

- **Step 1:** Obtain the facility’s Health Facility ID (HF_ID).
  
- **Step 2:** Create a URL by replacing the placeholders in the following link: https://phr.abdm.gov.in/share-profile?hip-id=HF_ID&counter-id=COUNTER_ID

    - Replace `HF_ID` with the facility's Health Facility ID.

    - Replace `COUNTER_ID` with the counter number or name (use dashes or underscores instead of spaces; if not applicable, simply use `1`).

    - **Example URL:** https://phr.abdm.gov.in/share-profile?hip-id=IN3210000018&counter-id=1

- **Step 3:** Use an online QR code generator, such as [The QR Code Generator](https://www.the-qrcode-generator.com/), to create and download the QR code by pasting the URL.

- **Step 4:** Place the generated QR code within the facility premises for patients to scan.

---

## Prerequisite Configuration in CARE

For the Scan and Share feature to work properly, ensure the Health Facility ID is configured in CARE:

1. Open CARE and navigate to the facility settings page.
2. Click on **Configure Health Facility**.
3. Enter the Health Facility ID (HF_ID) in the provided input field.
4. Click **Submit** to save the configuration.

---

## Demo Video

Watch this short demo to see how a patient can use the Scan and Share feature:  
[Demo Video](https://drive.google.com/file/d/11Dwf_wId2VpdSpSSbmgWEwYoAFWGxBs_/view?usp=sharing)
