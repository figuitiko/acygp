/**
 * ACyGP Google Forms Knowledge Evaluations webhook sender.
 *
 * Setup:
 * 1. Open the Google Form > Extensions > Apps Script.
 * 2. Set script properties:
 *    - ACYGP_WEBHOOK_URL=https://your-domain.com/api/integrations/google-forms/submissions
 *    - ACYGP_WEBHOOK_SECRET=<same value as GOOGLE_FORMS_WEBHOOK_SECRET>
 * 3. Add an installable trigger:
 *    - Function: sendAcygpEvaluationSubmission
 *    - Event source: From form
 *    - Event type: On form submit
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sendAcygpEvaluationSubmission(event) {
  const response = event.response;
  const form = FormApp.getActiveForm();
  const properties = PropertiesService.getScriptProperties();
  const webhookUrl = properties.getProperty("ACYGP_WEBHOOK_URL");
  const webhookSecret = properties.getProperty("ACYGP_WEBHOOK_SECRET");

  if (!webhookUrl || !webhookSecret) {
    throw new Error(
      "ACYGP_WEBHOOK_URL and ACYGP_WEBHOOK_SECRET script properties are required.",
    );
  }

  const gradableResponses = response.getGradableItemResponses
    ? response.getGradableItemResponses()
    : [];
  const scoreByItemId = {};
  gradableResponses.forEach(function (itemResponse) {
    const item = itemResponse.getItem();
    scoreByItemId[item.getId().toString()] = {
      score: itemResponse.getScore(),
      maxScore: getItemPoints(item),
    };
  });

  const answers = response.getItemResponses().map(function (itemResponse) {
    const item = itemResponse.getItem();
    const itemId = item.getId().toString();
    const answer = itemResponse.getResponse();
    const score = scoreByItemId[itemId] || { score: null, maxScore: null };

    return {
      itemId: itemId,
      title: item.getTitle(),
      answer: Array.isArray(answer) ? answer.map(String) : String(answer || ""),
      score: score.score,
      maxScore: score.maxScore,
    };
  });

  const payload = {
    form: {
      id: form.getId(),
      title: form.getTitle(),
    },
    response: {
      id: response.getId(),
      submittedAt: response.getTimestamp().toISOString(),
      respondentEmail: response.getRespondentEmail
        ? response.getRespondentEmail()
        : null,
      score: response.getScore ? response.getScore() : null,
      maxScore:
        answers.reduce(function (total, answer) {
          return answer.maxScore === null ? total : total + answer.maxScore;
        }, 0) || null,
    },
    answers: answers,
  };

  postWithRetries(webhookUrl, webhookSecret, payload, 3);
}

function postWithRetries(url, secret, payload, attempts) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        headers: {
          "x-acygp-webhook-secret": secret,
        },
      });
      const status = response.getResponseCode();

      if (status >= 200 && status < 300) {
        return;
      }

      if (status < 500) {
        throw new Error(
          "Permanent ACyGP webhook failure: HTTP " +
            status +
            " " +
            response.getContentText(),
        );
      }

      lastError = new Error(
        "Temporary ACyGP webhook failure: HTTP " +
          status +
          " " +
          response.getContentText(),
      );
    } catch (error) {
      lastError = error;
    }

    Utilities.sleep(1000 * attempt);
  }

  throw lastError;
}

function getItemPoints(item) {
  try {
    return typeof item.getPoints === "function" ? item.getPoints() : null;
  } catch {
    return null;
  }
}
