// reroutr options.js

// Helper to update dynamic redirect rules for declarativeNetRequest
async function updateRedirectRules(rules) {
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

document.addEventListener("DOMContentLoaded", () => {
  const rulesList = document.getElementById("rulesList");
  const addRuleForm = document.getElementById("addRuleForm");
  const fromInput = document.getElementById("fromInput");
  const toInput = document.getElementById("toInput");

  function renderRules(rules) {
    rulesList.innerHTML = "";
    rules.forEach((rule, idx) => {
      const li = document.createElement("li");
      li.textContent = `${rule.from} → ${rule.to}`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", async () => {
        rules.splice(idx, 1);
        saveRules(rules);
        await updateRedirectRules(rules);
      });
      li.appendChild(delBtn);
      rulesList.appendChild(li);
    });
    if (rules.length === 0) {
      rulesList.innerHTML = "<li>No rules yet.</li>";
    }
  }

  function saveRules(rules) {
    chrome.storage.sync.set({ rerouteRules: rules }, async () => {
      renderRules(rules);
      await updateRedirectRules(rules);
    });
  }

  function loadRules() {
    chrome.storage.sync.get(["rerouteRules"], (result) => {
      renderRules(result.rerouteRules || []);
    });
  }

  addRuleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    if (!from || !to) return;
    chrome.storage.sync.get(["rerouteRules"], async (result) => {
      const rules = result.rerouteRules || [];
      rules.push({ from, to });
      chrome.storage.sync.set({ rerouteRules: rules }, async () => {
        fromInput.value = "";
        toInput.value = "";
        renderRules(rules);
        await updateRedirectRules(rules);
      });
    });
  });

  loadRules();
});
