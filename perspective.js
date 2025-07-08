const axios = require('axios');
const { perspective_Key } = require("./config.json");

const attributeThresholds = {
    'INSULT': 0.75,
    'TOXICITY': 0.75,
    'SPAM': 0.75,
    'INCOHERENT': 0.75,
    'FLIRTATION': 0.75,
};

async function analyzeText(text) {
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspective_Key}`;

    const requestedAttributes = {};
    for (const key in attributeThresholds) {
        requestedAttributes[key] = {};
    }

    const reqBody = {
        comment: { text },
        languages: ['en'],
        requestedAttributes: requestedAttributes
    };

    try {
        const res = await axios.post(url, reqBody);
        const scores = res.data.attributeScores;

        const result = {};
        for (const key in scores) {
            const score = scores[key].summaryScore.value;
            result[key] = score >= attributeThresholds[key];
        }
        return result;
    } catch (error) {
        console.error("Perspective API error:", error.response?.data || error.message);
        return {};
    }
}

module.exports.analyzeText = analyzeText;
