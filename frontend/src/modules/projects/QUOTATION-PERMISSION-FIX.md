# Quotation Permission Handling Fix

## 🎯 **Problem Statement**

When a user doesn't have `project.update_quotation` permission:

- API returns `quotation: null` in project data
- EditProjectPage was still creating default quotation entries
- When updating project, it would send empty quotation array instead of preserving null
- This caused quotation data to be lost/overwritten

## ✅ **Solution Implemented**

### **1. Preserve Original Quotation Data**

Added `originalQuotationData` ref to store the original quotation value from API:

```javascript
// Store original quotation data for users without edit permission
const originalQuotationData = ref(null);
```

### **2. Handle API Response Based on Permissions**

Modified `fetchProjectDetails()` to handle quotation data based on user permissions:

```javascript
// Store original quotation data for users without quotation edit permission
if (!canEditQuotation.value && project.quotation === null) {
  // User doesn't have permission and API returned null - keep it null
  console.log(
    "🔒 User has no quotation edit permission, API returned null - preserving null"
  );
  originalQuotationData.value = null;
} else if (!canEditQuotation.value && project.quotation) {
  // User doesn't have permission but has existing quotation data - preserve it
  console.log(
    "🔒 User has no quotation edit permission, preserving existing quotation data:",
    project.quotation
  );
  originalQuotationData.value = project.quotation;
} else if (canEditQuotation.value) {
  console.log("✅ User has quotation edit permission, can modify quotations");
}

// Only add default quotation if user has permission and no quotations exist
if (canEditQuotation.value && formData.value.quotations.length === 0) {
  formData.value.quotations.push({
    id: uuidv4(),
    position_id: "",
    quantity: 1,
    start_date: formData.value.start_date,
    end_date: formData.value.end_date,
    isContinuation: false,
  });
}
```

### **3. Skip Quotation Validation for Users Without Permission**

Modified `validateStep2()` to skip validation when user doesn't have permission:

```javascript
const validateStep2 = () => {
  // Skip validation if user doesn't have quotation edit permission
  if (!canEditQuotation.value) {
    return true;
  }

  const newErrors = {};
  // ... rest of validation logic
};
```

### **4. Conditional Validation in Update Functions**

Updated both `updateProject()` and `skipAndSubmit()` to only validate step 2 when user has permission:

```javascript
// Only validate step 2 if user has quotation edit permission
if (canEditQuotation.value && !validateStep2()) {
  currentStep.value = 2;
  return;
}
```

### **5. Preserve Original Data in API Payload**

Modified the project update payload to preserve original quotation data:

```javascript
const projectData = {
  name: formData.value.projectName.trim(),
  description: formData.value.description || "",
  start_date: formData.value.start_date,
  end_date: formData.value.end_date,

  // Handle quotation based on user permissions
  quotation: canEditQuotation.value
    ? formData.value.quotations
        .filter((q) => q.position_id)
        .map((q) => ({
          position_id: q.position_id,
          quantity: parseFloat(q.quantity),
          start_date: q.start_date,
          end_date: q.end_date,
        }))
    : originalQuotationData.value, // Preserve original data if no permission

  // ... rest of project data
};
```

## 🔄 **Flow Comparison**

### **Before (Broken)**

```
1. API returns project with quotation: null (no permission)
2. EditProjectPage creates default quotation entry
3. User edits other fields (basic info, plan)
4. On save: sends quotation: [] (empty array)
5. Server overwrites quotation with empty data
```

### **After (Fixed)**

```
1. API returns project with quotation: null (no permission)
2. EditProjectPage stores originalQuotationData = null
3. No default quotation created (user has no permission)
4. User edits other fields (basic info, plan)
5. On save: sends quotation: null (preserved original)
6. Server keeps quotation unchanged
```

## 🎭 **User Scenarios**

### **Scenario 1: User with No Quotation Permission + API Returns Null**

- **API Response**: `quotation: null`
- **Form Behavior**: No quotation fields shown (step 2 disabled)
- **Validation**: Step 2 validation skipped
- **Update Payload**: `quotation: null` (preserved)
- **Result**: ✅ Quotation remains null, other fields updated

### **Scenario 2: User with No Quotation Permission + Existing Quotation Data**

- **API Response**: `quotation: [existing data]`
- **Form Behavior**: No quotation fields shown (step 2 disabled)
- **Validation**: Step 2 validation skipped
- **Update Payload**: `quotation: [existing data]` (preserved)
- **Result**: ✅ Existing quotation preserved, other fields updated

### **Scenario 3: User with Quotation Permission**

- **API Response**: `quotation: [data or null]`
- **Form Behavior**: Quotation fields shown and editable
- **Validation**: Full step 2 validation applied
- **Update Payload**: `quotation: [modified data]`
- **Result**: ✅ User can modify quotation as expected

## 🔍 **Debug Logging Added**

Added comprehensive logging to track quotation handling:

```javascript
// During data loading
console.log(
  "🔒 User has no quotation edit permission, API returned null - preserving null"
);
console.log(
  "🔒 User has no quotation edit permission, preserving existing quotation data:",
  project.quotation
);
console.log("✅ User has quotation edit permission, can modify quotations");

// During update
console.log("📤 Preparing project update data...");
console.log("🔐 Can edit quotation:", canEditQuotation.value);
console.log("📋 Original quotation data:", originalQuotationData.value);
console.log("📤 Final project data being sent:", projectData);
console.log("📋 Quotation in payload:", projectData.quotation);
```

## ✅ **Testing Checklist**

### **Test Case 1: No Permission + Null Quotation**

- [ ] Navigate to project edit page as user without quotation permission
- [ ] Verify API returns `quotation: null`
- [ ] Verify step 2 is disabled
- [ ] Edit basic info and plan
- [ ] Submit project
- [ ] Verify payload contains `quotation: null`
- [ ] Verify project updates successfully without affecting quotation

### **Test Case 2: No Permission + Existing Quotation**

- [ ] Navigate to project with existing quotation as user without permission
- [ ] Verify step 2 is disabled
- [ ] Edit other fields
- [ ] Submit project
- [ ] Verify existing quotation data is preserved in payload
- [ ] Verify project updates without losing quotation data

### **Test Case 3: With Permission**

- [ ] Navigate to project as user with quotation permission
- [ ] Verify step 2 is enabled and editable
- [ ] Modify quotation data
- [ ] Submit project
- [ ] Verify modified quotation data is sent in payload
- [ ] Verify quotation updates successfully

## 🎉 **Result**

The fix ensures that:

1. **🔒 Permission Respect**: Users without quotation permission cannot modify quotation data
2. **💾 Data Preservation**: Original quotation data (including null) is preserved during updates
3. **🚫 No Validation Errors**: Users without permission don't get validation errors for quotation
4. **✅ Seamless UX**: Users can still edit other project fields without issues
5. **🔍 Debug Visibility**: Clear logging shows what's happening with quotation data

**No more quotation data loss when users edit other project fields!** 🎊
