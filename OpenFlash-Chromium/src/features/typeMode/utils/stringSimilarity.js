export const preprocessString = (str, settings) => {
  if (!str) return "";
  let s = str;
  if (!settings.uppercase) s = s.toLowerCase();
  if (!settings.punctuation) s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  if (!settings.special) {
      s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  return s.trim().replace(/\s+/g, ' ');
};

export const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
          } else {
              matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
          }
      }
  }
  return matrix[b.length][a.length];
};

export const calculateSimilarity = (str1, str2, settings) => {
  const s1 = preprocessString(str1, settings);
  const s2 = preprocessString(str2, settings);
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  const distance = getLevenshteinDistance(s1, s2);
  const longestLength = Math.max(s1.length, s2.length);
  return (longestLength - distance) / longestLength;
};

export const isAnswerCorrect = (userInput, targetText, settings) => {
  const similarity = calculateSimilarity(userInput, targetText, settings.grading);
  
  let threshold = 0.85; // Medium
  if (settings.grading.difficulty === 'easy') threshold = 0.75;
  if (settings.grading.difficulty === 'hard') threshold = 1.0;

  return similarity >= threshold;
};
