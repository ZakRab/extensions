// reroutr background.js (no longer needed for request interception)
// Helper to update dynamic redirect rules for declarativeNetRequest

// This can be called from options.js after rules are changed
async function updateRedirectRules(rules) {
  // First, get all existing dynamic rules and remove them
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((rule) => rule.id);

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

// Initialize rules when extension starts or reloads
chrome.runtime.onStartup.addListener(initializeRules);
chrome.runtime.onInstalled.addListener(initializeRules);

async function initializeRules() {
  chrome.storage.sync.get(["rerouteRules"], async (result) => {
    const rules = result.rerouteRules || [];
    await updateRedirectRules(rules);
  });
}
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
