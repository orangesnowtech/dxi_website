# Reset All Concept Reactions

To reset all concept reactions to zero, run this command in your browser console on any page:

```javascript
// Clear all concept reaction localStorage items
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.startsWith('concept_reaction_') || key.startsWith('concept_counts_'))) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(key => localStorage.removeItem(key));
console.log(`Reset ${keysToRemove.length} reaction items. Please refresh the page.`);
```

Or visit: `/api/concepts/reset-reactions` (POST request)

