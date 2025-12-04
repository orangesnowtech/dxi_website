// Script to reset all concept reactions to zero
// Run this in your browser console on the concepts page to reset all localStorage reactions

if (typeof window !== 'undefined') {
  // Clear all concept reaction localStorage items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('concept_reaction_') || key.startsWith('concept_counts_'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Removed ${keysToRemove.length} reaction items from localStorage`);
  console.log('All reactions have been reset to zero. Please refresh the page.');
}

