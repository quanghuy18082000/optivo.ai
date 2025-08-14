# Select Custom Range Issue - Debug Guide

## 🎯 **Problem**

When user selects "Custom Range" for the first time:

1. **Selection doesn't stick** - The dropdown closes but "Custom Range" is not selected
2. **Need to select twice** - User has to open dropdown and select again
3. **Custom date inputs don't appear** - Because selectedTimePeriod is not properly set

## 🔧 **Root Cause Analysis**

### **1. Double Event Handling**

```javascript
// ISSUE - Both @change and watch are handling the same event
@change="handleTimePeriodChange(option.value)"  // First handler
watch(() => selectedTimePeriod.value, (newValue) => {
  handleTimePeriodChange(newValue);  // Second handler - CONFLICT!
});
```

### **2. Timing Issues**

```javascript
// ISSUE - v-model might not be updated when @change fires
@change="(option) => {
  console.log('Current selectedTimePeriod:', selectedTimePeriod.value); // Still old value
  handleTimePeriodChange(option.value);
}"
```

### **3. Flag Conflicts**

```javascript
// ISSUE - isUpdatingProgrammatically flag might interfere
const handleTimePeriodChange = (value) => {
  isUpdatingProgrammatically.value = true; // Set flag
  selectedTimePeriod.value = value; // This might not work if v-model conflicts
  // ... rest of logic
};
```

## ✅ **Debugging Steps Applied**

### **1. Enhanced Logging**

**Added comprehensive console logging:**

```javascript
@change="(option) => {
  console.log('Select @change triggered with:', option.value);
  console.log('Current selectedTimePeriod before change:', selectedTimePeriod);

  // Set flag to prevent watch from double-handling
  isUpdatingProgrammatically.value = true;

  // Use nextTick to ensure v-model is updated first
  $nextTick(() => {
    console.log('selectedTimePeriod after nextTick:', selectedTimePeriod);
    handleTimePeriodChange(option.value);
  });
}"
```

### **2. Separated Event Handling**

**Removed double handling:**

```javascript
// Watch is now only for debugging, not handling
watch(
  () => selectedTimePeriod.value,
  (newValue, oldValue) => {
    console.log("selectedTimePeriod watch triggered:", {
      newValue,
      oldValue,
      isUpdatingProgrammatically: isUpdatingProgrammatically.value,
    });

    // Don't handle here - let @change handle it to avoid double processing
    // This watch is just for debugging and monitoring state changes
  }
);
```

### **3. Added Debug UI**

**Visual state monitoring:**

```html
<!-- Debug Info -->
<div class="mt-2 p-2 bg-gray-100 rounded text-xs">
  <div>
    <strong>selectedTimePeriod:</strong> {{ selectedTimePeriod || 'null' }}
  </div>
  <div>
    <strong>isUpdatingProgrammatically:</strong> {{ isUpdatingProgrammatically
    }}
  </div>
  <div><strong>isEditingCustomDates:</strong> {{ isEditingCustomDates }}</div>
  <div>
    <strong>customDateRange:</strong> {{ JSON.stringify(customDateRange) }}
  </div>
</div>
```

### **4. Enhanced handleTimePeriodChange**

**Better state management:**

```javascript
const handleTimePeriodChange = (value) => {
  console.log("handleTimePeriodChange called with:", value);
  console.log("Current selectedTimePeriod.value:", selectedTimePeriod.value);

  // Set flag to prevent watch loops
  isUpdatingProgrammatically.value = true;

  // Ensure the selected time period is set (in case v-model hasn't updated yet)
  if (selectedTimePeriod.value !== value) {
    console.log(
      "Updating selectedTimePeriod from",
      selectedTimePeriod.value,
      "to",
      value
    );
    selectedTimePeriod.value = value;
  }

  // ... rest of logic
};
```

### **5. Test Component**

**Created `SelectTest.vue` for isolated testing:**

- **Event Logging** - Track all Select component events
- **State Monitoring** - Real-time state display
- **Manual Testing** - Test custom selection behavior
- **Programmatic Testing** - Test setting values via code

## 🧪 **Debug Process**

### **Step 1: Check Console Logs**

When selecting "Custom Range", look for:

```
Select @change triggered with: custom
Current selectedTimePeriod before change: [current_value]
selectedTimePeriod after nextTick: custom
handleTimePeriodChange called with: custom
Current selectedTimePeriod.value: custom
Switching to custom mode, saved custom range: {...}
```

### **Step 2: Monitor Debug UI**

Watch the debug panel for:

- **selectedTimePeriod** should change to "custom"
- **isUpdatingProgrammatically** should briefly be true
- **customDateRange** should show saved values (if any)

### **Step 3: Check v-if Condition**

The custom date inputs should appear when:

```html
<div v-if="selectedTimePeriod === 'custom'" class="mt-4"></div>
```

### **Step 4: Test with SelectTest.vue**

Use the isolated test component to:

1. Test Select component behavior without other interference
2. Monitor event sequence
3. Verify v-model updates
4. Test programmatic vs user selection

## 🔍 **Potential Issues to Check**

### **1. Select Component Implementation**

```javascript
// Check if Select component properly updates v-model
// Look for timing issues in the Select component itself
```

### **2. Vue Reactivity**

```javascript
// Check if selectedTimePeriod is properly reactive
// Verify ref() is working correctly
```

### **3. Event Timing**

```javascript
// Check if @change fires before or after v-model update
// Verify nextTick() is working as expected
```

### **4. Flag Interference**

```javascript
// Check if isUpdatingProgrammatically is interfering
// Verify flag is reset properly
```

## 🎯 **Expected Behavior**

### **✅ When Working Correctly:**

1. **User clicks "Custom Range"**
2. **@change event fires** with option.value = "custom"
3. **nextTick ensures v-model is updated**
4. **handleTimePeriodChange is called** with "custom"
5. **selectedTimePeriod.value becomes "custom"**
6. **v-if condition becomes true**
7. **Custom date inputs appear**
8. **Dropdown shows "Custom Range" as selected**

### **❌ When Broken:**

1. **User clicks "Custom Range"**
2. **@change event fires** but something interferes
3. **selectedTimePeriod.value doesn't update** or updates incorrectly
4. **v-if condition remains false**
5. **Custom date inputs don't appear**
6. **Dropdown doesn't show selection**
7. **User has to select again**

## 📁 **Files for Debugging**

1. **`/src/modules/worklogs/components/WorklogFilters.vue`** - Main component with debug logging
2. **`/src/test/SelectTest.vue`** - Isolated test component
3. **Browser Console** - Check for error messages and debug logs
4. **Vue DevTools** - Monitor reactive state changes

## 🔧 **Next Steps**

1. **Test with debug UI** - Open filter panel and watch debug info
2. **Check console logs** - Look for the expected log sequence
3. **Use SelectTest.vue** - Test Select component in isolation
4. **Check Select component** - Verify the Select component implementation
5. **Test in different browsers** - Rule out browser-specific issues

The debug setup should help identify exactly where the selection process is failing! 🎯
