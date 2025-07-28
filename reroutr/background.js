// reroutr background.js (no longer needed for request interception)
// Helper to update dynamic redirect rules for declarativeNetRequest

// This can be called from options.js after rules are changed
async function updateRedirectRules(rules) {
  // Remove all previous dynamic rules
  const removeRuleIds = rules.map((_, i) => i + 1);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules.map((rule, idx) => ({
      id: idx + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { url: `https://${rule.to}/` },
      },
      condition: {
        urlFilter: rule.from,
        resourceTypes: ["main_frame"],
      },
    })),
  });
}
