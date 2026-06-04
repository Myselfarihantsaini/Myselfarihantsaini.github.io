(function () {
  function matchRule(rules, category) {
    var node = rules && rules.rules && rules.rules[category];
    for (var i = 2; i < arguments.length; i++) {
      node = node && typeof node === "object" ? node[String(arguments[i])] : null;
      if (!node) return null;
    }
    return node;
  }

  function chartFacts(chart) {
    var bc = (chart && chart.birth_chart) || {};
    var facts = [];
    if (bc.lagna) facts.push("Lagna is " + bc.lagna + ".");
    if (bc.moon_sign) facts.push("Moon sign is " + bc.moon_sign + ".");
    if (bc.moon_nakshatra) facts.push("Moon Nakshatra is " + bc.moon_nakshatra + ".");
    Object.keys(bc.planets || {}).forEach(function (planet) {
      var data = bc.planets[planet] || {};
      var pieces = [];
      if (data.sign) pieces.push("in " + data.sign);
      if (data.house) pieces.push("in house " + data.house);
      if (data.nakshatra) pieces.push("in " + data.nakshatra + " Nakshatra");
      if (pieces.length) facts.push(planet + " is " + pieces.join(", ") + ".");
    });
    var dasha = bc.current_dasha || {};
    if (dasha.mahadasha) facts.push("Current Mahadasha is " + dasha.mahadasha + ".");
    if (dasha.antardasha) facts.push("Current Antardasha is " + dasha.antardasha + ".");
    return facts;
  }

  var SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  var SIGN_LORDS = {
    Aries: "Mars",
    Taurus: "Venus",
    Gemini: "Mercury",
    Cancer: "Moon",
    Leo: "Sun",
    Virgo: "Mercury",
    Libra: "Venus",
    Scorpio: "Mars",
    Sagittarius: "Jupiter",
    Capricorn: "Saturn",
    Aquarius: "Saturn",
    Pisces: "Jupiter"
  };
  var OWN_SIGNS = {
    Sun: ["Leo"],
    Moon: ["Cancer"],
    Mars: ["Aries", "Scorpio"],
    Mercury: ["Gemini", "Virgo"],
    Jupiter: ["Sagittarius", "Pisces"],
    Venus: ["Taurus", "Libra"],
    Saturn: ["Capricorn", "Aquarius"],
    Rahu: [],
    Ketu: []
  };
  var EXALTATION = {
    Sun: "Aries",
    Moon: "Taurus",
    Mars: "Capricorn",
    Mercury: "Virgo",
    Jupiter: "Cancer",
    Venus: "Pisces",
    Saturn: "Libra"
  };
  var DEBILITATION = {
    Sun: "Libra",
    Moon: "Scorpio",
    Mars: "Cancer",
    Mercury: "Pisces",
    Jupiter: "Capricorn",
    Venus: "Virgo",
    Saturn: "Aries"
  };
  var NATURAL_BENEFICS = ["Jupiter", "Venus", "Mercury", "Moon"];
  var NATURAL_PRESSURE = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"];

  var FALLBACK_FRAMEWORK = {
    method: {
      core_principle: "No prediction should be made from one placement alone. D1 promise, divisional confirmation, dasha activation and transit trigger must be checked together.",
      sequence: ["D1 promise", "house lord and karaka strength", "relevant varga", "dasha", "transit", "final strength grading"],
      ethical_rule: "Use caution language and avoid fear-based claims."
    },
    topics: {
      career: { label: "Career", primary_houses: [10], supporting_houses: [1, 2, 6, 7, 11], karakas: ["Sun", "Saturn", "Mercury", "Jupiter"], vargas: ["D10"], timing: ["10th lord dasha", "6th/10th/11th activation", "Saturn/Jupiter transit"], practical_guidance: "Build skill, discipline, networking and long-term consistency." },
      marriage: { label: "Marriage", primary_houses: [7], supporting_houses: [2, 4, 8, 11, 12], karakas: ["Venus", "Jupiter"], vargas: ["D9"], timing: ["7th lord dasha", "Venus/Jupiter periods", "Jupiter/Saturn transit"], practical_guidance: "Develop emotional maturity, boundaries and realistic expectations." },
      wealth: { label: "Wealth", primary_houses: [2, 11], supporting_houses: [5, 6, 8, 9, 10], karakas: ["Jupiter", "Venus", "Mercury", "Moon", "Saturn"], vargas: ["D2", "D9"], timing: ["2nd/11th lord dasha", "Jupiter transit"], practical_guidance: "Strengthen budgeting, saving, documentation and ethical earning." },
      health: { label: "Health", primary_houses: [1, 6, 8, 12], supporting_houses: [4], karakas: ["Sun", "Moon", "Mars", "Saturn"], vargas: ["D30", "D1"], timing: ["Lagna lord periods", "6th/8th/12th activation"], practical_guidance: "Use routine, sleep discipline and timely medical check-ups. Astrology does not replace medical care." },
      property: { label: "Property", primary_houses: [4], supporting_houses: [2, 6, 8, 11, 12], karakas: ["Moon", "Mars", "Venus"], vargas: ["D4"], timing: ["4th lord dasha", "Mars/Moon/Venus periods"], practical_guidance: "Check documents, legal clarity, loan capacity and family needs." },
      children: { label: "Children", primary_houses: [5], supporting_houses: [2, 8, 9, 11, 12], karakas: ["Jupiter", "Moon", "Venus"], vargas: ["D7"], timing: ["5th lord dasha", "Jupiter periods"], practical_guidance: "Use patient language and confirm with D7, health context and dasha." },
      foreign_settlement: { label: "Foreign / Travel", primary_houses: [12], supporting_houses: [3, 4, 7, 9], karakas: ["Rahu", "Moon", "Saturn", "Jupiter"], vargas: ["D9", "D10", "D4"], timing: ["12th/9th lord dasha", "Rahu/Jupiter/Saturn transit"], practical_guidance: "Prepare documents, credentials, visa strategy and financial planning." },
      current_dasha: { label: "Current Dasha", primary_houses: [], supporting_houses: [1, 2, 6, 7, 8, 9, 10, 11, 12], karakas: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"], vargas: ["Relevant varga by topic"], timing: ["Mahadasha", "Antardasha", "Pratyantardasha"], practical_guidance: "A dasha cannot give what the birth chart does not promise." },
      yearly_prediction: { label: "Yearly Prediction", primary_houses: [], supporting_houses: [1, 4, 5, 7, 9, 10, 11, 12], karakas: ["Jupiter", "Saturn", "Rahu", "Ketu"], vargas: ["D1", "relevant varga"], timing: ["current dasha", "annual transit"], practical_guidance: "Read the year as activation of natal promise, not a replacement for it." }
    },
    strength_language: {
      strong: "D1 promise, divisional confirmation, dasha and transit align for this topic.",
      moderate: "The chart shows workable support; results need effort, timing and maturity.",
      mixed: "The chart contains both support and pressure.",
      caution: "This area requires careful handling and practical discipline.",
      insufficient: "One factor alone is not enough for a firm prediction."
    },
    rules: []
  };

  function topicKey(topic) {
    if (!topic || topic === "general") return "general";
    if (topic === "foreign") return "foreign_settlement";
    if (topic === "yearly") return "yearly_prediction";
    return topic;
  }

  function signIndex(sign) {
    return SIGNS.indexOf(sign);
  }

  function houseSign(lagna, house) {
    var start = signIndex(lagna);
    if (start < 0 || !house) return "";
    return SIGNS[(start + Number(house) - 1 + 12) % 12];
  }

  function planetInHouse(planets, house) {
    return Object.keys(planets || {}).filter(function (p) {
      return Number((planets[p] || {}).house) === Number(house);
    });
  }

  function planetStrength(planet, data) {
    var sign = data && data.sign;
    if (!sign) return "unknown";
    if (EXALTATION[planet] === sign) return "exalted";
    if ((OWN_SIGNS[planet] || []).indexOf(sign) !== -1) return "own sign";
    if (DEBILITATION[planet] === sign) return "debilitated";
    if (data.combust) return "combust";
    if (data.retrograde) return "retrograde";
    return "ordinary";
  }

  function buildPredictionLayer(chart, topic, data) {
    var framework = data.predictionFramework || data.prediction_framework || FALLBACK_FRAMEWORK;
    var key = topicKey(topic);
    var bc = (chart && chart.birth_chart) || {};
    var planets = bc.planets || {};
    var topicDef = key === "general" ? null : (framework.topics && framework.topics[key]);
    var dasha = bc.current_dasha || {};
    var rows = [];
    var supports = 0;
    var pressures = 0;
    var dashaHits = [];

    if (topicDef) {
      (topicDef.primary_houses || []).concat(topicDef.supporting_houses || []).forEach(function (house) {
        var sign = houseSign(bc.lagna, house);
        var lord = SIGN_LORDS[sign] || "";
        var lordData = planets[lord] || {};
        var occupants = planetInHouse(planets, house);
        var pressurePlanets = occupants.filter(function (p) { return NATURAL_PRESSURE.indexOf(p) !== -1; });
        var supportPlanets = occupants.filter(function (p) { return NATURAL_BENEFICS.indexOf(p) !== -1; });
        if (supportPlanets.length) supports += supportPlanets.length;
        if (pressurePlanets.length) pressures += pressurePlanets.length;
        if (lord && ["exalted", "own sign"].indexOf(planetStrength(lord, lordData)) !== -1) supports += 1;
        if (lordData.combust || planetStrength(lord, lordData) === "debilitated") pressures += 1;
        rows.push({
          house: house,
          sign: sign,
          lord: lord,
          lord_strength: lord ? planetStrength(lord, lordData) : "unknown",
          lord_house: lordData.house || "",
          occupants: occupants
        });
      });

      ["mahadasha", "antardasha", "pratyantardasha"].forEach(function (level) {
        var lord = dasha[level];
        var p = lord && planets[lord];
        if (!lord || !p) return;
        if ((topicDef.karakas || []).indexOf(lord) !== -1) {
          dashaHits.push(lord + " " + level + " is a topic karaka.");
          supports += 1;
        }
        if ((topicDef.primary_houses || []).concat(topicDef.supporting_houses || []).indexOf(Number(p.house)) !== -1) {
          dashaHits.push(lord + " " + level + " sits in house " + p.house + ", connected to this focus.");
          supports += 1;
        }
      });
    }

    var totalChecks = (topicDef ? (topicDef.primary_houses || []).length + (topicDef.supporting_houses || []).length : 0) + 3;
    var grade = "insufficient";
    if (topicDef) {
      if (supports >= 5 && supports > pressures + 1) grade = "strong";
      else if (supports >= 3 && supports >= pressures) grade = "moderate";
      else if (supports >= 2 && pressures >= 2) grade = "mixed";
      else if (pressures > supports) grade = "caution";
      else grade = "preparation";
    }

    var rules = (framework.rules || []).filter(function (rule) {
      return rule.topic === "all" || rule.topic === key;
    }).slice(0, 5);

    return {
      key: key,
      topic: topicDef,
      method: framework.method || FALLBACK_FRAMEWORK.method,
      rows: rows,
      dasha_hits: uniq(dashaHits, 6),
      supports: supports,
      pressures: pressures,
      total_checks: totalChecks,
      grade: grade,
      grade_text: (framework.strength_language || {})[grade] || (framework.strength_language || {}).insufficient || "",
      framework_rules: rules
    };
  }

  function runEngine(chart, topic, data) {
    var rules = data.rules || {};
    var topicMatrix = data.topicMatrix || data.topic_matrix || {};
    var config = data.config || data.model_config || {};
    var bc = (chart && chart.birth_chart) || {};
    var matches = [];
    var score = 0;

    Object.keys(bc.planets || {}).forEach(function (planet) {
      var p = bc.planets[planet] || {};
      [
        ["planet_in_sign", p.sign, "sign"],
        ["planet_in_house", p.house, "house"],
        ["planet_in_nakshatra", p.nakshatra, "nakshatra"]
      ].forEach(function (item) {
        var r = matchRule(rules, item[0], planet, item[1]);
        if (r) {
          var m = { type: item[0], planet: planet, rule: r };
          m[item[2]] = item[1];
          matches.push(m);
          score += r.confidence_weight || 0;
        }
      });

      ["combust", "retrograde"].forEach(function (modifier) {
        if (p[modifier] === true) {
          var mod = rules.rules && rules.rules.modifiers && rules.rules.modifiers[modifier];
          if (mod) {
            matches.push({ type: "modifier", planet: planet, modifier: modifier, rule: mod });
            score += mod.confidence_weight || 0;
          }
        }
      });
    });

    var dasha = bc.current_dasha || {};
    [["mahadasha", dasha.mahadasha], ["antardasha", dasha.antardasha]].forEach(function (item) {
      var r = item[1] && matchRule(rules, "dasha_lord", item[1], "general");
      if (r) {
        matches.push({ type: item[0], planet: item[1], rule: r });
        score += r.confidence_weight || 0;
      }
    });

    var topicGuidance = topic ? topicMatrix[topic] : null;
    var confidence = "preliminary";
    if (score >= 80) confidence = "conditional-moderate";
    if (score >= 120 && topicGuidance) confidence = "moderate-after-confirmation";

    return {
      chart_setup: chart.chart_system || {},
      topic: topic,
      facts: chartFacts(chart),
      matched_rule_count: matches.length,
      score: score,
      confidence: confidence,
      topic_guidance: topicGuidance,
      matches: matches,
      prediction_layer: buildPredictionLayer(chart, topic, data),
      safety_rules: config.safety_rules || [],
      final_instruction: "Use matches as a deterministic research layer. Do not issue final predictions unless natal promise, dasha and transit are all checked."
    };
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function uniq(items, limit) {
    var out = [];
    (items || []).forEach(function (item) {
      if (item && out.indexOf(item) === -1) out.push(item);
    });
    return out.slice(0, limit || 8);
  }

  function ruleContext(match) {
    if (match.type === "planet_in_sign") return "sign";
    if (match.type === "planet_in_house") return "house";
    if (match.type === "planet_in_nakshatra") return "nakshatra";
    if (match.type === "mahadasha" || match.type === "antardasha") return "dasha";
    return match.modifier || match.type;
  }

  function renderList(items, fallback) {
    items = uniq(items, 7);
    if (!items.length && fallback) items = [fallback];
    return "<ul class=\"rd-list\">" + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }

  function renderPredictionLayer(layer) {
    if (!layer || !layer.topic) {
      var method = (layer && layer.method) || FALLBACK_FRAMEWORK.method;
      return "<div class=\"rd-h\">Prediction Method</div>" +
        "<p class=\"rd-note\">" + esc(method.core_principle) + "</p>" +
        renderList(method.sequence || [], "Start with D1, confirm with divisional charts, then judge dasha and transit together.");
    }
    var topic = layer.topic;
    var html = "";
    html += "<div class=\"rd-h\">Prediction Layer</div>";
    html += "<div class=\"rd-grade rd-grade-" + esc(layer.grade || "insufficient") + "\">" +
      "<span>" + esc((topic.label || layer.key || "Focus") + " strength") + "</span>" +
      "<b>" + esc(layer.grade || "insufficient") + "</b>" +
      "</div>";
    html += "<p class=\"rd-note\">" + esc(topic.meaning || "") + "</p>";
    if (layer.grade_text) html += "<p class=\"rd-call\">" + esc(layer.grade_text) + "</p>";

    html += "<div class=\"rd-h\">Applied House Check</div>";
    if (layer.rows && layer.rows.length) {
      html += "<div class=\"rd-table\"><table><thead><tr><th>House</th><th>Sign</th><th>Lord</th><th>Lord status</th><th>Occupants</th></tr></thead><tbody>";
      layer.rows.slice(0, 10).forEach(function (row) {
        html += "<tr><td>" + esc(row.house) + "</td><td>" + esc(row.sign || "-") + "</td><td>" + esc(row.lord || "-") + "</td><td>" +
          esc(row.lord_strength || "-") + (row.lord_house ? " in house " + esc(row.lord_house) : "") + "</td><td>" +
          esc((row.occupants || []).join(", ") || "-") + "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    html += "<div class=\"rd-h\">Dasha Activation</div>";
    html += renderList(layer.dasha_hits, "Current dasha is not directly enough by itself; final timing still needs dasha, D1 and transit agreement.");

    html += "<div class=\"rd-h\">Confirmation Gates</div><ul class=\"rd-list\">";
    html += "<li>Primary houses: " + esc((topic.primary_houses || []).join(", ") || "depends on selected topic") + "</li>";
    html += "<li>Supporting houses: " + esc((topic.supporting_houses || []).join(", ") || "depends on selected topic") + "</li>";
    html += "<li>Karakas: " + esc((topic.karakas || []).join(", ") || "-") + "</li>";
    html += "<li>Divisional chart confirmation: " + esc((topic.vargas || []).join(", ") || "-") + "</li>";
    html += "<li>Timing checks: " + esc((topic.timing || []).join(", ") || "-") + "</li>";
    html += "</ul>";

    if (layer.framework_rules && layer.framework_rules.length) {
      html += "<div class=\"rd-h\">Framework Rules</div><ul class=\"rd-list\">";
      layer.framework_rules.forEach(function (rule) {
        html += "<li><span class=\"rd-kind\">" + esc(rule.layer || "rule") + "</span>" + esc(rule.tool_output || rule.condition || "") + "</li>";
      });
      html += "</ul>";
    }

    if (topic.practical_guidance) {
      html += "<div class=\"rd-h\">Practical Guidance</div><p class=\"rd-call\">" + esc(topic.practical_guidance) + "</p>";
    }
    return html;
  }

  function renderReadingHTML(result, topic) {
    var positives = [];
    var challenges = [];
    var confirmations = [];
    var planetBlocks = [];
    var byPlanet = {};
    var selected = result.matches.slice(0, 18);

    selected.forEach(function (match) {
      var rule = match.rule || {};
      (rule.positive_results || []).slice(0, 1).forEach(function (x) { positives.push(x); });
      (rule.challenging_results || []).slice(0, 1).forEach(function (x) { challenges.push(x); });
      (rule.required_confirmations || []).slice(0, 2).forEach(function (x) { confirmations.push(x); });
      if (!byPlanet[match.planet]) byPlanet[match.planet] = [];
      byPlanet[match.planet].push(match);
    });

    Object.keys(byPlanet).slice(0, 9).forEach(function (planet) {
      var lines = byPlanet[planet].slice(0, 3).map(function (match) {
        var rule = match.rule || {};
        return "<div class=\"rd-planet\"><span class=\"rd-kind\">" + esc(ruleContext(match)) + "</span>" +
          esc(rule.fact || rule.core_meaning || "") +
          (rule.core_meaning ? "<div class=\"rd-sub\">" + esc(rule.core_meaning) + "</div>" : "") +
          "</div>";
      }).join("");
      planetBlocks.push("<div class=\"rd-pname\">" + esc(planet) + "</div>" + lines);
    });

    var guidance = result.topic_guidance || {};
    var checks = []
      .concat(guidance.do_not_predict_without || [])
      .concat(confirmations)
      .concat(result.safety_rules || []);

    var tag = topic && topic !== "general" ? topic : "general";
    var html = "";
    html += "<div class=\"rd-head\">Deterministic Chart Reading <span class=\"rd-tag\">" + esc(tag) + "</span></div>";
    html += "<p class=\"rd-note\">This is a rule-based Shambhavaa research layer: facts, tendencies and checks. It is not a final prediction without dasha, transit and divisional confirmation.</p>";
    html += "<div class=\"rd-meta\"><span>Matched rules: <b>" + result.matched_rule_count + "</b></span><span>Score: <b>" + result.score + "</b></span><span>Confidence: <b>" + esc(result.confidence) + "</b></span></div>";
    html += "<div class=\"rd-h\">Core facts</div>" + renderList(result.facts.slice(0, 10));
    html += "<div class=\"rd-h\">Supportive indications</div>" + renderList(positives, "No strong supportive rule was found yet; use the chart facts as the starting layer.");
    html += "<div class=\"rd-h\">Pressure points</div>" + renderList(challenges, "No major pressure rule was found in the first pass.");
    html += renderPredictionLayer(result.prediction_layer);
    html += "<div class=\"rd-h\">Planet-wise rule matches</div>" + (planetBlocks.join("") || "<p class=\"rd-note\">No planet rules matched.</p>");
    if (guidance.primary_houses || guidance.karakas || guidance.vargas) {
      html += "<div class=\"rd-h\">Topic gatekeeping</div>";
      html += "<ul class=\"rd-list\">";
      if (guidance.primary_houses) html += "<li>Primary houses to judge: " + esc(guidance.primary_houses.join(", ")) + "</li>";
      if (guidance.karakas) html += "<li>Karakas to check: " + esc(guidance.karakas.join(", ")) + "</li>";
      if (guidance.vargas) html += "<li>Divisional confirmation: " + esc(guidance.vargas.join(", ")) + "</li>";
      if (guidance.timing) html += "<li>Timing layer: " + esc(guidance.timing.join(", ")) + "</li>";
      html += "</ul>";
    }
    html += "<div class=\"rd-h\">Before final prediction</div><ul class=\"rd-list rd-safe\">" + uniq(checks, 10).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    return html;
  }

  window.KundliRuleEngine = {
    runEngine: runEngine,
    renderReadingHTML: renderReadingHTML,
    fallbackFramework: FALLBACK_FRAMEWORK
  };
})();
