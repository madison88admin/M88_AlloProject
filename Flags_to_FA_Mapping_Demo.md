# Flags to Factory Assignment Mapping
## How It Works

---

## 🎯 **The Functionality**

When you press "YES" in the Flags section, it automatically updates the corresponding Factory Assignment field.

### **Mapping Table**

| Flags Column | Factory Assignment Column | Display Name |
|--------------|---------------------------|--------------|
| `wuxi_moretti` | `fa_wuxi` | Wuxi |
| `hz_u_jump` | `fa_hz_u` | HZ-U |
| `pt_u_jump` | `fa_pt_uwu` | PT-UWU |
| `korea_mel` | `fa_korea_m` | Korea-M |
| `singfore` | `fa_singfore` | Singfore |
| `heads_up` | `fa_heads_up` | Heads Up |

---

## 🔄 **How It Works**

### **Step 1: User Clicks "YES" in Flags**
- User clicks on a Flags column (e.g., `wuxi_moretti`)
- Value changes to "Yes"

### **Step 2: System Automatically Updates FA**
- The `handleCellUpdate` function is triggered
- It calls `updateFAAssignments()` function
- The corresponding FA field is automatically set

### **Step 3: Real-time Update**
- The Factory Assignment field shows the factory name
- Changes are saved to the database
- All users see the updated data

---

## 💡 **Example Scenarios**

### **Scenario 1: Assign Brand to Wuxi**
1. **Flags**: `wuxi_moretti` = "Yes"
2. **Result**: `fa_wuxi` = "Wuxi"
3. **User sees**: Factory Assignment shows "Wuxi"

### **Scenario 2: Remove Brand from Singfore**
1. **Flags**: `singfore` = "" (blank)
2. **Result**: `fa_singfore` = "" (blank)
3. **User sees**: Factory Assignment is cleared

### **Scenario 3: Multiple Factory Assignments**
1. **Flags**: `wuxi_moretti` = "Yes", `korea_mel` = "Yes"
2. **Result**: `fa_wuxi` = "Wuxi", `fa_korea_m` = "Korea-M"
3. **User sees**: Both factory assignments are populated

---

## 🛠️ **Technical Implementation**

### **Code Location**
- **Mapping**: `src/utils/faAssignments.ts`
- **Logic**: `src/App.tsx` (handleCellUpdate function)
- **Trigger**: When any Flags column is updated

### **Key Functions**
```typescript
// 1. Check if column is a factory column
isFactoryColumn(columnKey)

// 2. Update FA assignments based on Flags
updateFAAssignments(updatedRecord)

// 3. Save the updated record
handleSaveRecord(finalRecord)
```

---

## ✅ **Benefits**

### **For Users**
- **One-click assignment**: Just click "YES" in Flags
- **Automatic updates**: No manual data entry needed
- **Real-time sync**: Changes appear immediately
- **Error prevention**: Reduces manual data entry errors

### **For Business**
- **Consistent data**: Flags and FA assignments always match
- **Efficient workflow**: Faster brand-to-factory assignments
- **Data integrity**: Prevents mismatched assignments
- **Audit trail**: All changes are logged

---

## 🎯 **Demo for Management**

### **Show This Flow:**
1. **Open a brand record**
2. **Click "YES" in any Flags column** (e.g., Wuxi Moretti)
3. **Watch the Factory Assignment update automatically** (FA Wuxi shows "Wuxi")
4. **Click blank to remove** - watch it clear automatically
5. **Try multiple factories** - see all assignments update

### **Key Talking Points:**
- **"One click does everything"** - No manual data entry
- **"Always in sync"** - Flags and FA assignments match
- **"Real-time updates"** - Changes appear immediately
- **"Error-proof"** - Can't have mismatched data

---

## 🚀 **Ready to Use**

The functionality is **already implemented** and **ready to use**! 

- ✅ Mapping is correctly configured
- ✅ Logic is working in the system
- ✅ Real-time updates are enabled
- ✅ Database saves changes automatically

**Just test it by clicking "YES" in any Flags column and watch the Factory Assignment update automatically!**
