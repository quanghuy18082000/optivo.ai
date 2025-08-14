# Custom Range Selection Debug

## 🎯 **Current Issue**

When user selects "Custom Range" for the first time:

1. **Selection doesn't stick** - Dropdown closes but "Custom Range" is not selected
2. **Need to select twice** - User has to open dropdown and select again
3. **Custom date inputs don't appear** - Because selectedTimePeriod is not properly set to 'custom'

## 🔧 **Debug Setup Applied**

### **1. Enhanced @change Handler**

```javascript
@change="(option) => {
  console.log('Select @change triggered with:', option.value);
  console.log('Current selectedTimePeriod before:', selectedTimePeriod);

  // For custom range, we need special handling
  if (option.value === 'custom') {
    console.log('Handling custom range selection');
    selectedTimePeriod.value = 'custom';

    // Restore saved custom dates if available
    if (customDateRange.value.from && customDateRange.value.to) {
      localFilters.value.createdAfter = customDateRange.value.from;
      localFilters.value.createdBefore = customDateRange.value.to;
      console.log('Restored custom dates:', customDateRange.value);
    } else {
      // Clear dates if no saved range
      localFilters.value.createdAfter = '';
      localFilters.value.createdBefore = '';
      console.log('No saved custom dates, clearing');
    }
  } else {
    // For predefined periods, use normal handling
    handleTimePeriodChange(option.value);
  }

  console.log('selectedTimePeriod after:', selectedTimePeriod);
}"
```

### **2. Select Component Debug**

Added logging to `Select.vue` `selectOption` function:

```javascript
const selectOption = (option) => {
  if (option.disabled) return;

  console.log("Select component - selectOption called with:", option);
  console.log("Select component - current modelValue:", props.modelValue);

  emit("update:modelValue", option.value);
  console.log(
    "Select component - emitted update:modelValue with:",
    option.value
  );

  emit("change", option);
  console.log("Select component - emitted change with:", option);

  closeDropdown();
  console.log("Select component - dropdown closed");
};
```

### **3. Watch Function (Debug Only)**

```javascript
// Watch for changes in the selected time period (debugging only)
watch(
  () => selectedTimePeriod.value,
  (newValue, oldValue) => {
    console.log("selectedTimePeriod watch triggered:", {
      newValue,
      oldValue,
      isUpdatingProgrammatically: isUpdatingProgrammatically.value,
    });

    // Don't handle here to avoid double processing with @change
    // This is just for debugging
  }
);
```

### **4. Test Component**

Created `CustomRangeDebug.vue` for isolated testing:

- **Event Logging** - Track all Select component events
- **State Monitoring** - Real-time selectedTimePeriod display
- **Visual Feedback** - Show/hide custom date inputs
- **Manual Testing** - Test buttons for different scenarios

## 🔍 **Debug Process**

### **Step 1: Test with CustomRangeDebug.vue**

1. Open `CustomRangeDebug.vue` in browser
2. Try selecting "Custom Range"
3. Watch event log for sequence
4. Check if custom date inputs appear

### **Step 2: Check Console Logs**

Expected sequence when selecting "Custom Range":

```
Select component - selectOption called with: {label: "Custom Range", value: "custom"}
Select component - current modelValue: [current_value]
Select component - emitted update:modelValue with: custom
Select component - emitted change with: {label: "Custom Range", value: "custom"}
Select component - dropdown closed
Select @change triggered with: custom
Current selectedTimePeriod before: [old_value]
Handling custom range selection
selectedTimePeriod after: custom
selectedTimePeriod watch triggered: {newValue: "custom", oldValue: [old_value]}
```

### **Step 3: Check WorklogFilters**

1. Open WorklogFilters component
2. Try selecting "Custom Range"
3. Watch debug comment: `<!-- Debug: {{ selectedTimePeriod }} -->`
4. Check if custom date inputs appear

## 🎯 **Potential Issues to Investigate**

### **1. Event Timing**

```javascript
// Check if update:modelValue happens before @change
// Or if there's a delay between them
```

### **2. v-model Binding**

```javascript
// Check if v-model="selectedTimePeriod" is working correctly
// Verify ref() reactivity
```

### **3. Component State**

```javascript
// Check if Select component internal state conflicts
// Verify dropdown closing doesn't reset selection
```

### **4. Tooltip Interference**

```javascript
// Check if TruncateText component tooltip interferes
// Test without tooltip to isolate issue
```

### **5. Double Processing**

```javascript
// Check if both @change and watch are processing
// Verify isUpdatingProgrammatically flag works
```

## 📋 **Test Scenarios**

### **✅ Test Case 1: Isolated Component**

- Use `CustomRangeDebug.vue`
- Select "Custom Range"
- **Expected:** Custom date inputs appear immediately

### **✅ Test Case 2: WorklogFilters**

- Open filter panel
- Select "Custom Range"
- **Expected:** Custom date inputs appear, selectedTimePeriod shows "custom"

### **✅ Test Case 3: Console Logs**

- Check browser console during selection
- **Expected:** Complete event sequence without errors

### **✅ Test Case 4: Programmatic Selection**

- Use "Force Custom" button in debug component
- **Expected:** Custom mode activates correctly

## 🔧 **Next Steps**

1. **Test CustomRangeDebug.vue** - Isolate the issue
2. **Check console logs** - Verify event sequence
3. **Test tooltip interference** - Disable TruncateText temporarily
4. **Check Select component** - Verify internal state management
5. **Test timing** - Add delays/nextTick where needed

The debug setup should help identify exactly where the custom range selection is failing! 🎯
